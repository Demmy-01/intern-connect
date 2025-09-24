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

  // FIXED: Submit internship application - properly stores document URL
// FIXED: Submit internship application - properly stores document URL and email
  async submitApplication(applicationData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to apply');
      }

      console.log('Submitting application with data:', applicationData);

      const { data, error } = await supabase
        .from('internship_applications')
        .insert([{
          internship_id: applicationData.internshipId,
          student_id: user.id,
          status: 'pending',
          notes: applicationData.notes || null,
          document_url: applicationData.documentUrl || null,
          applicant_email: applicationData.applicantEmail || user.email, // SAVE EMAIL HERE
          applied_at: new Date().toISOString()
        }])
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      console.log('Application submitted successfully:', data);
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

// FIXED: Upload application document (CV/Resume) with proper file handling
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

    // Get public URL for viewing
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

  // FIXED: Create or update student profile - DON'T overwrite username with email
  async createOrUpdateStudentProfile(profileData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get current profile to preserve existing username
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('id', user.id)
        .single();

      // Only update display_name and phone, preserve existing username
      const updateData = {
        id: user.id,
        user_type: 'student',
        display_name: profileData.fullName || currentProfile?.display_name || user.user_metadata?.full_name || 'Student',
        phone: profileData.phone || null,
        updated_at: new Date().toISOString()
      };

      // Only update username if it doesn't exist (new user) and don't use email
      if (!currentProfile?.username) {
        // Generate a username from display name or use a default
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

      // Create or update basic student record
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

  // Helper method to download documents
  async downloadDocument(documentUrl, fileName) {
    try {
      if (!documentUrl) {
        throw new Error('No document URL provided');
      }

      // Create download link
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

  // Helper method to get document from storage
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