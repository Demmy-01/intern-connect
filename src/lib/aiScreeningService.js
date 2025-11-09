import { supabase } from './supabase.js';
import * as Tesseract from 'tesseract.js/dist/tesseract.min.js';
import * as pdfjsLib from 'pdfjs-dist';
// Vite-friendly import of the PDF.js worker as a URL. The `?url` suffix
// instructs Vite to emit the file and return a public URL we can assign
// to pdfjsLib.GlobalWorkerOptions.workerSrc. This avoids dynamic module
// import/CORS issues with CDN-delivered ESM workers.
// Use the .mjs build worker that exists in the installed package. Older
// attempts to import `pdf.worker.min.js` failed because that file isn't
// present in this pdfjs-dist release; `pdf.worker.mjs` is available.
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure PDF.js worker to use the locally-bundled worker URL
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

class SmartCVScreeningService {
  
  /**
   * Extract text from PDF document with OCR fallback
   */
  async extractTextFromPDF(pdfUrl) {
    try {
      console.log('📄 Extracting text from PDF:', pdfUrl);
      
      if (!pdfUrl || pdfUrl === 'undefined') {
        throw new Error('Invalid PDF URL provided');
      }
      
      // Attempt to load PDF with worker enabled first. If the worker cannot be
      // loaded (common with Vite/CORS/dynamic import issues), retry with the
      // worker disabled which runs PDF parsing on the main thread.
      let pdf = null;
      const docOptions = {
        url: pdfUrl,
        withCredentials: false,
        disableWorker: false,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/cmaps/',
        cMapPacked: true,
      };

      try {
        const loadingTask = pdfjsLib.getDocument(docOptions);
        pdf = await loadingTask.promise;
      } catch (workerErr) {
        // Log the original worker error and retry without a worker.
        console.warn('⚠️ PDF.js worker failed to initialize, retrying without worker:', workerErr);

        try {
          const loadingTask2 = pdfjsLib.getDocument({ ...docOptions, disableWorker: true });
          pdf = await loadingTask2.promise;
          console.info('ℹ️ PDF loaded successfully with worker disabled (main-thread parsing).');
        } catch (noWorkerErr) {
          console.error('❌ Failed to load PDF with and without worker:', noWorkerErr);
          // Re-throw the error so the caller handles it as before
          throw noWorkerErr;
        }
      }
      console.log('✅ PDF loaded successfully, pages:', pdf.numPages);
      
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        console.log(`Page ${i} textContent items:`, textContent.items);
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      console.log('✅ Extracted text length:', fullText.length, 'characters');
      
      if (fullText.trim().length === 0) {
        console.log('⚠️ No text extracted, falling back to OCR...');
        fullText = await this.extractTextWithOCR(pdf);
        console.log('✅ OCR extracted text length:', fullText.length, 'characters');
        if (fullText.trim().length === 0) {
          throw new Error('OCR failed to extract any text');
        }
      }
      
      return fullText;
    } catch (error) {
      console.error('❌ Error extracting PDF text:', error);
      throw new Error(`Failed to extract text from CV: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF pages using OCR (Tesseract.js)
   */
  async extractTextWithOCR(pdf) {
    let ocrText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      const { data: { text } } = await Tesseract.recognize(canvas, 'eng', { logger: m => console.log(m) });
      ocrText += text + '\n';
    }
    return ocrText;
  }

  /**
   * Smart keyword matching with fuzzy logic and synonyms
   */
  matchKeywords(cvText, keywords) {
    const cvLower = cvText.toLowerCase();
    const matched = [];
    const missing = [];
    
    // Common synonyms and variations for skills/keywords
    const synonyms = {
      'javascript': ['js', 'ecmascript', 'node.js', 'nodejs'],
      'python': ['py', 'python3'],
      'react': ['reactjs', 'react.js'],
      'communication': ['communicate', 'communicator', 'interpersonal'],
      'leadership': ['leader', 'lead', 'team lead', 'managing'],
      'problem solving': ['problem-solving', 'analytical', 'troubleshooting'],
      'teamwork': ['team player', 'collaboration', 'collaborative'],
      'project management': ['project manager', 'pm', 'agile', 'scrum'],
      'data analysis': ['data analyst', 'analytics', 'data science'],
      'machine learning': ['ml', 'ai', 'artificial intelligence'],
      'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'nosql'],
      'frontend': ['front-end', 'front end', 'ui', 'user interface'],
      'backend': ['back-end', 'back end', 'server-side'],
      'full stack': ['fullstack', 'full-stack'],
      'java': ['java programming', 'core java'],
      'c++': ['cpp', 'c plus plus'],
      'html': ['html5', 'markup'],
      'css': ['css3', 'styling', 'stylesheets'],
      'git': ['github', 'version control', 'gitlab'],
      'docker': ['containerization', 'containers'],
      'aws': ['amazon web services', 'cloud computing'],
      'excel': ['microsoft excel', 'spreadsheet'],
      'powerpoint': ['microsoft powerpoint', 'presentations'],
      'word': ['microsoft word', 'ms word'],
    };

    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase().trim();
      let found = false;
      
      // Direct match
      if (cvLower.includes(keywordLower)) {
        found = true;
        matched.push(keyword);
        return;
      }
      
      // Check synonyms
      const keywordSynonyms = synonyms[keywordLower] || [];
      for (const syn of keywordSynonyms) {
        if (cvLower.includes(syn)) {
          found = true;
          matched.push(keyword);
          return;
        }
      }
      
      // Fuzzy match (for slight variations/typos)
      const words = cvLower.split(/\s+/);
      for (const word of words) {
        if (this.calculateSimilarity(word, keywordLower) > 0.85) {
          found = true;
          matched.push(keyword);
          return;
        }
      }
      
      if (!found) {
        missing.push(keyword);
      }
    });
    
    return { matched, missing };
  }

  /**
   * Calculate string similarity (Levenshtein distance based)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Levenshtein distance algorithm
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Analyze CV quality and completeness
   */
  analyzeCVQuality(cvText) {
    const cvLower = cvText.toLowerCase();
    
    // Check for education section
    const hasEducation = /\b(education|academic|degree|bachelor|master|phd|university|college|school|bsc|msc|b\.sc|m\.sc)\b/i.test(cvText);
    
    // Check for experience section
    const hasExperience = /\b(experience|employment|work|job|position|intern|internship|worked|employed|career)\b/i.test(cvText);
    
    // Check for skills section
    const hasSkills = /\b(skills|proficient|expertise|competencies|technologies|tools|technical skills|soft skills)\b/i.test(cvText);
    
    // Check for contact information
    const hasContact = /\b(email|phone|contact|linkedin|github|@|\.com|tel:|mobile)\b/i.test(cvText);
    
    // Check for projects
    const hasProjects = /\b(project|projects|developed|built|created|implemented|portfolio)\b/i.test(cvText);
    
    // Check for certifications
    const hasCertifications = /\b(certification|certificate|certified|licensed|accredited)\b/i.test(cvText);
    
    // Count bullet points (indicates good formatting)
    const bulletPoints = (cvText.match(/[•●○■▪▫►-]\s/g) || []).length;
    const hasBullets = bulletPoints > 5;
    
    // Check length (good CVs are typically 300-3000 words)
    const wordCount = cvText.split(/\s+/).length;
    const appropriateLength = wordCount >= 300 && wordCount <= 3000;
    
    return {
      hasEducation,
      hasExperience,
      hasSkills,
      hasContact,
      hasProjects,
      hasCertifications,
      hasBullets,
      appropriateLength,
      wordCount
    };
  }

  /**
   * Calculate comprehensive score
   */
  calculateScore(matched, missing, cvQuality, cvText) {
    const totalKeywords = matched.length + missing.length;
    
    // Keyword matching score (0-70 points)
    const keywordScore = totalKeywords > 0 
      ? (matched.length / totalKeywords) * 70 
      : 0;
    
    // CV quality score (0-30 points)
    let qualityScore = 0;
    qualityScore += cvQuality.hasEducation ? 5 : 0;
    qualityScore += cvQuality.hasExperience ? 8 : 0;
    qualityScore += cvQuality.hasSkills ? 5 : 0;
    qualityScore += cvQuality.hasContact ? 4 : 0;
    qualityScore += cvQuality.hasProjects ? 3 : 0;
    qualityScore += cvQuality.hasCertifications ? 2 : 0;
    qualityScore += cvQuality.hasBullets ? 2 : 0;
    qualityScore += cvQuality.appropriateLength ? 1 : 0;
    
    const finalScore = Math.round(keywordScore + qualityScore);
    
    return Math.min(100, finalScore);
  }

  /**
   * Generate reasoning for the score
   */
  generateReasoning(score, matched, missing, cvQuality) {
    const reasons = [];
    
    if (matched.length > 0) {
      reasons.push(`Matched ${matched.length} required keyword(s)`);
    }
    
    if (missing.length > 0) {
      reasons.push(`Missing ${missing.length} keyword(s)`);
    }
    
    if (cvQuality.hasExperience) {
      reasons.push('Has relevant experience');
    } else {
      reasons.push('Limited or no experience listed');
    }
    
    if (cvQuality.hasEducation) {
      reasons.push('Education background present');
    }
    
    if (cvQuality.hasSkills) {
      reasons.push('Skills section included');
    }
    
    if (!cvQuality.appropriateLength) {
      if (cvQuality.wordCount < 300) {
        reasons.push('CV appears too brief');
      } else {
        reasons.push('CV is overly lengthy');
      }
    }
    
    if (score >= 70) {
      return `Strong candidate. ${reasons.join('. ')}.`;
    } else if (score >= 40) {
      return `Moderate match. ${reasons.join('. ')}.`;
    } else {
      return `Weak match. ${reasons.join('. ')}.`;
    }
  }

  /**
   * Main screening function - analyze application without external API
   */
  async screenApplication(applicationId, keywords, cvUrl) {
    try {
      console.log('🚀 Starting smart CV screening for application:', applicationId);
      console.log('📄 CV URL:', cvUrl);
      console.log('🔑 Keywords:', keywords);
      
      if (!cvUrl || cvUrl === 'undefined' || cvUrl === 'null') {
        throw new Error('No CV uploaded for screening');
      }
      
      // Parse keywords (handle both string and array)
      let keywordsList = [];
      if (typeof keywords === 'string') {
        keywordsList = keywords.split(',').map(k => k.trim()).filter(k => k);
      } else if (Array.isArray(keywords)) {
        keywordsList = keywords;
      }
      
      if (keywordsList.length === 0) {
        throw new Error('No keywords provided for screening');
      }
      
      // Step 1: Extract text from CV
      console.log('📥 Step 1: Extracting CV text...');
      const cvText = await this.extractTextFromPDF(cvUrl);
      
      if (!cvText || cvText.length < 50) {
        throw new Error('CV appears to be empty or unreadable');
      }
      
      console.log('✅ CV text extracted successfully');
      
      // Step 2: Match keywords
      console.log('🔍 Step 2: Matching keywords...');
      const { matched, missing } = this.matchKeywords(cvText, keywordsList);
      console.log('✅ Matched:', matched);
      console.log('⚠️ Missing:', missing);
      
      // Step 3: Analyze CV quality
      console.log('📊 Step 3: Analyzing CV quality...');
      const cvQuality = this.analyzeCVQuality(cvText);
      console.log('✅ CV Quality:', cvQuality);
      
      // Step 4: Calculate score
      console.log('🎯 Step 4: Calculating score...');
      const score = this.calculateScore(matched, missing, cvQuality, cvText);
      console.log('✅ Final Score:', score);
      
      // Step 5: Generate reasoning
      const reasoning = this.generateReasoning(score, matched, missing, cvQuality);
      
      // Step 6: Determine screening status
      const screeningStatus = this.determineScreeningStatus(score);
      
      const analysis = {
        finalScore: score,
        matchedKeywords: matched,
        missingKeywords: missing,
        reasoning: reasoning,
        cvQuality: cvQuality,
        screenedAt: new Date().toISOString(),
        screeningMethod: 'smart-keyword-matching'
      };
      
      console.log('✅ Screening analysis complete:', analysis);
      
      return {
        aiScore: score,
        aiAnalysis: analysis,
        screeningStatus,
        success: true
      };
      
    } catch (error) {
      console.error('❌ Error in CV screening:', error);
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
      console.log('💾 Updating application with screening results...');
      
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
      
      if (error) {
        console.error('❌ Update error:', error);
        throw error;
      }
      
      console.log('✅ Application updated successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error updating application screening:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Send notification email to rejected applicant
   */
  async sendRejectionEmail(applicationId) {
    try {
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
        return { success: false };
      }
      
      const studentName = application.students?.profiles?.display_name || 'Applicant';
      const positionTitle = application.internships?.position_title || 'Internship';
      const companyName = application.internships?.organizations?.company_name || 'Our Organization';
      const email = application.applicant_email;
      
      if (!email) {
        console.log('No email found for rejected applicant');
        return { success: false };
      }
      
      console.log(`
        ===== AUTO-REJECTION EMAIL =====
        To: ${email}
        Subject: Application Status Update - ${positionTitle}
        
        Dear ${studentName},
        
        Thank you for your interest in the ${positionTitle} position at ${companyName}.
        
        After careful review of your application, we regret to inform you that we will not be moving forward with your candidacy at this time.
        
        We encourage you to:
        - Review the job requirements and enhance relevant skills
        - Update your CV to highlight matching qualifications
        - Apply for other positions that align with your experience
        
        Best regards,
        ${companyName} Recruitment Team
        ================================
      `);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending rejection email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get screening statistics
   */
  async getScreeningStats(organizationId) {
    try {
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
          autoRejected: 0,
          averageScore: 0
        };
      }

      const internshipIds = internships.map(i => i.id);

      const { data: applications, error } = await supabase
        .from('internship_applications')
        .select('screening_status, ai_score')
        .in('internship_id', internshipIds);

      if (error) throw error;

      const stats = {
        total: applications?.length || 0,
        screened: applications?.filter(a => a.screening_status !== 'unscreened').length || 0,
        shortlisted: applications?.filter(a => a.screening_status === 'shortlisted').length || 0,
        flagged: applications?.filter(a => a.screening_status === 'flagged_review').length || 0,
        autoRejected: applications?.filter(a => a.screening_status === 'auto_rejected').length || 0
      };

      const scoredApps = applications?.filter(a => a.ai_score !== null) || [];
      stats.averageScore = scoredApps.length > 0
        ? Math.round(scoredApps.reduce((sum, a) => sum + a.ai_score, 0) / scoredApps.length)
        : 0;

      return stats;
    } catch (error) {
      console.error('Error getting screening stats:', error);
      return {
        total: 0,
        screened: 0,
        shortlisted: 0,
        flagged: 0,
        autoRejected: 0,
        averageScore: 0
      };
    }
  }
}

export default new SmartCVScreeningService();