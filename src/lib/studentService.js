// services/studentService.js
import { supabase } from './supabase.js';

class StudentService {
  // Search internships with flexible matching
async searchInternships(searchParams = {}) {
  try {
    const { 
      query = '', 
      location = '', 
      workType = '', 
      duration = '',
      compensation = ''
    } = searchParams;

    console.log('Search params:', searchParams);

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

    // Fixed search logic - search across internship fields and organization name
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      
      // Method 1: Use textSearch if available, or Method 2: Multiple separate queries
      // Let's use Method 2 for better compatibility
      
      // Search in internship fields OR organization name
      const searchConditions = [
        `position_title.ilike.%${searchTerm}%`,
        `department.ilike.%${searchTerm}%`, 
        `description.ilike.%${searchTerm}%`,
        `requirements.ilike.%${searchTerm}%`
      ];
      
      // Apply the OR search across internship fields
      supabaseQuery = supabaseQuery.or(searchConditions.join(','));
    }

    // Location search on internship location (text field)
    if (location.trim()) {
      supabaseQuery = supabaseQuery.ilike('location', `%${location}%`);
    }

    if (workType && workType !== 'all') {
      supabaseQuery = supabaseQuery.eq('work_type', workType);
    }

    if (compensation && compensation !== 'all') {
      supabaseQuery = supabaseQuery.eq('compensation', compensation);
    }

    // Duration filtering - more flexible approach
    if (duration && duration !== 'all') {
      // Extract number from duration like "2 months" -> 2
      const durationMatch = duration.match(/(\d+)/);
      const durationNum = durationMatch ? parseInt(durationMatch[1]) : NaN;
      if (!isNaN(durationNum)) {
        supabaseQuery = supabaseQuery
          .lte('min_duration', durationNum)
          .gte('max_duration', durationNum);
      }
    }

    // Add ordering
    supabaseQuery = supabaseQuery.order('created_at', { ascending: false });

    const { data, error } = await supabaseQuery;

    if (error) {
      throw error;
    }

    // If we have a query term, also search by organization name separately and merge results
    let orgResults = [];
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      
      try {
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
      } catch (orgError) {
        console.warn('Organization search failed:', orgError);
      }
    }

    // Merge and deduplicate results
    const allResults = data || [];
    const combinedResults = [...allResults];
    
    // Add organization results that aren't already included
    orgResults.forEach(orgResult => {
      if (!allResults.find(result => result.id === orgResult.id)) {
        combinedResults.push(orgResult);
      }
    });

    // Apply additional filters to combined results if needed
    let filteredResults = combinedResults;
    
    if (location.trim()) {
      filteredResults = filteredResults.filter(item => 
        item.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    console.log('Search results:', filteredResults);
    return { data: filteredResults, error: null };
  } catch (error) {
    console.error('Error searching internships:', error);
    return { data: [], error: error.message };
  }
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

      // Get organization's active internships
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

  // Submit internship application
  async submitApplication(applicationData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to apply');
      }

      const { data, error } = await supabase
        .from('internship_applications')
        .insert([{
          internship_id: applicationData.internshipId,
          student_id: user.id,
          status: 'pending',
          notes: applicationData.notes || null,
          applied_at: new Date().toISOString()
        }])
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error submitting application:', error);
      return { data: null, error: error.message };
    }
  }

  // Check application status for a specific internship
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

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
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

  // Get student's applications
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

  // Upload application document (CV/Resume)
  async uploadDocument(file, studentId, internshipId) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${studentId}_${internshipId}_${Date.now()}.${fileExt}`;
      const filePath = `applications/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return { 
        data: { 
          path: filePath, 
          url: publicUrl,
          fileName: file.name
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      return { data: null, error: error.message };
    }
  }

  // Create or update student profile
  async createOrUpdateStudentProfile(profileData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Upsert profile in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          id: user.id,
          user_type: 'student',
          username: profileData.email || user.email,
          display_name: profileData.fullName || user.user_metadata?.full_name || 'Student',
          phone: profileData.phone || null
        }])
        .select('*')
        .single();

      if (profileError) {
        throw profileError;
      }

      // Create or update student record
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

      return { data: studentData, error: null };
    } catch (error) {
      console.error('Error creating/updating student profile:', error);
      return { data: null, error: error.message };
    }
  }

  // Add student education
  async addStudentEducation(educationData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const insertData = {
        student_id: user.id,
        institution: educationData.institutionName,
        degree: educationData.courseOfStudy,
        duration: `${educationData.yearOfStudy} - ${educationData.expectedGraduationYear}`,
        coursework: educationData.coursework || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('student_education')
        .insert([insertData])
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error adding education:', error);
      return { data: null, error: error.message };
    }
  }

  // Process complete application with file upload
  async submitCompleteApplication(applicationData, cvFile) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to apply');
      }

      // 1. Upload CV file first
      let cvFileUrl = null;
      if (cvFile) {
        const uploadResult = await this.uploadDocument(cvFile, user.id, applicationData.internshipId);
        if (uploadResult.error) {
          throw new Error(`File upload failed: ${uploadResult.error}`);
        }
        cvFileUrl = uploadResult.data.url;
      }

      // 2. Create/update student profile
      await this.createOrUpdateStudentProfile({
        fullName: applicationData.fullName,
        email: applicationData.email,
        phone: applicationData.phone || null
      });

      // 3. Add education details
      if (applicationData.institutionName) {
        await this.addStudentEducation({
          institutionName: applicationData.institutionName,
          courseOfStudy: applicationData.courseOfStudy,
          yearOfStudy: applicationData.yearOfStudy,
          expectedGraduationYear: applicationData.expectedGraduationYear
        });
      }

      // 4. Submit application
      const finalApplicationData = {
        internshipId: applicationData.internshipId,
        fullName: applicationData.fullName,
        email: applicationData.email,
        phone: applicationData.phone,
        cvFileUrl: cvFileUrl,
        notes: `Applied for ${applicationData.duration} starting ${applicationData.internshipStartDate}`,
        educationDetails: {
          institution: applicationData.institutionName,
          course: applicationData.courseOfStudy,
          year: applicationData.yearOfStudy,
          graduation: applicationData.expectedGraduationYear
        }
      };

      return await this.submitApplication(finalApplicationData);

    } catch (error) {
      console.error('Error submitting complete application:', error);
      return { data: null, error: error.message };
    }
  }

  // New method for search suggestions (e.g., position titles)
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

      // Extract unique titles
      const suggestions = [...new Set(data.map(item => item.position_title))];
      return { data: suggestions, error: null };
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return { data: [], error: error.message };
    }
  }

  // Real-time subscription for application updates
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

  // Unsubscribe from real-time updates
  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
}

export default new StudentService();