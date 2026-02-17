// API endpoint to calculate ATS score for CV data
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { cvData } = req.body;

    if (!cvData) {
      return res.status(400).json({ 
        success: false, 
        error: 'CV data is required' 
      });
    }

    // Calculate ATS score
    const score = calculateATSScore(cvData);

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

  // Ensure score is between 0 and 100
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
