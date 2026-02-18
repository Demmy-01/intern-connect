import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== Supabase Configuration ====================
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://hzawfhjzpvxqfgfdkjyb.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6YXdmaGp6cHZ4cWZnZmRranliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjYyMzA5MCwiZXhwIjoxNzQ4Mjc1MDkwfQ.7B7PmpPQl1gfJTGpCZZRDKuMPYz2VIX9ew8eAQGxhWs';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ==================== In-Memory Token Store ====================
// In production, this would be in a database
const userTokens = {};
const userTokenTransactions = {};

function getUserTokens(email) {
  const normalizedEmail = (email || 'default@user.com').toLowerCase().trim();
  if (!userTokens[normalizedEmail]) {
    userTokens[normalizedEmail] = 100; // Initial free tokens
  }
  return parseInt(userTokens[normalizedEmail], 10) || 100;
}

function setUserTokens(email, amount) {
  const normalizedEmail = (email || 'default@user.com').toLowerCase().trim();
  const numAmount = parseInt(amount, 10) || 0;
  userTokens[normalizedEmail] = numAmount;
  if (!userTokenTransactions[normalizedEmail]) {
    userTokenTransactions[normalizedEmail] = [];
  }
  userTokenTransactions[normalizedEmail].push({
    timestamp: new Date().toISOString(),
    amount: numAmount,
    note: 'Token purchase'
  });
  console.log(`💾 Set tokens for ${normalizedEmail}: ${numAmount}`);
  return numAmount;
}

function addUserTokens(email, amount) {
  const normalizedEmail = (email || 'default@user.com').toLowerCase().trim();
  const currentTokens = getUserTokens(normalizedEmail);
  const newBalance = currentTokens + amount;
  return setUserTokens(normalizedEmail, newBalance);
}

// ==================== Token Endpoints ====================

/**
 * GET /api/tokens/pricing - Get token pricing
 */
app.get('/api/tokens/pricing', (req, res) => {
  try {
    const pricing = {
      success: true,
      packages: [
        {
          name: 'Starter',
          tokens: 50,
          bonus: 10,
          price: 500,
        },
        {
          name: 'Professional',
          tokens: 150,
          bonus: 50,
          price: 1200,
        },
        {
          name: 'Enterprise',
          tokens: 500,
          bonus: 200,
          price: 3500,
        },
      ],
      costs: {
        AI_SUGGESTION: 20,
        ATS_ANALYSIS: 30,
        INITIAL_FREE_TOKENS: 100,
      },
    };

    return res.status(200).json(pricing);
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch pricing' 
    });
  }
});

/**
 * GET /api/tokens/balance - Get user's token balance
 */
app.get('/api/tokens/balance', (req, res) => {
  try {
    // Get email from query or header - normalize it
    const email = (req.query.email || req.headers['x-user-email'] || 'default@user.com').toLowerCase().trim();
    
    const balance = getUserTokens(email);
    console.log(`💰 Token balance for ${email}: ${balance}`);
    console.log(`📊 Current token store:`, userTokens);
    
    return res.status(200).json({ 
      success: true, 
      balance,
      email
    });
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch token balance' 
    });
  }
});

// ==================== Payment Endpoints ====================

/**
 * POST /api/payment/initialize - Initialize Paystack payment
 */
