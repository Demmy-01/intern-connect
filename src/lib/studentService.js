// services/studentService.js
import { supabase } from './supabase.js';
import aiScreeningService from './aiScreeningService.js';

class StudentService {
  // Search internships with exact and fuzzy fallback matching
  async searchInternships(searchParams = {}) {
    try {
      const { 
        query = '', 
        roles = [],
        location = '', 
        workType = '', 
        duration = '',
        compensation = ''
      } = searchParams;

      console.log('Search params:', searchParams);

      // Step 1: Try exact/full-text search first
      const exactResults = await this.executeExactSearch({
        query,
        roles,
        location,
        workType,
        duration,
        compensation
      });

      if (exactResults.length > 0) {
        console.log('Exact results found:', exactResults.length);
        return { 
          data: exactResults, 
          error: null,
          searchType: 'exact' // Indicate exact match
        };
      }

      // Step 2: If no exact results and (query or roles) exists, try fuzzy search
      if (query.trim() || (roles && roles.length > 0)) {
        console.log('No exact results, trying fuzzy search...');
        const fuzzyResults = await this.executeFuzzySearch({
          query,
          roles,
          location,
          workType,
          duration,
          compensation
        });

        if (fuzzyResults.length > 0) {
          console.log('Fuzzy results found:', fuzzyResults.length);
          return { 
            data: fuzzyResults, 
            error: null,
            searchType: 'fuzzy', // Indicate fuzzy match
            searchedTerm: query.trim() || (roles && roles.length > 0 ? roles.join(', ') : '') // Return what was searched
          };
        }
      }

      // Step 3: No results at all
      console.log('No results found');
      return { 
        data: [], 
        error: null,
        searchType: 'none'
      };

    } catch (error) {
      console.error('Error searching internships:', error);
      return { data: [], error: error.message, searchType: 'error' };
    }
  }

  // Execute exact search with keyword matching
  async executeExactSearch({ query, roles = [], location, workType, duration, compensation }) {
    let supabaseQuery = supabase
      .from('internships')
      .select(`
        *,
        organizations!inner(
          id,
          organization_name,
          logo_url,
          company_type,
          location
        )
      `)
      .eq('is_active', true);

    // If roles array provided, build OR conditions for each role across fields
    if (roles && Array.isArray(roles) && roles.length > 0) {
      const roleConditions = [];
      roles.forEach(role => {
        const term = role.toLowerCase().trim();
        if (!term) return;
        roleConditions.push(`position_title.ilike.%${term}%`);
        roleConditions.push(`department.ilike.%${term}%`);
        roleConditions.push(`description.ilike.%${term}%`);
        roleConditions.push(`requirements.ilike.%${term}%`);
      });
      if (roleConditions.length > 0) {
        supabaseQuery = supabaseQuery.or(roleConditions.join(','));
      }
    } else if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      
      const searchConditions = [
        `position_title.ilike.%${searchTerm}%`,
        `department.ilike.%${searchTerm}%`, 
        `description.ilike.%${searchTerm}%`,
        `requirements.ilike.%${searchTerm}%`
      ];
      
      supabaseQuery = supabaseQuery.or(searchConditions.join(','));
    }

    // Apply other filters
    if (location.trim()) {
      supabaseQuery = supabaseQuery.ilike('location', `%${location}%`);
    }

    if (workType && workType !== 'all') {
      supabaseQuery = supabaseQuery.eq('work_type', workType);
    }

    if (compensation && compensation !== 'all') {
      supabaseQuery = supabaseQuery.eq('compensation', compensation);
    }

    if (duration && duration !== 'all') {
      const durationMatch = duration.match(/(\d+)/);
      const durationNum = durationMatch ? parseInt(durationMatch[1]) : NaN;
      if (!isNaN(durationNum)) {
        supabaseQuery = supabaseQuery
          .lte('min_duration', durationNum)
          .gte('max_duration', durationNum);
      }
    }

    supabaseQuery = supabaseQuery.order('created_at', { ascending: false });

    const { data, error } = await supabaseQuery;

    if (error) throw error;

