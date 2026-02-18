/**
 * api.js — Client-side API layer (no backend server required)
 * All operations run directly in the browser using Supabase.
 */
import { supabase } from './supabase';

// ==================== Pricing ====================

const PRICING_DATA = {
    success: true,
    packages: [
        { name: 'Starter', tokens: 50, bonus: 10, price: 500 },
        { name: 'Professional', tokens: 150, bonus: 50, price: 1200 },
        { name: 'Enterprise', tokens: 500, bonus: 200, price: 3500 },
    ],
    costs: {
        AI_SUGGESTION: 20,
        ATS_ANALYSIS: 30,
        INITIAL_FREE_TOKENS: 100,
    },
};

/**
 * Get token pricing packages (no server needed)
 */
export async function getTokenPricing() {
    return PRICING_DATA;
}

// ==================== Token Balance ====================

/**
 * Get user's token balance from Supabase
 */
export async function getTokenBalance() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { balance: 0 };

        const { data, error } = await supabase
            .from('user_tokens')
            .select('balance')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching token balance:', error);
            return { balance: 0 };
        }

        return { balance: data?.balance ?? 0 };
    } catch (err) {
        console.error('getTokenBalance error:', err);
        return { balance: 0 };
    }
}

// ==================== AI Suggestions ====================

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
    const metrics = ['25% efficiency', '40% productivity', '30% cost reduction', '35% time savings', '45% quality improvement'];
    return metrics[Math.floor(Math.random() * metrics.length)];
}

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

/**
 * Get AI suggestion for CV content — deducts tokens via Supabase
 */
export async function getAISuggestion(content, section = 'general', userId = null) {
    const TOKEN_COST = 20;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        const uid = userId || user?.id;

        if (!uid) {
            return { success: false, error: 'User not authenticated' };
        }

        // Get current balance
        const { data: tokenData, error: fetchError } = await supabase
            .from('user_tokens')
            .select('balance')
            .eq('user_id', uid)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            return { success: false, error: 'Failed to fetch token balance' };
        }

        const currentBalance = tokenData?.balance ?? 0;

        if (currentBalance < TOKEN_COST) {
            return { success: false, error: 'Insufficient tokens', currentBalance };
        }

        const remainingTokens = currentBalance - TOKEN_COST;

        // Deduct tokens
        const { error: updateError } = await supabase
            .from('user_tokens')
            .update({ balance: remainingTokens, updated_at: new Date().toISOString() })
            .eq('user_id', uid);

        if (updateError) {
            return { success: false, error: 'Failed to deduct tokens' };
        }

        // Log transaction
        await supabase.from('token_transactions').insert([{
            user_id: uid,
            transaction_type: 'usage',
            amount: -TOKEN_COST,
            description: `AI suggestion for ${section}`,
            balance_after: remainingTokens,
        }]);

        const suggestions = generateSuggestions(content, section);

        return {
            success: true,
            suggestions,
            tokensUsed: TOKEN_COST,
            remainingTokens,
        };
    } catch (err) {
        console.error('getAISuggestion error:', err);
        return { success: false, error: err.message || 'Failed to generate suggestions' };
    }
}

// ==================== Payment (Mock Mode) ====================

/**
 * Initialize payment — adds tokens directly to Supabase (mock mode).
 * For real Paystack integration, a Supabase Edge Function is required.
 */