app.post('/api/payment/initialize', async (req, res) => {
  try {
    const { email, packageIndex, callbackUrl, userId } = req.body;

    if (!email || packageIndex === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing email or packageIndex' 
      });
    }

    // Pricing packages (must match frontend)
    const packages = [
      { name: 'Starter', tokens: 60, price: 500 },
      { name: 'Professional', tokens: 200, price: 1200 },
      { name: 'Enterprise', tokens: 700, price: 3500 },
    ];

    const selectedPackage = packages[packageIndex];
    if (!selectedPackage) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid package index' 
      });
    }

    // Get Paystack secret key from environment or use test key
    const payStackSecretKey = process.env.PAYSTACK_SECRET_KEY || 'sk_test_ca9f1c6bf19131cf466b8bf045f829b6806ea272';
    
    console.log(`💳 Payment initialization for ${email}: ${selectedPackage.name} (${selectedPackage.price} NGN)`);

    if (!payStackSecretKey) {
      // Return mock response for development
      console.warn('⚠️ PAYSTACK_SECRET_KEY not configured, returning mock payment URL');
      return res.status(200).json({
        success: true,
        mock: true,
        tokensAdded: selectedPackage.tokens,
        newBalance: 100 + selectedPackage.tokens,
        message: 'Mock payment mode - tokens will be added immediately'
      });
    }

    try {
      // Initialize Paystack transaction
      const paystackResponse = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount: selectedPackage.price * 100, // Convert to kobo
          metadata: {
            packageIndex,
            packageName: selectedPackage.name,
            tokens: selectedPackage.tokens,
            userId, // Store userId in metadata for later use
          },
          callback_url: callbackUrl || `${process.env.FRONTEND_URL || 'https://localhost:5173'}/cv-generator`,
        },
        {
          headers: {
            Authorization: `Bearer ${payStackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!paystackResponse.data.status) {
        return res.status(400).json({
          success: false,
          error: paystackResponse.data.message || 'Failed to initialize payment',
        });
      }

      return res.status(200).json({
        success: true,
        data: paystackResponse.data.data,
        message: 'Payment initialized successfully',
      });
    } catch (paystackError) {
      console.error('❌ Paystack error:', paystackError.response?.data?.message || paystackError.message);
      return res.status(400).json({
        success: false,
        error: paystackError.response?.data?.message || 'Payment initialization failed. Please try again.',
      });
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

/**
 * POST /api/payment/verify - Verify Paystack payment
 */
app.post('/api/payment/verify', async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing payment reference' 
      });
    }

    console.log(`🔍 Verifying payment reference: ${reference}`);

    const payStackSecretKey = process.env.PAYSTACK_SECRET_KEY || 'sk_test_ca9f1c6bf19131cf466b8bf045f829b6806ea272';

    try {
      // Verify payment with Paystack
      const verifyResponse = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${payStackSecretKey}`,
          },
        }
      );

      if (!verifyResponse.data.status) {
        console.error('❌ Paystack verification failed:', verifyResponse.data.message);
        return res.status(400).json({
          success: false,
          error: verifyResponse.data.message || 'Payment verification failed',
        });
      }

      const transactionData = verifyResponse.data.data;
      
      if (transactionData.status !== 'success') {
        console.warn(`⚠️ Payment not successful, status: ${transactionData.status}`);
        return res.status(400).json({
          success: false,
          error: 'Payment was not completed successfully',
          status: transactionData.status,
        });
      }

      const tokensAdded = transactionData.metadata?.tokens || 60;
      const email = (transactionData.customer?.email || '').toLowerCase().trim();
      const userId = transactionData.metadata?.userId; // Get userId from metadata
      
      // Update user's token balance (in-memory for backward compatibility)
      let newBalance = 100 + tokensAdded; // Default for non-auth users
      if (email) {
        newBalance = addUserTokens(email, tokensAdded);
      }
      
      // Save to Supabase if userId is available
      if (userId) {
        try {
          // Get current balance
          const { data: existingTokens, error: selectError } = await supabase
            .from('user_tokens')
            .select('balance, total_purchased')
            .eq('user_id', userId)
            .single();
          
          let currentBalance = existingTokens?.balance || 0;
          let currentPurchased = existingTokens?.total_purchased || 0;
          const newTokenBalance = currentBalance + tokensAdded;
          const newPurchased = currentPurchased + tokensAdded;
          
          // Upsert the user_tokens record (insert or update)
          const { data: upsertData, error: upsertError } = await supabase
            .from('user_tokens')
            .upsert({
              user_id: userId,
              balance: newTokenBalance,
              total_purchased: newPurchased,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })
            .select();
          
          if (upsertError) {
            console.error('❌ Error upserting tokens:', upsertError);
            throw upsertError;
          }
          
          // Log transaction
          const { error: transactionError } = await supabase
            .from('token_transactions')
            .insert([{
              user_id: userId,
              transaction_type: 'purchase',
              amount: tokensAdded,
              description: `Payment for ${transactionData.metadata?.packageName || 'tokens'}`,
              reference: reference,
              balance_after: newTokenBalance,
            }]);
          
          if (transactionError) {
            console.error('❌ Error logging transaction:', transactionError);
            throw transactionError;
          }
          
          // Update newBalance variable to send back to frontend
          newBalance = newTokenBalance;
          console.log(`✅ Tokens saved to Supabase for user ${userId}: ${currentBalance} + ${tokensAdded} = ${newTokenBalance}`);
        } catch (supabaseError) {
          console.warn('⚠️ Failed to save tokens to Supabase (continuing anyway):', supabaseError);
        }
      }
      
      console.log(`✅ Payment verified! Email: ${email}, Tokens added: ${tokensAdded}, New balance: ${newBalance}`);
      console.log(`💰 User tokens state:`, userTokens);
      
      return res.status(200).json({
        success: true,
        tokensAdded,
        newBalance,
        reference,
        email,
        message: 'Payment verified successfully',
        debugInfo: { userTokenState: userTokens[email] }
      });
    } catch (paystackError) {
      console.error('❌ Payment verification error:', paystackError.response?.data?.message || paystackError.message);
      return res.status(400).json({
        success: false,
        error: paystackError.response?.data?.message || 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

// ==================== AI Endpoints ====================

/**
 * POST /api/ai/suggest - Get AI suggestions for CV content
 */
app.post('/api/ai/suggest', async (req, res) => {
  try {
    const { content, section = 'general', userId = null, email = 'default@user.com' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content is required' 
      });
    }

    const tokenCost = 20;
    let currentBalance = 0;
    let supabaseError = false;

    // Try to get balance from Supabase if userId is provided
    if (userId) {
      try {
        const { data, error } = await supabase
          .from('user_tokens')
          .select('balance')
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          currentBalance = data.balance || 0;
          console.log(`💰 Loaded balance from Supabase for user ${userId}: ${currentBalance}`);
        } else {
          // Fall back to in-memory
          supabaseError = true;
          currentBalance = getUserTokens(email);
          console.warn(`⚠️ Failed to load from Supabase, using in-memory: ${currentBalance}`);
        }
      } catch (err) {
        supabaseError = true;
        currentBalance = getUserTokens(email);
        console.warn(`⚠️ Supabase error, falling back to in-memory: ${err.message}`);
      }
    } else {
      // Fall back to email-based in-memory tracking
      currentBalance = getUserTokens(email);
    }
    
    // Check if user has enough tokens
    if (currentBalance < tokenCost) {
      return res.status(402).json({ 
        success: false, 
        error: 'Insufficient tokens',
        currentBalance
      });
    }

    // Deduct tokens
    const remainingTokens = currentBalance - tokenCost;
    
    // Update balance in Supabase if userId is available
    if (userId && !supabaseError) {
      try {
        const { error: updateError } = await supabase
          .from('user_tokens')
          .update({ balance: remainingTokens, updated_at: new Date().toISOString() })
          .eq('user_id', userId);

        if (updateError) {
          console.warn(`⚠️ Failed to update balance in Supabase: ${updateError.message}`);
          // Still continue with in-memory backup
          setUserTokens(email, remainingTokens);
        } else {
          // Log transaction
          await supabase
            .from('token_transactions')
            .insert([{
              user_id: userId,
              transaction_type: 'usage',
              amount: -tokenCost,
              description: `AI suggestion for ${section}`,
              balance_after: remainingTokens,
            }]);

          console.log(`✅ Tokens deducted in Supabase for user ${userId}: ${currentBalance} → ${remainingTokens}`);
        }
      } catch (err) {
        console.warn(`⚠️ Error updating Supabase: ${err.message}, falling back to in-memory`);
        setUserTokens(email, remainingTokens);
      }
    } else {
      // Fallback to in-memory
      setUserTokens(email, remainingTokens);
    }
    
    const suggestions = generateSuggestions(content, section);

    console.log(`✨ Generated ${suggestions.length} AI suggestions for ${section} (${currentBalance} → ${remainingTokens} tokens)`);

    return res.status(200).json({
      success: true,
      suggestions,
      tokensUsed: tokenCost,
      remainingTokens,
    });
  } catch (error) {
    console.error('AI suggestion error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate suggestions' 
    });
  }
});

