// services/internshipService.js
import { supabase } from './supabase.js';
import organizationService from './organizationService.js';

class InternshipService {
  // Debug function to check user authentication and organization
  async debugUserAuth() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      if (authError) {
        console.error('Auth error:', authError);
        return;
      }

      // Check organization data
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('Organization data:', orgData);
      console.log('Organization error:', orgError);

      // Alternative check if using id instead of user_id
      const { data: orgData2, error: orgError2 } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', user.id);
      
      console.log('Organization data (by id):', orgData2);

      return { user, orgData, orgData2 };
    } catch (error) {
      console.error('Debug error:', error);
    }
  }

  // Create a new internship
  async createInternship(internshipData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check profile completion first
      const profileStatus = await organizationService.checkProfileCompletion();
      if (!profileStatus?.isComplete) {
        throw new Error('Please complete your organization profile before posting internships. ' +
          'Missing information: ' + profileStatus.missingFields.map(f => f.label).join(', '));
      }
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Creating internship for user:', user.id);

      const insertData = {
        organization_id: user.id,
        position_title: internshipData.positionTitle,
        department: internshipData.department,
        description: internshipData.description,
        requirements: internshipData.requirements || null,
        work_type: internshipData.workType,
        compensation: internshipData.compensation,
        location: internshipData.location || null,
        min_duration: parseInt(internshipData.minDuration),
        max_duration: parseInt(internshipData.maxDuration),
        is_active: true
      };

      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('internships')
        .insert([insertData])
        .select('*')
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error creating internship:', error);
      return { data: null, error: error.message };
    }
  }

  // Get all internships for the authenticated organization
  async getOrganizationInternships() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching internships for user:', user.id);

      const { data, error } = await supabase
        .from('internships')
        .select('*')
        .eq('organization_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch error:', error);
        throw error;
      }

      console.log('Fetched internships:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching organization internships:', error);
      return { data: null, error: error.message };
    }
  }

  // Get all active internships (public view for students)
  async getActiveInternships() {
    try {
      const { data, error } = await supabase
        .from('internships')
        .select(`
          *,
          organizations!inner(
            id,
            organization_name,
            logo_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching active internships:', error);
      return { data: null, error: error.message };
    }
  }

 // Updated toggleInternshipStatus method 
async toggleInternshipStatus(internshipId, isActive) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Toggling internship:', internshipId, 'to:', isActive, 'for user:', user.id);

    // Use RPC function to bypass RLS issues
    const { data, error } = await supabase.rpc('toggle_internship_status', {
      internship_id: internshipId,
      new_status: isActive,
      user_id: user.id
    });

    if (error) {
      console.error('RPC error:', error);
      throw error;
    }

    console.log('Updated internship via RPC:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error toggling internship status:', error);
    return { data: null, error: error.message };
  }
}

  // Update internship
  async updateInternship(internshipId, updateData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Convert form data to database format
      const dbData = {
        ...(updateData.positionTitle && { position_title: updateData.positionTitle }),
        ...(updateData.department && { department: updateData.department }),
        ...(updateData.description && { description: updateData.description }),
        ...(updateData.requirements && { requirements: updateData.requirements }),
        ...(updateData.workType && { work_type: updateData.workType }),
        ...(updateData.compensation && { compensation: updateData.compensation }),
        ...(updateData.location && { location: updateData.location }),
        ...(updateData.minDuration && { min_duration: parseInt(updateData.minDuration) }),
        ...(updateData.maxDuration && { max_duration: parseInt(updateData.maxDuration) })
      };

      const { data, error } = await supabase
        .from('internships')
        .update(dbData)
        .eq('id', internshipId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error updating internship:', error);
      return { data: null, error: error.message };
    }
  }

  // Delete internship
  async deleteInternship(internshipId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('internships')
        .delete()
        .eq('id', internshipId);

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('Error deleting internship:', error);
      return { error: error.message };
    }
  }

  // Get single internship by ID
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
            description as org_description
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
      console.error('Error fetching internship:', error);
      return { data: null, error: error.message };
    }
  }

  // Real-time subscription for organization internships
  subscribeToOrganizationInternships(callback) {
    return supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return null;

      return supabase
        .channel('organization-internships')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'internships',
            filter: `organization_id=eq.${user.id}`
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

export default new InternshipService();