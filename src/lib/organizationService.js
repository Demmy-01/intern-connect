// services/organizationService.js - DEBUG VERSION
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

  // Get all applications for the organization
  async getOrganizationApplications() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user');
        return { data: [], error: 'User not authenticated' };
      }

      console.log('Fetching applications for organization:', user.id);

      // Simple direct query first
      const { data, error } = await supabase
        .from('internship_applications')
        .select(`
          id,
          status,
          applied_at,
          notes,
          internship_id,
          student_id
        `)
        .order('applied_at', { ascending: false });

      console.log('All applications in database:', data);
      console.log('Query error:', error);

      if (error) {
        throw error;
      }

      // Filter for this organization's internships manually
      const { data: orgInternships, error: intError } = await supabase
        .from('internships')
        .select('id')
        .eq('organization_id', user.id);

      console.log('Organization internships:', orgInternships);

      if (intError) {
        console.error('Internships error:', intError);
      }

      if (!orgInternships || orgInternships.length === 0) {
        console.log('No internships found for this organization');
        return { data: [], error: null };
      }

      const internshipIds = orgInternships.map(i => i.id);
      console.log('Internship IDs:', internshipIds);

      const filteredApplications = data.filter(app => 
        internshipIds.includes(app.internship_id)
      );

      console.log('Filtered applications:', filteredApplications);

      // Now get the related data for filtered applications
      if (filteredApplications.length === 0) {
        return { data: [], error: null };
      }

      // Get full data with relationships
      const { data: fullData, error: fullError } = await supabase
        .from('internship_applications')
        .select(`
          id,
          status,
          applied_at,
          notes,
          internships (
            id,
            position_title,
            department
          ),
          students (
            id,
            profiles (
              id,
              display_name,
              avatar_url,
              username
            )
          )
        `)
        .in('id', filteredApplications.map(app => app.id))
        .order('applied_at', { ascending: false });

      console.log('Full application data:', fullData);
      console.log('Full data error:', fullError);

      if (fullError) {
        throw fullError;
      }

      return { data: fullData || [], error: null };
    } catch (error) {
      console.error('Error fetching applications:', error);
      return { data: [], error: error.message };
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

  // Keep other existing methods simple
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
            profiles (
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

      // Get student education separately
      const { data: educationData } = await supabase
        .from('student_education')
        .select('*')
        .eq('student_id', data.students.id)
        .order('created_at', { ascending: false });

      return { 
        data: {
          ...data,
          student_education: educationData || []
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

    const startDateMatch = notes.match(/Preferred start date: (.*?)(?:\n\n|$)/s);
    if (startDateMatch) {
      data.preferredStartDate = startDateMatch[1].trim();
    }

    const durationMatch = notes.match(/Duration: (.*?)(?:\n\n|$)/s);
    if (durationMatch) {
      data.duration = durationMatch[1].trim();
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