// ==================== ATS Endpoints ====================

/**
 * POST /api/ats/score - Calculate ATS score for CV data
 */
app.post('/api/ats/score', (req, res) => {
  try {
    const { cvData } = req.body;

    if (!cvData) {
      return res.status(400).json({ 
        success: false, 
        error: 'CV data is required' 
      });
    }

    const score = calculateATSScore(cvData);

    console.log(`📊 Calculated ATS score: ${score}`);

    return res.status(200).json({
      success: true,
      overallScore: score,
      analysis: generateAnalysis(score),
    });
  } catch (error) {
    console.error('ATS score calculation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to calculate ATS score' 
    });
  }
});

/**
 * POST /api/ats/analyze - Perform detailed ATS analysis
 */
app.post('/api/ats/analyze', (req, res) => {
  try {
    const { cvData } = req.body;

    if (!cvData) {
      return res.status(400).json({ 
        success: false, 
        error: 'CV data is required' 
      });
    }

    const analysis = analyzeCV(cvData);

    console.log(`📈 ATS analysis completed with overall score: ${analysis.overallScore}`);

    return res.status(200).json({
      success: true,
      ...analysis,
    });
  } catch (error) {
    console.error('ATS analysis error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to analyze CV' 
    });
  }
});

/**
 * POST /api/ats/recommend - Get ATS improvement recommendations
 */
