// services/organizationService.js - FIXED VERSION
import { supabase } from './supabase.js';

class OrganizationService {
  // Simple test to check current user and basic data
  async debugCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      if (!user) {
        console.log('No authenticated user');
        return;
      }

      // Check if user has organization profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('User profile:', profile, 'Error:', profileError);

      // Check if user has organization record
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Organization record:', org, 'Error:', orgError);

      // Check internships for this organization
      const { data: internships, error: internshipsError } = await supabase
        .from('internships')
        .select('*')
        .eq('organization_id', user.id);

      console.log('Organization internships:', internships, 'Error:', internshipsError);

      return { user, profile, org, internships };
    } catch (error) {
      console.error('Debug error:', error);
    }
  }

// FIXED: Get application details with email from application table
async getApplicationDetails(applicationId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('internship_applications')
      .select(`
        id,
        status,
        applied_at,
        notes,
        document_url,
        applicant_email,
        internships (
          id,
          position_title,
          department,
          description,
          requirements,
          work_type,
          compensation,
          location,
          organization_id
        ),
        students (
          id,
          bio,
          profiles!inner (
            id,
            display_name,
            username,
            phone,
            avatar_url
          )
        )
      `)
      .eq('id', applicationId)
      .single();

    if (error) {
      throw error;
    }

    // Parse application notes to extract other details
    const parsedNotes = this.parseApplicationNotes(data.notes);

    return { 
      data: {
        ...data,
        student_email: data.applicant_email || "Not provided",
        parsed_application_data: parsedNotes,
        student_education: []
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching application details:', error);
    return { data: null, error: error.message };
  }
}

  // Simplified stats method
  async getOrganizationStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user for stats');
        return { 
          data: { totalInternships: 0, activeInternships: 0, totalApplications: 0, pendingApplications: 0, acceptedApplications: 0, rejectedApplications: 0 },
          error: 'User not authenticated' 
        };
      }

      console.log('Getting stats for organization:', user.id);

      // Get internships count
      const { data: internships, error: internshipsError } = await supabase
        .from('internships')
        .select('id, is_active')
        .eq('organization_id', user.id);

      console.log('Stats - internships:', internships, 'Error:', internshipsError);

      if (internshipsError) {
        console.error('Internships query error:', internshipsError);
        return { 
          data: { totalInternships: 0, activeInternships: 0, totalApplications: 0, pendingApplications: 0, acceptedApplications: 0, rejectedApplications: 0 },
          error: internshipsError.message 
        };
      }

      const totalInternships = internships?.length || 0;
      const activeInternships = internships?.filter(i => i.is_active)?.length || 0;

      console.log('Calculated internship stats:', { totalInternships, activeInternships });

      if (totalInternships === 0) {
        return {
          data: { totalInternships: 0, activeInternships: 0, totalApplications: 0, pendingApplications: 0, acceptedApplications: 0, rejectedApplications: 0 },
          error: null
        };
      }

      // Get applications count
      const internshipIds = internships.map(i => i.id);
      const { data: applications, error: applicationsError } = await supabase
        .from('internship_applications')
        .select('id, status')
        .in('internship_id', internshipIds);

      console.log('Stats - applications:', applications, 'Error:', applicationsError);

      if (applicationsError) {
        console.error('Applications query error:', applicationsError);
      }

      const totalApplications = applications?.length || 0;
      const pendingApplications = applications?.filter(a => a.status === 'pending')?.length || 0;
      const acceptedApplications = applications?.filter(a => a.status === 'accepted')?.length || 0;
      const rejectedApplications = applications?.filter(a => a.status === 'rejected')?.length || 0;

      const stats = {
        totalInternships,
        activeInternships,
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications
      };

      console.log('Final calculated stats:', stats);

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching organization stats:', error);
      return { 
        data: { totalInternships: 0, activeInternships: 0, totalApplications: 0, pendingApplications: 0, acceptedApplications: 0, rejectedApplications: 0 },
        error: error.message 
      };
    }
  }

