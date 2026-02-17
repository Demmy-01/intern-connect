// API endpoint to get ATS improvement recommendations
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { section, content, score } = req.body;

    if (!section || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Section and content are required' 
      });
    }

    // Generate recommendations for the section
    const recommendations = generateSectionRecommendations(section, content, score);

    return res.status(200).json({
      success: true,
      section,
      recommendations,
      tokensUsed: 30,
      remainingTokens: 70, // This should be fetched from DB in production
    });
  } catch (error) {
    console.error('Recommendation generation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate recommendations' 
    });
  }
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
    recommendations.push({
      type: 'keyword',
      suggestion: 'Include role-specific keywords and technologies used in descriptions',
      impact: 'Better ATS keyword matching',
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
    recommendations.push({
      type: 'keyword',
      suggestion: 'Use both full names and abbreviations (e.g., React / React.js, AWS, etc.)',
      impact: 'Captures different keyword variations',
    });
  }

  if (sectionName.includes('education')) {
    recommendations.push({
      type: 'format',
      suggestion: 'Include: Degree | Field of Study | University | Graduation Date | GPA (if 3.5+)',
      impact: 'Structured education recognition',
    });
    recommendations.push({
      type: 'keyword',
      suggestion: 'Mention relevant coursework or specializations if recent graduate',
      impact: 'Compensates for limited experience',
    });
  }

  if (sectionName.includes('project')) {
    recommendations.push({
      type: 'format',
      suggestion: 'Include: Project Title | Brief Description | Technologies Used | Link/Repository',
      impact: 'Complete project information',
    });
    recommendations.push({
      type: 'keyword',
      suggestion: 'Highlight technical skills and technologies used in each project',
      impact: 'Technical skill validation',
    });
  }

  // General recommendations
  recommendations.push({
    type: 'general',
    suggestion: 'Avoid using graphics, tables, and complex formatting that ATS systems may not parse',
    impact: 'Ensures 100% text parsing',
  });
  recommendations.push({
    type: 'general',
    suggestion: 'Use standard section headers: Summary, Experience, Education, Skills, Projects, Certifications',
    impact: 'Consistent section recognition',
  });

  return recommendations.slice(0, 5);
}