app.post('/api/ats/recommend', (req, res) => {
  try {
    const { section, content, score } = req.body;

    if (!section || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Section and content are required' 
      });
    }

    const recommendations = generateSectionRecommendations(section, content, score);

    console.log(`💡 Generated ${recommendations.length} recommendations for ${section}`);

    return res.status(200).json({
      success: true,
      section,
      recommendations,
      tokensUsed: 30,
      remainingTokens: 70,
    });
  } catch (error) {
    console.error('Recommendation generation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate recommendations' 
    });
  }
});

// ==================== Health Check ====================

/**
 * GET /api/health - Health check
 */
app.get('/api/health', (req, res) => {
  return res.status(200).json({ 
    success: true, 
    message: 'API server is running',
    timestamp: new Date().toISOString()
  });
});

// ==================== Helper Functions ====================

function generateSuggestions(content, section) {
  const suggestions = [];

  switch (section.toLowerCase()) {
    case 'summary':
    case 'professional-summary':
      suggestions.push(
        `As a dedicated professional with expertise in ${extractKeywords(content).slice(0, 2).join(' and ')}, I bring proven results in driving innovation and delivering measurable impact. My background includes successful project leadership, strategic problem-solving, and a commitment to continuous growth. I'm passionate about contributing to organizations where I can leverage my skills to create tangible value for teams and stakeholders.`,
        `I am a results-driven professional with a strong background in ${extractKeywords(content).slice(0, 2).join(' and ')}. With a proven track record of delivering high-quality solutions and leading cross-functional teams, I excel at transforming challenges into opportunities. I'm motivated by complex problems and committed to leveraging my skills to drive organizational success.`,
        `Experienced ${extractKeywords(content).slice(0, 1).join()} professional seeking to apply technical expertise and proven leadership abilities in a dynamic environment. Demonstrated success in project management, team collaboration, and implementing innovative solutions. Dedicated to continuous learning and making meaningful contributions to organizational goals.`
      );
      break;

    case 'experience':
    case 'job-description':
      suggestions.push(
        `Led cross-functional team initiatives resulting in ${generateMetric()} improvement in operational efficiency and team productivity. Implemented best practices that streamlined workflows and increased team collaboration effectiveness.`,
        `Delivered high-impact projects with measurable outcomes, driving ${generateMetric()} growth in key performance indicators. Collaborated with stakeholders to identify requirements and implemented solutions that exceeded expectations.`,
        `Managed multiple priorities while maintaining ${generateMetric()} quality standards and on-time delivery. Demonstrated strong problem-solving abilities by identifying process improvements that enhanced team performance and customer satisfaction.`
      );
      break;

    case 'skills':
      const skillList = extractKeywords(content);
      suggestions.push(
        skillList.join(', '),
        skillList.concat(['Problem-solving', 'Communication', 'Leadership']).slice(0, skillList.length + 2).join(', '),
        [...new Set([...skillList, 'Team Collaboration', 'Project Management', 'Analytical Thinking'])].slice(0, 8).join(', ')
      );
      break;

    default:
      suggestions.push(
        `Enhanced version focusing on key achievements: ${content.substring(0, 100)}...`,
        `Alternative approach with emphasis on impact: ${content.substring(0, 100)}...`,
        `Optimized phrasing for ATS compatibility: ${content.substring(0, 100)}...`
      );
  }

  return suggestions.slice(0, 3);
}

