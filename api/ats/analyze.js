// API endpoint to perform detailed ATS analysis
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

    // Perform ATS analysis
    const analysis = analyzeCV(cvData);

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
  
  let score = 20; // Base score for having summary
  const summaryLength = cvData.summary.trim().length;
  
  if (summaryLength >= 150) score += 30;
  else if (summaryLength >= 100) score += 20;
  else if (summaryLength >= 50) score += 10;
  
  // Check for action verbs and metrics
  const actionVerbs = ['led', 'managed', 'achieved', 'implemented', 'designed', 'developed', 'created'];
  const hasActionVerbs = actionVerbs.some(verb => cvData.summary.toLowerCase().includes(verb));
  if (hasActionVerbs) score += 20;
  
  // Check for metrics
  const hasMetrics = /\d+%|\d+\$|top \d+/i.test(cvData.summary);
  if (hasMetrics) score += 20;
  
  // Check for keywords
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
  const scorePerEntry = maxScore / Math.min(experiences.length, 3);
  
  experiences.slice(0, 3).forEach(exp => {
    let entryScore = 0;
    
    if (exp.company?.trim()) entryScore += 20;
    if (exp.position?.trim()) entryScore += 20;
    if (exp.description?.trim()) {
      entryScore += 30;
      // Bonus for detailed description
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
  if (projects.length === 0) return 30; // Bonus for having projects
  
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