// FIXED: Get application details with email from application table
async getApplicationDetails(applicationId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('internship_applications')
      .select(`
        id,
        status,
        applied_at,
        notes,
        document_url,
        applicant_email,
        internships (
          id,
          position_title,
          department,
          description,
          requirements,
          work_type,
          compensation,
          location,
          organization_id
        ),
        students (
          id,
          bio,
          profiles!inner (
            id,
            display_name,
            username,
            phone,
            avatar_url
          )
        )
      `)
      .eq('id', applicationId)
      .single();

    if (error) {
      throw error;
    }

    // Parse application notes to extract other details
    const parsedNotes = this.parseApplicationNotes(data.notes);

    return { 
      data: {
        ...data,
        student_email: data.applicant_email || "Not provided",
        parsed_application_data: parsedNotes,
        student_education: []
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching application details:', error);
    return { data: null, error: error.message };
  }
}

  async updateApplicationStatus(applicationId, status, notes = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('internship_applications')
        .update({
          status: status,
          notes: notes
        })
        .eq('id', applicationId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error updating application status:', error);
      return { data: null, error: error.message };
    }
  }

//Enhanced parse method to extract education data and personal details from application notes
parseApplicationNotes(notes) {
  if (!notes) return {};

  const data = {};
  
  const coverLetterMatch = notes.match(/Cover Letter: (.*?)(?:\n\n|$)/s);
  if (coverLetterMatch) {
    data.coverLetter = coverLetterMatch[1].trim();
  }

  const whyApplyingMatch = notes.match(/Why applying: (.*?)(?:\n\n|$)/s);
  if (whyApplyingMatch) {
    data.whyApplying = whyApplyingMatch[1].trim();
  }

  const startDateMatch = notes.match(/Preferred start date: (.*?)(?:\n|$)/s);
  if (startDateMatch) {
    data.preferredStartDate = startDateMatch[1].trim();
  }

  const durationMatch = notes.match(/Duration: (.*?)(?:\n|$)/s);
  if (durationMatch) {
    data.duration = durationMatch[1].trim();
  }

  // FIXED: Extract education data from notes with improved regex pattern
  const educationMatch = notes.match(/Education:\s*([^-\n]+?)\s*-\s*([^-\n(]+?)\s*\(([^)]+)\)/);
  if (educationMatch) {
    data.education = {
      institution: educationMatch[1].trim(),
      degree: educationMatch[2].trim(),
      yearOfStudy: educationMatch[3].trim()
    };
  }

  // FIXED: Extract personal details from notes - Updated regex patterns
  const personalDetailsMatch = notes.match(/Personal Details:\s*DOB:\s*([^,\n]+),\s*Gender:\s*([^,\n]+)/);
  if (personalDetailsMatch) {
    data.dateOfBirth = personalDetailsMatch[1].trim();
    data.gender = personalDetailsMatch[2].trim();
  }

  // Extract address separately
  const addressMatch = notes.match(/Address:\s*(.+?)(?:\n|$)/s);
  if (addressMatch) {
    data.address = addressMatch[1].trim();
  }

  return data;
}

  // Get recent applications (for dashboard)
  async getRecentApplications(limit = 5) {
    try {
      const { data: applications } = await this.getOrganizationApplications();
      const recentApps = applications.slice(0, limit);
      console.log('Recent applications:', recentApps);
      return { data: recentApps, error: null };
    } catch (error) {
      console.error('Error fetching recent applications:', error);
      return { data: [], error: error.message };
    }
  }

  // Enhanced method to download documents with better error handling
  async downloadDocument(documentUrl, fileName) {
    try {
      if (!documentUrl) {
        throw new Error('No document URL provided');
      }

      console.log('Attempting to download document:', documentUrl);

      // Create download link
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = fileName || 'document';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Add to DOM temporarily
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, error: null };
    } catch (error) {
      console.error('Error downloading document:', error);
      return { success: false, error: error.message };
    }
  }

  // Get organization internships
  async getOrganizationInternships() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching organization internships for:', user.id);

      const { data, error } = await supabase
        .from('internships')
        .select(`
          *,
          internship_applications(id, status)
        `)
        .eq('organization_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Organization internships raw data:', data);
      console.log('Organization internships error:', error);

      if (error) {
        throw error;
      }

      // Add application counts to each internship
      const internshipsWithStats = data?.map(internship => ({
        ...internship,
        applicationCount: internship.internship_applications?.length || 0,
        pendingCount: internship.internship_applications?.filter(a => a.status === 'pending')?.length || 0
      })) || [];

      console.log('Internships with stats:', internshipsWithStats);

      return { data: internshipsWithStats, error: null };
    } catch (error) {
      console.error('Error fetching organization internships:', error);
      return { data: [], error: error.message };
    }
  }
}

export default new OrganizationService();