function extractKeywords(text) {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 4);
  
  const commonWords = new Set(['what', 'this', 'that', 'have', 'from', 'with', 'their', 'which', 'would', 'about', 'been', 'were']);
  const keywords = words.filter(word => !commonWords.has(word)).slice(0, 5);
  
  return keywords.length > 0 ? keywords : ['professional', 'experienced'];
}

function generateMetric() {
  const metrics = [
    '25% efficiency',
    '40% productivity',
    '30% cost reduction',
    '35% time savings',
    '45% quality improvement'
  ];
  return metrics[Math.floor(Math.random() * metrics.length)];
}

function calculateATSScore(cvData) {
  let score = 0;

  // Contact information (10 points)
  if (cvData.fullName && cvData.fullName.trim()) score += 3;
  if (cvData.email && cvData.email.includes('@')) score += 3;
  if (cvData.phone && cvData.phone.trim()) score += 2;
  if (cvData.location && cvData.location.trim()) score += 2;

  // Professional summary (15 points)
  if (cvData.summary && cvData.summary.trim().length > 50) {
    score += 15;
  } else if (cvData.summary && cvData.summary.trim().length > 20) {
    score += 8;
  }

  // Experience section (25 points)
  if (cvData.experience || cvData.experiences) {
    const experiences = cvData.experience || cvData.experiences || [];
    const filledExperiences = experiences.filter(exp => 
      exp.company && exp.position && exp.description
    ).length;
    
    score += Math.min(filledExperiences * 5, 25);
  }

  // Education section (15 points)
  if (cvData.education) {
    const filledEducation = cvData.education.filter(edu => 
      edu.institution && edu.degree
    ).length;
    
    score += Math.min(filledEducation * 7.5, 15);
  }

  // Skills section (15 points)
  if (cvData.skills && cvData.skills.trim().length > 0) {
    const skillCount = cvData.skills.split(',').length;
    score += Math.min(skillCount * 1.5, 15);
  }

  // Projects section (10 points)
  if (cvData.projects) {
    const filledProjects = cvData.projects.filter(proj => 
      proj.projectName && proj.description
    ).length;
    
    score += Math.min(filledProjects * 5, 10);
  }

  // Certifications (5 points)
  if (cvData.certifications && cvData.certifications.trim().length > 0) {
    score += 5;
  }

  // Keywords and formatting bonus (5 points)
  const cvText = JSON.stringify(cvData).toLowerCase();
  const keywords = ['agile', 'leadership', 'problem-solving', 'communication', 'teamwork', 'analytical', 'managed', 'led', 'achieved'];
  const keywordMatches = keywords.filter(kw => cvText.includes(kw)).length;
  score += Math.min(keywordMatches * 0.5, 5);

  return Math.min(Math.round(score), 100);
}

function generateAnalysis(score) {
  if (score >= 80) {
    return 'Excellent - Your CV is well-optimized for ATS systems';
  } else if (score >= 60) {
    return 'Good - Your CV is ATS-friendly with some room for improvement';
  } else if (score >= 40) {
    return 'Fair - Consider completing missing sections for better ATS optimization';
  } else {
    return 'Needs Improvement - Fill in the missing sections to improve your ATS score';
  }
}

function analyzeCV(cvData) {
  const scores = {
    contact: calculateContactScore(cvData),
    summary: calculateSummaryScore(cvData),
    experience: calculateExperienceScore(cvData),
    education: calculateEducationScore(cvData),
    skills: calculateSkillsScore(cvData),
    projects: calculateProjectsScore(cvData),
  };

  const overallScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
  );

  const sections = generateSectionAnalysis(cvData, scores);
  const recommendations = generateRecommendations(cvData, scores);

  return {
    overallScore,
    scores,
    sections: sections.map(sec => ({
      name: sec.name,
      score: sec.score,
      status: getScoreStatus(sec.score),
      insights: sec.insights,
      missing: sec.missing,
    })),
    recommendations,
    strengths: getStrengths(scores),
    weaknesses: getWeaknesses(scores),
  };
}

function calculateContactScore(cvData) {
  let score = 0;
  if (cvData.fullName?.trim()) score += 25;
  if (cvData.email?.includes('@')) score += 25;
  if (cvData.phone?.trim()) score += 25;
  if (cvData.location?.trim()) score += 25;
  return Math.min(score, 100);
}

