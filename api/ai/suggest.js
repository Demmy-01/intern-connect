// API endpoint to get AI suggestions for CV content
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { content, section = 'general' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content is required' 
      });
    }

    // Token cost per suggestion
    const tokenCost = 20;

    // Generate intelligent suggestions based on section
    const suggestions = generateSuggestions(content, section);

    // In production, you would:
    // 1. Deduct tokens from user's balance
    // 2. Log the usage
    // 3. Call OpenAI or similar API

    return res.status(200).json({
      success: true,
      suggestions,
      tokensUsed: tokenCost,
      remainingTokens: 80, // This should be fetched from DB in production
    });
  } catch (error) {
    console.error('AI suggestion error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate suggestions' 
    });
  }
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

  return suggestions.slice(0, 3); // Return top 3 suggestions
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
