// lib/aiScreeningService.js
import { supabase } from './supabase.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

class AIScreeningService {
  
  /**
   * Extract text from PDF document
   */
  async extractTextFromPDF(pdfUrl) {
    try {
      console.log('Extracting text from PDF:', pdfUrl);
      
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      console.log('Extracted text length:', fullText.length);
      return fullText.toLowerCase();
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error('Failed to extract text from CV');
    }
  }

  /**
   * Parse requirements from internship requirements text
   */
  parseRequirements(requirementsText) {
    if (!requirementsText) return [];
    
    // Common keywords and phrases to extract
    const keywords = [];
    
    // Split by common delimiters
    const lines = requirementsText
      .toLowerCase()
      .split(/[\n,;•\-]/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    // Extract meaningful keywords (2+ words or technical terms)
    lines.forEach(line => {
      // Remove common filler words
      const cleaned = line
        .replace(/^(required|preferred|must have|should have|experience in|knowledge of|proficiency in|familiarity with)[:.]?\s*/gi, '')
        .trim();
      
      if (cleaned.length >= 3) {
        keywords.push(cleaned);
      }
    });
    
    return keywords;
  }

  /**
   * Calculate match score based on keyword presence
   */
  calculateKeywordMatch(cvText, requirements) {
    const keywords = this.parseRequirements(requirements);
    
    if (keywords.length === 0) {
      return {
        score: 50, // Neutral score if no requirements specified
        matchedKeywords: [],
        missingKeywords: [],
        totalKeywords: 0
      };
    }
    
    const matched = [];
    const missing = [];
    
    keywords.forEach(keyword => {
      // Check for keyword or close variations
      const keywordLower = keyword.toLowerCase();
      const found = cvText.includes(keywordLower) || 
                   this.checkKeywordVariations(cvText, keywordLower);
      
      if (found) {
        matched.push(keyword);
      } else {
        missing.push(keyword);
      }
    });
    
    const matchPercentage = (matched.length / keywords.length) * 100;
    
    return {
      score: Math.round(matchPercentage),
      matchedKeywords: matched,
      missingKeywords: missing,
      totalKeywords: keywords.length
    };
  }

  /**
   * Check for keyword variations (e.g., "javascript" matches "js", "react.js" matches "react")
   */
  checkKeywordVariations(text, keyword) {
    const variations = {
      'javascript': ['js', 'ecmascript'],
      'typescript': ['ts'],
      'python': ['py'],
      'react': ['reactjs', 'react.js'],
      'node': ['nodejs', 'node.js'],
      'database': ['db', 'sql', 'mysql', 'postgresql'],
      'communication': ['communicate', 'communicating'],
      'leadership': ['leader', 'leading', 'lead'],
      'teamwork': ['team', 'collaboration', 'collaborative']
    };
    
    if (variations[keyword]) {
      return variations[keyword].some(variant => text.includes(variant));
    }
    
    return false;
  }

  /**
   * Analyze CV content quality and structure
   */
  analyzeCVQuality(cvText) {
    let qualityScore = 0;
    const analysis = {
      hasEducation: false,
      hasExperience: false,
      hasSkills: false,
      hasContact: false,
      wordCount: 0
    };
    
    // Check for education section
    if (/education|degree|university|college|bachelor|master|diploma/i.test(cvText)) {
      qualityScore += 20;
      analysis.hasEducation = true;
    }
    
    // Check for experience section
    if (/experience|worked|intern|project|position|role|company/i.test(cvText)) {
      qualityScore += 25;
      analysis.hasExperience = true;
    }
    
    // Check for skills section
    if (/skills|proficient|knowledge|expertise|competencies/i.test(cvText)) {
      qualityScore += 20;
      analysis.hasSkills = true;
    }
    
    // Check for contact information
    if (/@|email|phone|contact|linkedin|github/i.test(cvText)) {
      qualityScore += 15;
      analysis.hasContact = true;
    }
    
    // Check CV length (reasonable length indicates completeness)
    const wordCount = cvText.split(/\s+/).length;
    analysis.wordCount = wordCount;
    
    if (wordCount >= 200 && wordCount <= 2000) {
      qualityScore += 20;
    } else if (wordCount > 100) {
      qualityScore += 10;
    }
    
    return {
      qualityScore,
      analysis
    };
  }

  /**
   * Main screening function - analyze application
   */
  async screenApplication(applicationId, internshipRequirements, cvUrl) {
    try {
      console.log('Starting AI screening for application:', applicationId);
      
      if (!cvUrl) {
        throw new Error('No CV uploaded for screening');
      }
      
      // Step 1: Extract text from CV
      const cvText = await this.extractTextFromPDF(cvUrl);
      
      if (!cvText || cvText.length < 50) {
        throw new Error('CV appears to be empty or unreadable');
      }
      
      // Step 2: Calculate keyword match
      const keywordMatch = this.calculateKeywordMatch(cvText, internshipRequirements);
      
      // Step 3: Analyze CV quality
      const cvQuality = this.analyzeCVQuality(cvText);
      
      // Step 4: Calculate final score (weighted average)
      const finalScore = Math.round(
        (keywordMatch.score * 0.70) +  // 70% weight on requirements match
        (cvQuality.qualityScore * 0.30)  // 30% weight on CV quality
      );
      
      // Step 5: Generate reasoning
      const reasoning = this.generateReasoning(finalScore, keywordMatch, cvQuality);
      
      // Step 6: Determine screening status
      const screeningStatus = this.determineScreeningStatus(finalScore);
      
      const analysis = {
        finalScore,
        keywordMatchScore: keywordMatch.score,
        qualityScore: cvQuality.qualityScore,
        matchedKeywords: keywordMatch.matchedKeywords,
        missingKeywords: keywordMatch.missingKeywords,
        totalKeywords: keywordMatch.totalKeywords,
        cvAnalysis: cvQuality.analysis,
        reasoning,
        screenedAt: new Date().toISOString()
      };
      
      console.log('Screening analysis complete:', analysis);
      
      return {
        aiScore: finalScore,
        aiAnalysis: analysis,
        screeningStatus,
        success: true
      };
      
    } catch (error) {
      console.error('Error in AI screening:', error);
      return {
        aiScore: null,
        aiAnalysis: {
          error: error.message,
          screenedAt: new Date().toISOString()
        },
        screeningStatus: 'unscreened',
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate human-readable reasoning for the score
   */
  generateReasoning(score, keywordMatch, cvQuality) {
    const reasons = [];
    
    // Requirements match reasoning
    if (keywordMatch.score >= 80) {
      reasons.push(`Strong match: CV contains ${keywordMatch.matchedKeywords.length} of ${keywordMatch.totalKeywords} required qualifications.`);
    } else if (keywordMatch.score >= 50) {
      reasons.push(`Moderate match: CV contains ${keywordMatch.matchedKeywords.length} of ${keywordMatch.totalKeywords} required qualifications.`);
    } else {
      reasons.push(`Weak match: CV contains only ${keywordMatch.matchedKeywords.length} of ${keywordMatch.totalKeywords} required qualifications.`);
    }
    
    // Missing critical requirements
    if (keywordMatch.missingKeywords.length > 0 && keywordMatch.missingKeywords.length <= 3) {
      reasons.push(`Missing: ${keywordMatch.missingKeywords.slice(0, 3).join(', ')}.`);
    }
    
    // CV quality reasoning
    if (cvQuality.qualityScore >= 80) {
      reasons.push('Well-structured CV with comprehensive information.');
    } else if (cvQuality.qualityScore >= 50) {
      reasons.push('CV has basic structure but may lack some details.');
    } else {
      reasons.push('CV appears incomplete or poorly structured.');
    }
    
    // Overall recommendation
    if (score >= 70) {
      reasons.push('RECOMMENDED for interview.');
    } else if (score >= 40) {
      reasons.push('Candidate may be suitable with further review.');
    } else {
      reasons.push('Does not meet minimum requirements.');
    }
    
    return reasons.join(' ');
  }

  /**
   * Determine screening status based on score
   */
  determineScreeningStatus(score) {
    if (score >= 70) {
      return 'shortlisted';
    } else if (score >= 40) {
      return 'flagged_review';
    } else {
      return 'auto_rejected';
    }
  }

  /**
   * Update application with screening results
   */
  async updateApplicationScreening(applicationId, screeningResults) {
    try {
      const { data, error } = await supabase
        .from('internship_applications')
        .update({
          ai_score: screeningResults.aiScore,
          ai_analysis: screeningResults.aiAnalysis,
          screening_status: screeningResults.screeningStatus,
          status: screeningResults.screeningStatus === 'auto_rejected' ? 'rejected' : 'pending'
        })
        .eq('id', applicationId)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating application screening:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Send notification email to rejected applicant
   */
  async sendRejectionEmail(applicationId) {
    try {
      // Get application details
      const { data: application, error } = await supabase
        .from('internship_applications')
        .select(`
          id,
          applicant_email,
          students (
            profiles (
              display_name
            )
          ),
          internships (
            position_title,
            organizations (
              company_name
            )
          )
        `)
        .eq('id', applicationId)
        .single();
      
      if (error || !application) {
        console.error('Could not fetch application for email:', error);
        return;
      }
      
      const studentName = application.students?.profiles?.display_name || 'Applicant';
      const positionTitle = application.internships?.position_title || 'Internship';
      const companyName = application.internships?.organizations?.company_name || 'Our Organization';
      const email = application.applicant_email;
      
      if (!email) {
        console.log('No email found for rejected applicant');
        return;
      }
      
      // Here you would integrate with your email service (SendGrid, AWS SES, etc.)
      // For now, we'll log it
      console.log(`
        ===== AUTO-REJECTION EMAIL =====
        To: ${email}
        Subject: Application Status Update - ${positionTitle}
        
        Dear ${studentName},
        
        Thank you for your interest in the ${positionTitle} position at ${companyName}.
        
        After careful review of your application, we regret to inform you that we will not be moving forward with your candidacy at this time. This decision was based on our initial screening process which matches candidate qualifications with our specific requirements.
        
        We encourage you to:
        - Review the job requirements and enhance relevant skills
        - Update your CV to highlight matching qualifications
        - Apply for other positions that align with your experience
        
        We appreciate the time you invested in your application and wish you success in your internship search.
        
        Best regards,
        ${companyName} Recruitment Team
        
        Note: This is an automated screening decision. If you believe there was an error, please contact us.
        ================================
      `);
      
      // TODO: Replace with actual email sending
      // await emailService.send({
      //   to: email,
      //   subject: `Application Status Update - ${positionTitle}`,
      //   body: emailBody
      // });
      
      return { success: true };
    } catch (error) {
      console.error('Error sending rejection email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process screening for a new application (called automatically on apply)
   */
  async processNewApplication(applicationId) {
    try {
      console.log('Processing new application:', applicationId);
      
      // Get application details including internship requirements
      const { data: application, error: fetchError } = await supabase
        .from('internship_applications')
        .select(`
          id,
          document_url,
          applicant_email,
          internships (
            id,
            requirements,
            screening_enabled,
            auto_reject_threshold,
            auto_shortlist_threshold
          )
        `)
        .eq('id', applicationId)
        .single();
      
      if (fetchError || !application) {
        throw new Error('Could not fetch application details');
      }
      
      // Check if screening is enabled for this internship
      if (!application.internships.screening_enabled) {
        console.log('Screening disabled for this internship');
        return { success: true, message: 'Screening disabled' };
      }
      
      // Perform AI screening
      const screeningResults = await this.screenApplication(
        applicationId,
        application.internships.requirements,
        application.document_url
      );
      
      if (!screeningResults.success) {
        console.error('Screening failed:', screeningResults.error);
        return { success: false, error: screeningResults.error };
      }
      
      // Update application with results
      await this.updateApplicationScreening(applicationId, screeningResults);
      
      // Send rejection email if auto-rejected
      if (screeningResults.screeningStatus === 'auto_rejected') {
        await this.sendRejectionEmail(applicationId);
      }
      
      console.log(`Application ${applicationId} screened successfully. Status: ${screeningResults.screeningStatus}, Score: ${screeningResults.aiScore}`);
      
      return {
        success: true,
        score: screeningResults.aiScore,
        status: screeningResults.screeningStatus
      };
      
    } catch (error) {
      console.error('Error processing application:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Manually re-screen an application
   */
  async reScreenApplication(applicationId) {
    return await this.processNewApplication(applicationId);
  }

  /**
   * Batch screen multiple applications
   */
  async batchScreenApplications(applicationIds) {
    const results = [];
    
    for (const id of applicationIds) {
      const result = await this.processNewApplication(id);
      results.push({ applicationId: id, ...result });
    }
    
    return results;
  }

  async getScreeningStats(organizationId) {
    try {
      // Get all internships for organization
      const { data: internships, error: internshipsError } = await supabase
        .from('internships')
        .select('id')
        .eq('organization_id', organizationId);
      
      if (internshipsError || !internships || internships.length === 0) {
        return {
          total: 0,
          screened: 0,
          shortlisted: 0,
          flagged: 0,
          autoRejected: 0
        };
      }
      
      const internshipIds = internships.map(i => i.id);
      
      // Get screening stats
      const { data: applications, error } = await supabase
        .from('internship_applications')
        .select('screening_status, ai_score')
        .in('internship_id', internshipIds);
      
      if (error) throw error;
      
      return {
        total: applications?.length || 0,
        screened: applications?.filter(a => a.screening_status !== 'unscreened').length || 0,
        shortlisted: applications?.filter(a => a.screening_status === 'shortlisted').length || 0,
        flagged: applications?.filter(a => a.screening_status === 'flagged_review').length || 0,
        autoRejected: applications?.filter(a => a.screening_status === 'auto_rejected').length || 0,
        averageScore: applications?.filter(a => a.ai_score).reduce((sum, a) => sum + a.ai_score, 0) / (applications?.filter(a => a.ai_score).length || 1) || 0
      };
    } catch (error) {
      console.error('Error getting screening stats:', error);
      return null;
    }
  }
}

export default new AIScreeningService();