function calculateSummaryScore(cvData) {
  if (!cvData.summary || cvData.summary.trim().length === 0) return 0;
  
  let score = 20;
  const summaryLength = cvData.summary.trim().length;
  
  if (summaryLength >= 150) score += 30;
  else if (summaryLength >= 100) score += 20;
  else if (summaryLength >= 50) score += 10;
  
  const actionVerbs = ['led', 'managed', 'achieved', 'implemented', 'designed', 'developed', 'created'];
  const hasActionVerbs = actionVerbs.some(verb => cvData.summary.toLowerCase().includes(verb));
  if (hasActionVerbs) score += 20;
  
  const hasMetrics = /\d+%|\d+\$|top \d+/i.test(cvData.summary);
  if (hasMetrics) score += 20;
  
  const keywords = ['expert', 'proficient', 'technical', 'strategic', 'proven'];
  const keywordMatch = keywords.filter(kw => cvData.summary.toLowerCase().includes(kw)).length;
  if (keywordMatch > 0) score += 10;
  
  return Math.min(score, 100);
}

function calculateExperienceScore(cvData) {
  const experiences = cvData.experience || cvData.experiences || [];
  if (experiences.length === 0) return 0;
  
  let score = 0;
  const maxScore = 100;
  
  experiences.slice(0, 3).forEach(exp => {
    let entryScore = 0;
    
    if (exp.company?.trim()) entryScore += 20;
    if (exp.position?.trim()) entryScore += 20;
    if (exp.description?.trim()) {
      entryScore += 30;
      if (exp.description.length > 150) entryScore += 10;
    }
    if (exp.startDate?.trim()) entryScore += 10;
    if (exp.endDate?.trim() || exp.currentlyWorking) entryScore += 10;
    
    score += entryScore;
  });
  
  return Math.min(score / Math.min(experiences.length, 3), 100);
}

function calculateEducationScore(cvData) {
  const education = cvData.education || [];
  if (education.length === 0) return 0;
  
  let score = 0;
  const maxScore = 100;
  
  education.forEach(edu => {
    if (edu.institution?.trim()) score += 25;
    if (edu.degree?.trim()) score += 25;
    if (edu.fieldOfStudy?.trim()) score += 25;
    if (edu.gpa?.trim()) score += 25;
  });
  
  return Math.min((score / (education.length * 100)) * 100, 100);
}

function calculateSkillsScore(cvData) {
  if (!cvData.skills || cvData.skills.trim().length === 0) return 0;
  
  const skillCount = cvData.skills.split(',').filter(s => s.trim()).length;
  
  if (skillCount >= 15) return 100;
  if (skillCount >= 10) return 80;
  if (skillCount >= 5) return 60;
  return Math.min(skillCount * 10, 50);
}

function calculateProjectsScore(cvData) {
  const projects = cvData.projects || [];
  if (projects.length === 0) return 30;
  
  let score = 30;
  const filledProjects = projects.filter(p => p.projectName?.trim() && p.description?.trim()).length;
  score += Math.min(filledProjects * 20, 70);
  
  return Math.min(score, 100);
}

function generateSectionAnalysis(cvData, scores) {
  return [
    {
      name: 'Contact Info',
      score: scores.contact,
      insights: scores.contact === 100 ? 'Complete contact information' : 'Missing some contact details',
      missing: getMissingContact(cvData),
    },
    {
      name: 'Summary',
      score: scores.summary,
      insights: scores.summary >= 80 ? 'Strong professional summary' : 'Consider adding or improving your summary',
      missing: !cvData.summary ? ['Professional summary with 150+ characters'] : [],
    },
    {
      name: 'Experience',
      score: scores.experience,
      insights: scores.experience >= 80 ? 'Well-documented experience' : 'Add more detailed job descriptions',
      missing: getMissingExperience(cvData),
    },
    {
      name: 'Education',
      score: scores.education,
      insights: scores.education >= 80 ? 'Complete educational background' : 'Fill in more education details',
      missing: getMissingEducation(cvData),
    },
    {
      name: 'Skills',
      score: scores.skills,
      insights: scores.skills >= 80 ? 'Comprehensive skills section' : 'Add more relevant skills (target: 15+)',
      missing: !cvData.skills ? ['Add at least 10 relevant professional skills'] : [],
    },
    {
      name: 'Projects',
      score: scores.projects,
      insights: scores.projects >= 70 ? 'Good project documentation' : 'Consider adding more projects',
      missing: !cvData.projects?.length ? ['Add at least 1 notable project'] : [],
    },
  ];
}