    // Also search by organization name (for roles or query)
    let orgResults = [];
    try {
      if (roles && roles.length > 0) {
        for (const role of roles) {
          const term = role.toLowerCase().trim();
          if (!term) continue;
          const { data: orgData } = await supabase
            .from('internships')
            .select(`
              *,
              organizations!inner(
                id,
                organization_name,
                logo_url,
                company_type,
                location
              )
            `)
            .eq('is_active', true)
            .ilike('organizations.organization_name', `%${term}%`)
            .order('created_at', { ascending: false });
          if (orgData && orgData.length) orgResults = orgResults.concat(orgData);
        }
      } else if (query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        const { data: orgData } = await supabase
          .from('internships')
          .select(`
            *,
            organizations!inner(
              id,
              organization_name,
              logo_url,
              company_type,
              location
            )
          `)
          .eq('is_active', true)
          .ilike('organizations.organization_name', `%${searchTerm}%`)
          .order('created_at', { ascending: false });
        orgResults = orgData || [];
      }
    } catch (orgError) {
      console.warn('Organization search failed:', orgError);
    }

    // Merge and deduplicate results
    const allResults = data || [];
    const combinedResults = [...allResults];
    
    orgResults.forEach(orgResult => {
      if (!allResults.find(result => result.id === orgResult.id)) {
        combinedResults.push(orgResult);
      }
    });