export async function initializePayment(email, packageIndex, userId = null) {
    try {
        const pkg = PRICING_DATA.packages[packageIndex];
        if (!pkg) {
            return { success: false, error: 'Invalid package index' };
        }

        const tokensToAdd = pkg.tokens + (pkg.bonus || 0);

        const { data: { user } } = await supabase.auth.getUser();
        const uid = userId || user?.id;

        if (!uid) {
            return { success: false, error: 'User not authenticated' };
        }

        // Get current balance
        const { data: existing } = await supabase
            .from('user_tokens')
            .select('balance, total_purchased')
            .eq('user_id', uid)
            .single();

        const currentBalance = existing?.balance ?? 0;
        const currentPurchased = existing?.total_purchased ?? 0;
        const newBalance = currentBalance + tokensToAdd;
        const newPurchased = currentPurchased + tokensToAdd;

        // Upsert token record
        const { error: upsertError } = await supabase
            .from('user_tokens')
            .upsert({
                user_id: uid,
                balance: newBalance,
                total_purchased: newPurchased,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

        if (upsertError) {
            console.error('Error upserting tokens:', upsertError);
            return { success: false, error: 'Failed to add tokens' };
        }

        // Log transaction
        await supabase.from('token_transactions').insert([{
            user_id: uid,
            transaction_type: 'purchase',
            amount: tokensToAdd,
            description: `Token purchase: ${pkg.name} package`,
            reference: `mock_${Date.now()}`,
            balance_after: newBalance,
        }]);

        console.log(`✅ Mock payment: added ${tokensToAdd} tokens for user ${uid}. New balance: ${newBalance}`);

        return {
            success: true,
            mock: true,
            tokensAdded: tokensToAdd,
            newBalance,
            message: `${tokensToAdd} tokens added to your account!`,
        };
    } catch (err) {
        console.error('initializePayment error:', err);
        return { success: false, error: err.message || 'Payment failed' };
    }
}

/**
 * Verify payment (mock — always succeeds for mock references)
 */
export async function verifyPayment(reference) {
    // Mock references start with "mock_"
    if (reference && reference.startsWith('mock_')) {
        return { success: true, message: 'Mock payment already processed' };
    }
    // Real Paystack references would need a server-side call
    return { success: false, error: 'Real payment verification requires a backend. Please contact support.' };
}

// ==================== ATS Scoring ====================

function calcContactScore(cvData) {
    let score = 0;
    if (cvData.fullName?.trim()) score += 25;
    if (cvData.email?.includes('@')) score += 25;
    if (cvData.phone?.trim()) score += 25;
    if (cvData.location?.trim()) score += 25;
    return Math.min(score, 100);
}

function calcSummaryScore(cvData) {
    if (!cvData.summary || cvData.summary.trim().length === 0) return 0;
    let score = 20;
    const len = cvData.summary.trim().length;
    if (len >= 150) score += 30;
    else if (len >= 100) score += 20;
    else if (len >= 50) score += 10;
    const actionVerbs = ['led', 'managed', 'achieved', 'implemented', 'designed', 'developed', 'created'];
    if (actionVerbs.some(v => cvData.summary.toLowerCase().includes(v))) score += 20;
    if (/\d+%|\d+\$|top \d+/i.test(cvData.summary)) score += 20;
    const keywords = ['expert', 'proficient', 'technical', 'strategic', 'proven'];
    if (keywords.filter(kw => cvData.summary.toLowerCase().includes(kw)).length > 0) score += 10;
    return Math.min(score, 100);
}

function calcExperienceScore(cvData) {
    const experiences = cvData.experience || cvData.experiences || [];
    if (experiences.length === 0) return 0;
    let score = 0;
    experiences.slice(0, 3).forEach(exp => {
        let s = 0;
        if (exp.company?.trim()) s += 20;
        if (exp.position?.trim()) s += 20;
        if (exp.description?.trim()) { s += 30; if (exp.description.length > 150) s += 10; }
        if (exp.startDate?.trim()) s += 10;
        if (exp.endDate?.trim() || exp.currentlyWorking) s += 10;
        score += s;
    });
    return Math.min(score / Math.min(experiences.length, 3), 100);
}

function calcEducationScore(cvData) {
    const education = cvData.education || [];
    if (education.length === 0) return 0;
    let score = 0;
    education.forEach(edu => {
        if (edu.institution?.trim()) score += 25;
        if (edu.degree?.trim()) score += 25;
        if (edu.fieldOfStudy?.trim()) score += 25;
        if (edu.gpa?.trim()) score += 25;
    });
    return Math.min((score / (education.length * 100)) * 100, 100);
}

function calcSkillsScore(cvData) {
    if (!cvData.skills || cvData.skills.trim().length === 0) return 0;
    const skillCount = cvData.skills.split(',').filter(s => s.trim()).length;
    if (skillCount >= 15) return 100;
    if (skillCount >= 10) return 80;
    if (skillCount >= 5) return 60;
    return Math.min(skillCount * 10, 50);
}

function calcProjectsScore(cvData) {
    const projects = cvData.projects || [];
    if (projects.length === 0) return 30;
    let score = 30;
    const filled = projects.filter(p => p.projectName?.trim() && p.description?.trim()).length;
    score += Math.min(filled * 20, 70);
    return Math.min(score, 100);
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
    else experiences.forEach((exp, idx) => {
        if (!exp.description?.trim()) missing.push(`Job ${idx + 1}: Add job description/responsibilities`);
    });
    return missing;
}

function getMissingEducation(cvData) {
    const education = cvData.education || [];
    const missing = [];
    if (education.length === 0) missing.push('Add educational qualifications');
    else education.forEach((edu, idx) => {
        if (!edu.institution?.trim()) missing.push(`Education ${idx + 1}: Add institution name`);
        if (!edu.degree?.trim()) missing.push(`Education ${idx + 1}: Add degree`);
    });
    return missing;
}

function runATSAnalysis(cvData) {
    const scores = {
        contact: calcContactScore(cvData),
        summary: calcSummaryScore(cvData),
        experience: calcExperienceScore(cvData),
        education: calcEducationScore(cvData),
        skills: calcSkillsScore(cvData),
        projects: calcProjectsScore(cvData),
    };

    const overallScore = Math.round(
        Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
    );

    const sections = [
        {
            name: 'Contact Info',
            score: scores.contact,
            status: getScoreStatus(scores.contact),
            insights: scores.contact === 100 ? 'Complete contact information' : 'Missing some contact details',
            missing: getMissingContact(cvData),
        },
        {
            name: 'Summary',
            score: scores.summary,
            status: getScoreStatus(scores.summary),
            insights: scores.summary >= 80 ? 'Strong professional summary' : 'Consider adding or improving your summary',
            missing: !cvData.summary ? ['Professional summary with 150+ characters'] : [],
        },
        {
            name: 'Experience',
            score: scores.experience,
            status: getScoreStatus(scores.experience),
            insights: scores.experience >= 80 ? 'Well-documented experience' : 'Add more detailed job descriptions',
            missing: getMissingExperience(cvData),
        },
        {
            name: 'Education',
            score: scores.education,
            status: getScoreStatus(scores.education),
            insights: scores.education >= 80 ? 'Complete educational background' : 'Fill in more education details',
            missing: getMissingEducation(cvData),
        },
        {
            name: 'Skills',
            score: scores.skills,
            status: getScoreStatus(scores.skills),
            insights: scores.skills >= 80 ? 'Comprehensive skills section' : 'Add more relevant skills (target: 15+)',
            missing: !cvData.skills ? ['Add at least 10 relevant professional skills'] : [],
        },
        {
            name: 'Projects',
            score: scores.projects,
            status: getScoreStatus(scores.projects),
            insights: scores.projects >= 70 ? 'Good project documentation' : 'Consider adding more projects',
            missing: !cvData.projects?.length ? ['Add at least 1 notable project'] : [],
        },
    ];

    const weakSections = sections.filter(s => s.score < 60);

    const recommendations = [];
    if (scores.summary < 60) recommendations.push({ priority: 'high', suggestion: 'Add a professional summary highlighting your key strengths and achievements' });
    if (scores.experience < 60) recommendations.push({ priority: 'high', suggestion: 'Include action verbs and quantifiable results in your job descriptions' });
    if (scores.skills < 60) recommendations.push({ priority: 'medium', suggestion: 'Add at least 10-15 relevant professional skills that match your target roles' });
    if (!cvData.projects || cvData.projects.length === 0) recommendations.push({ priority: 'medium', suggestion: 'Highlight key projects to demonstrate practical experience and achievements' });

    const strengths = Object.entries(scores).filter(([, s]) => s >= 80).map(([k]) => `Strong ${k} section`).slice(0, 3);
    const weaknesses = Object.entries(scores).filter(([, s]) => s < 60).map(([k]) => `Consider improving ${k} section`).slice(0, 3);

    return { overallScore, scores, sections, weakSections, recommendations, strengths, weaknesses };
}

/**
 * Calculate ATS score for CV data (client-side)
 */
export async function calculateATSScore(cvData) {
    try {
        const analysis = runATSAnalysis(cvData);
        return { success: true, overallScore: analysis.overallScore };
    } catch (err) {
        console.error('calculateATSScore error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Get detailed ATS analysis (client-side)
 */
export async function getATSAnalysis(cvData) {
    try {
        const analysis = runATSAnalysis(cvData);
        return { success: true, ...analysis };
    } catch (err) {
        console.error('getATSAnalysis error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Get ATS improvement recommendations for a specific section
 */
export async function getATSRecommendation(section, content, score) {
    const TOKEN_COST = 30;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'User not authenticated' };

        // Get current balance
        const { data: tokenData } = await supabase
            .from('user_tokens')
            .select('balance')
            .eq('user_id', user.id)
            .single();

        const currentBalance = tokenData?.balance ?? 0;
        if (currentBalance < TOKEN_COST) {
            return { success: false, error: 'Insufficient tokens', currentBalance };
        }

        const remainingTokens = currentBalance - TOKEN_COST;

        // Deduct tokens
        await supabase.from('user_tokens')
            .update({ balance: remainingTokens, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);

        await supabase.from('token_transactions').insert([{
            user_id: user.id,
            transaction_type: 'usage',
            amount: -TOKEN_COST,
            description: `ATS recommendation for ${section}`,
            balance_after: remainingTokens,
        }]);

        // Generate recommendation text
        const sectionName = section.toLowerCase();
        let recommendation = '';
        if (sectionName.includes('summary')) {
            recommendation = 'Aim for 150-250 words. Include industry-specific keywords, action verbs (Led, Managed, Developed), and quantifiable results (e.g., "Increased sales by 25%").';
        } else if (sectionName.includes('experience')) {
            recommendation = 'Use clear structure: Job Title | Company | Dates. Start bullet points with action verbs. Include quantifiable results like "Increased sales by 25%" or "Reduced costs by $100K".';
        } else if (sectionName.includes('skill')) {
            recommendation = 'Include 10-20 skills for better ATS matching. Group related skills by category (Technical, Leadership, etc.). Match skills to keywords in target job descriptions.';
        } else if (sectionName.includes('education')) {
            recommendation = 'Include institution name, degree, field of study, and GPA if above 3.0. Add relevant coursework or academic achievements.';
        } else {
            recommendation = `Improve your ${section} section by adding more detail, using relevant keywords, and quantifying your achievements where possible.`;
        }

        return {
            success: true,
            section,
            recommendation,
            tokensUsed: TOKEN_COST,
            remainingTokens,
        };
    } catch (err) {
        console.error('getATSRecommendation error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Health check (always healthy since no server needed)
 */
export async function checkHealth() {
    return { success: true, message: 'Client-side API ready', timestamp: new Date().toISOString() };
}

export default {};