function generateRecommendations(cvData, scores) {
  const recommendations = [];
  
  if (scores.summary < 60) {
    recommendations.push({
      priority: 'high',
      suggestion: 'Add a professional summary highlighting your key strengths and achievements',
    });
  }
  
  if (scores.experience < 60) {
    recommendations.push({
      priority: 'high',
      suggestion: 'Include action verbs and quantifiable results in your job descriptions',
    });
  }
  
  if (scores.skills < 60) {
    recommendations.push({
      priority: 'medium',
      suggestion: 'Add at least 10-15 relevant professional skills that match your target roles',
    });
  }
  
  if (!cvData.projects || cvData.projects.length === 0) {
    recommendations.push({
      priority: 'medium',
      suggestion: 'Highlight key projects to demonstrate practical experience and achievements',
    });
  }
  
  return recommendations;
}

function getStrengths(scores) {
  return Object.entries(scores)
    .filter(([_, score]) => score >= 80)
    .map(([key]) => `Strong ${key} section`)
    .slice(0, 3);
}

function getWeaknesses(scores) {
  return Object.entries(scores)
    .filter(([_, score]) => score < 60)
    .map(([key]) => `Consider improving ${key} section`)
    .slice(0, 3);
}

function getScoreStatus(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
}

function getMissingContact(cvData) {
  const missing = [];
  if (!cvData.fullName?.trim()) missing.push('Full Name');
  if (!cvData.email?.trim()) missing.push('Email Address');
  if (!cvData.phone?.trim()) missing.push('Phone Number');
  if (!cvData.location?.trim()) missing.push('Location');
  return missing;
}

function getMissingExperience(cvData) {
  const experiences = cvData.experience || cvData.experiences || [];
  const missing = [];
  if (experiences.length === 0) missing.push('Add at least one job experience');
  else {
    experiences.forEach((exp, idx) => {
      if (!exp.description?.trim()) missing.push(`Job ${idx + 1}: Add job description/responsibilities`);
    });
  }
  return missing;
}

function getMissingEducation(cvData) {
  const education = cvData.education || [];
  const missing = [];
  if (education.length === 0) missing.push('Add educational qualifications');
  else {
    education.forEach((edu, idx) => {
      if (!edu.institution?.trim()) missing.push(`Education ${idx + 1}: Add institution name`);
      if (!edu.degree?.trim()) missing.push(`Education ${idx + 1}: Add degree`);
    });
  }
  return missing;
}

function generateSectionRecommendations(section, content, score) {
  const recommendations = [];

  const sectionName = section.toLowerCase();

  if (sectionName.includes('contact') || sectionName.includes('summary')) {
    recommendations.push({
      type: 'format',
      suggestion: 'Keep contact information clear and organized - one piece per line when possible',
      impact: 'Improves parsing accuracy',
    });
    recommendations.push({
      type: 'keyword',
      suggestion: 'Include industry-specific keywords in your summary that match job descriptions',
      impact: 'Better keyword matching with job postings',
    });
    recommendations.push({
      type: 'length',
      suggestion: 'Aim for 150-250 words in your professional summary',
      impact: 'Optimal length for ATS systems',
    });
  }

  if (sectionName.includes('experience') || sectionName.includes('job')) {
    recommendations.push({
      type: 'format',
      suggestion: 'Use clear structure: Job Title | Company Name | Dates | Description',
      impact: 'Better section recognition',
    });
    recommendations.push({
      type: 'keywords',
      suggestion: 'Start bullet points with action verbs: Led, Managed, Developed, Implemented, Achieved',
      impact: 'Highlights accomplishments better',
    });
    recommendations.push({
      type: 'metrics',
      suggestion: 'Include quantifiable results: "Increased sales by 25%" or "Reduced costs by $100K"',
      impact: 'Demonstrates measurable impact',
    });
  }

  if (sectionName.includes('skill')) {
    recommendations.push({
      type: 'quantity',
      suggestion: 'Include 10-20 skills for better matching with job descriptions',
      impact: 'Increases keyword match rate',
    });
    recommendations.push({
      type: 'organization',
      suggestion: 'Group related skills together by category (Technical, Leadership, etc.)',
      impact: 'Improves readability and keyword mapping',
    });
  }

  return recommendations.slice(0, 5);
}

// Start server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`✅ API Server running on http://localhost:${PORT}`);
  console.log(`========================================\n`);
});