    return combinedResults;
  }

  // Execute fuzzy search using pg_trgm similarity
  async executeFuzzySearch({ query, roles = [], location, workType, duration, compensation }) {
    const searchTerm = (roles && roles.length > 0) ? roles.join(' ').toLowerCase().trim() : (query || '').toLowerCase().trim();
    
    // Get all active internships for client-side fuzzy matching
    let supabaseQuery = supabase
      .from('internships')
      .select(`
        *,
        organizations!inner(
          id,
          organization_name,
          logo_url,
          company_type,
          location
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const { data, error } = await supabaseQuery;

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Helper to normalize text for comparison (remove spaces/punctuation)
    const normalize = (s = '') => s.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Calculate similarity scores for each internship
    const scoredResults = data.map(internship => {
      const title = (internship.position_title || '').toLowerCase();
      const dept = (internship.department || '').toLowerCase();
      const desc = (internship.description || '').toLowerCase();
      const orgName = (internship.organizations?.organization_name || '').toLowerCase();

      const normTitle = normalize(title);
      const normDept = normalize(dept);
      const normDesc = normalize(desc);
      const normOrg = normalize(orgName);

      // Calculate similarity score (improved word overlap + normalized comparisons)
      let similarityScore = 0;
      const searchWords = searchTerm.split(/\s+/);
      
      searchWords.forEach(wordRaw => {
        const word = (wordRaw || '').toLowerCase().trim();
        if (word.length < 3) return; // Skip very short words

        const normWord = normalize(word);

        // Direct substring matches (original strings)
        if (title.includes(word)) similarityScore += 10;
        if (dept.includes(word)) similarityScore += 8;
        if (orgName.includes(word)) similarityScore += 6;
        if (desc.includes(word)) similarityScore += 3;

        // Normalized comparisons to handle spacing/punctuation differences
        if (normTitle.includes(normWord) || normWord.includes(normTitle)) similarityScore += 10;
        if (normDept.includes(normWord) || normWord.includes(normDept)) similarityScore += 8;
        if (normOrg.includes(normWord) || normWord.includes(normOrg)) similarityScore += 6;
        if (normDesc.includes(normWord) || normWord.includes(normDesc)) similarityScore += 3;

        // Bonus for matching individual tokens in title/department (normalized)
        const titleWords = title.split(/\s+/).map(t => t.trim()).filter(Boolean);
        const deptWords = dept.split(/\s+/).map(t => t.trim()).filter(Boolean);

        titleWords.forEach(tw => {
          const nTw = normalize(tw);
          if (!nTw) return;
          if (nTw.includes(normWord) || normWord.includes(nTw)) similarityScore += 5;
        });

        deptWords.forEach(dw => {
          const nDw = normalize(dw);
          if (!nDw) return;
          if (nDw.includes(normWord) || normWord.includes(nDw)) similarityScore += 4;
        });
      });

      return { ...internship, similarityScore };
    });

    // Filter out results with very low scores and sort by similarity
    // Lowered threshold to > 2 so single-word matches show up (e.g., "cyber" matches "Cyber Security Technician")
    // Scoring: title match +10, dept +8, org +6, desc +3; token bonuses +5/+4
    let fuzzyResults = scoredResults
      .filter(item => item.similarityScore > 2) // Lowered from > 5 for better recall
      .sort((a, b) => b.similarityScore - a.similarityScore);

    // Apply additional filters (more lenient for fuzzy search)
    if (location.trim()) {
      fuzzyResults = fuzzyResults.filter(item => 
        item.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (workType && workType !== 'all') {
      fuzzyResults = fuzzyResults.filter(item => item.work_type === workType);
    }

    if (compensation && compensation !== 'all') {
      fuzzyResults = fuzzyResults.filter(item => item.compensation === compensation);
    }

    if (duration && duration !== 'all') {
      const durationMatch = duration.match(/(\d+)/);
      const durationNum = durationMatch ? parseInt(durationMatch[1]) : NaN;
      if (!isNaN(durationNum)) {
        fuzzyResults = fuzzyResults.filter(item => 
          item.min_duration <= durationNum && item.max_duration >= durationNum
        );
      }
    }

    // Return top 20 most relevant fuzzy matches
    return fuzzyResults.slice(0, 20);
  }

  // Get all active internships (default view)
  async getAllActiveInternships() {
    try {
      const { data, error } = await supabase
        .from('internships')
        .select(`
          *,
          organizations!inner(
            id,
            organization_name,
            logo_url,
            company_type,
            location
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching internships:', error);
      return { data: [], error: error.message };
    }
  }

  // Get single internship by ID with organization details
  async getInternshipById(internshipId) {
    try {
      const { data, error } = await supabase
  .from('internships')
  .select(`
    *,
    organizations!inner(
      id,
      organization_name,
      logo_url,
      company_type,
      location,
      website,
      company_description,
      industry
    )
  `)
  .eq('id', internshipId)
  .eq('is_active', true)
  .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching internship details:', error);
      return { data: null, error: error.message };
    }
  }

  // Get organization profile with internships
  async getOrganizationProfile(organizationId) {
    try {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (orgError) {
        throw orgError;
      }

      const { data: internships, error: internshipsError } = await supabase
        .from('internships')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (internshipsError) {
        console.error('Error fetching organization internships:', internshipsError);
      }

      return { 
        data: {
          organization: orgData,
          internships: internships || []
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching organization profile:', error);
      return { data: null, error: error.message };
    }
  }

    async submitApplication(applicationData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to apply');
      }

      console.log('Submitting application with data:', applicationData);

      // Step 1: Create the application
      const { data, error } = await supabase
        .from('internship_applications')
        .insert([{
          internship_id: applicationData.internshipId,
          student_id: user.id,
          status: 'pending',
          notes: applicationData.notes || null,
          document_url: applicationData.documentUrl || null,
          applicant_email: applicationData.applicantEmail || user.email,
          screening_status: 'unscreened', // ADD THIS LINE
          applied_at: new Date().toISOString()
        }])
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      console.log('Application submitted successfully:', data);

      // Step 2: Trigger AI screening asynchronously (doesn't block success message)
      if (data.id && data.document_url) {
        console.log('Triggering AI screening for application:', data.id);
        
        try {
          // Get internship requirements for screening
          const { data: internship } = await supabase
            .from('internships')
            .select('requirements, skills_required')
            .eq('id', applicationData.internshipId)
            .single();

          if (internship) {
            // Extract keywords from requirements and skills
            const keywords = [
              ...(internship.skills_required?.split(',') || []),
              ...(internship.requirements?.split(',') || [])
            ].map(kw => kw.trim()).filter(kw => kw);

            console.log('Starting AI screening with keywords:', keywords);

            // Call the screenApplication method and handle the result
            const screeningResult = await aiScreeningService.screenApplication(
              data.id,
              keywords,
              data.document_url
            );

            if (screeningResult.error) {
              console.error('Screening error:', screeningResult.error);
            } else {
              console.log('Screening completed successfully:', screeningResult);
            }
          }
        } catch (screeningError) {
          console.error('Error during CV screening:', screeningError);
        }
      }

      // Step 3: Return success immediately
      return { data, error: null };
    } catch (error) {
      console.error('Error submitting application:', error);
      return { data: null, error: error.message };
    }
  }
  async checkApplicationStatus(internshipId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('internship_applications')
        .select('*')
        .eq('internship_id', internshipId)
        .eq('student_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { 
        hasApplied: !!data, 
        application: data || null,
        error: null 
      };
    } catch (error) {
      console.error('Error checking application status:', error);
      return { hasApplied: false, application: null, error: error.message };
    }
  }

  async getStudentApplications() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('internship_applications')
        .select(`
          *,
          internships!inner(
            id,
            position_title,
            department,
            location,
            work_type,
            organizations!inner(
              organization_name,
              logo_url
            )
          )
        `)
        .eq('student_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching student applications:', error);
      return { data: [], error: error.message };
    }
  }

  async uploadDocument(file, studentId, internshipId) {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${studentId}_${internshipId}_${Date.now()}.${fileExt}`;
      const filePath = `applications/${fileName}`;

      console.log('Uploading document:', { fileName, filePath, fileSize: file.size });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      console.log('Document uploaded successfully:', { publicUrl, filePath });

      return { 
        data: { 
          path: filePath, 
          url: publicUrl,
          fileName: file.name,
          size: file.size,
          type: file.type
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      return { data: null, error: error.message };
    }
  }

  async createOrUpdateStudentProfile(profileData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('id', user.id)
        .single();

      const updateData = {
        id: user.id,
        user_type: 'student',
        display_name: profileData.fullName || currentProfile?.display_name || user.user_metadata?.full_name || 'Student',
        phone: profileData.phone || null,
        updated_at: new Date().toISOString()
      };

      if (!currentProfile?.username) {
        const baseUsername = (profileData.fullName || 'user').toLowerCase().replace(/\s+/g, '_');
        updateData.username = baseUsername;
      }

      console.log('Updating profile with:', updateData);

      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .upsert([updateData])
        .select('*')
        .single();

      if (profileError) {
        throw profileError;
      }

      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .upsert([{
          id: user.id,
          bio: profileData.bio || null,
          updated_at: new Date().toISOString()
        }])
        .select('*')
        .single();

      if (studentError) {
        throw studentError;
      }

      console.log('Profile updated successfully');
      return { data: studentData, error: null };
    } catch (error) {
      console.error('Error creating/updating student profile:', error);
      return { data: null, error: error.message };
    }
  }

  async downloadDocument(documentUrl, fileName) {
    try {
      if (!documentUrl) {
        throw new Error('No document URL provided');
      }

      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = fileName || 'document';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, error: null };
    } catch (error) {
      console.error('Error downloading document:', error);
      return { success: false, error: error.message };
    }
  }

  async getDocumentUrl(filePath) {
    try {
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return { data: publicUrl, error: null };
    } catch (error) {
      console.error('Error getting document URL:', error);
      return { data: null, error: error.message };
    }
  }

  async getSuggestions(query) {
    try {
      if (!query.trim()) return { data: [], error: null };

      const { data, error } = await supabase
        .from('internships')
        .select('position_title')
        .eq('is_active', true)
        .ilike('position_title', `%${query}%`)
        .limit(5);

      if (error) {
        throw error;
      }

      const suggestions = [...new Set(data.map(item => item.position_title))];
      return { data: suggestions, error: null };
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return { data: [], error: error.message };
    }
  }

  subscribeToApplicationUpdates(callback) {
    return supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return null;

      return supabase
        .channel('student-applications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'internship_applications',
            filter: `student_id=eq.${user.id}`
          },
          callback
        )
        .subscribe();
    });
  }

  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
}

export default new StudentService();