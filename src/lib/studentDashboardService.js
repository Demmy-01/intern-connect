// services/studentDashboardService.js
import { supabase } from './supabase.js';

class StudentDashboardService {
  // Get current student's applications with internship details
  async getStudentApplications() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Try the full query first
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
            location,
            work_type,
            compensation,
            organizations (
              organization_name,
              logo_url,
              industry
            )
          )
        `)
        .eq('student_id', user.id)
        .order('applied_at', { ascending: false });

      // If there's an error (likely RLS policy), try simpler query
      if (error) {
        console.warn('Complex query failed, trying simpler query:', error.message);
        
        const { data: simpleData, error: simpleError } = await supabase
          .from('internship_applications')
          .select('id, status, applied_at, internship_id, student_id')
          .eq('student_id', user.id)
          .order('applied_at', { ascending: false });

        if (simpleError) {
          console.error('Even simple query failed:', simpleError);
          return { data: [], error: simpleError.message };
        }

        return { data: simpleData || [], error: null };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching student applications:', error);
      return { data: [], error: error.message };
    }
  }

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const { data: applications } = await this.getStudentApplications();
      
      // If applications is null or undefined, default to empty array
      const appList = applications || [];
      const totalApplications = appList.length;
      const pendingApplications = appList.filter(app => app.status === 'pending').length;
      const acceptedApplications = appList.filter(app => app.status === 'accepted').length;
      const rejectedApplications = appList.filter(app => app.status === 'rejected').length;

      return {
        data: {
          totalApplications,
          pendingApplications,
          acceptedApplications,
          rejectedApplications,
          offers: acceptedApplications // Using accepted as offers
        },
        error: null // Don't report error since we're showing partial data
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        data: {
          totalApplications: 0,
          pendingApplications: 0,
          acceptedApplications: 0,
          rejectedApplications: 0,
          offers: 0
        },
        error: null // Don't report error to avoid breaking the dashboard
      };
    }
  }

  // Get student's course of study from education records
  async getStudentCourse() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('student_education')
        .select('degree')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      return { data: data?.[0]?.degree || null, error: null };
    } catch (error) {
      console.error('Error fetching student course:', error);
      return { data: null, error: error.message };
    }
  }

  // Get recommended internships based on student's course (excluding already applied)
  async getRecommendedInternships(limit = 3) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get internships the student has already applied to
      const { data: appliedInternships } = await supabase
        .from('internship_applications')
        .select('internship_id')
        .eq('student_id', user.id);

      const appliedIds = appliedInternships?.map(app => app.internship_id) || [];
      console.log('Already applied to internships:', appliedIds);

      const { data: course } = await this.getStudentCourse();
      
      if (!course) {
        // If no course found, return general internships
        return await this.getGeneralInternships(limit, appliedIds);
      }

      console.log('Student course:', course);

      // Create search terms based on the course
      const searchTerms = this.generateSearchTerms(course);
      console.log('Search terms for recommendations:', searchTerms);

      let recommendedInternships = [];

      // Search for internships matching the course
      for (const term of searchTerms) {
        let query = supabase
          .from('internships')
          .select(`
            id,
            position_title,
            department,
            description,
            location,
            work_type,
            compensation,
            organizations (
              id,
              organization_name,
              logo_url,
              industry
            )
          `)
          .eq('is_active', true)
          .or(`position_title.ilike.%${term}%,department.ilike.%${term}%,description.ilike.%${term}%`);

        // Exclude already applied internships
        if (appliedIds.length > 0) {
          query = query.not('id', 'in', `(${appliedIds.join(',')})`);
        }

        const { data, error } = await query.limit(limit * 2); // Get more to account for filtering

        if (!error && data) {
          recommendedInternships.push(...data);
        }
      }

      // Remove duplicates and limit results
      const uniqueInternships = recommendedInternships.filter(
        (internship, index, self) => 
          index === self.findIndex(i => i.id === internship.id)
      ).slice(0, limit);

      // If not enough recommendations, fill with general internships
      if (uniqueInternships.length < limit) {
        const { data: generalInternships } = await this.getGeneralInternships(limit - uniqueInternships.length, appliedIds);
        const additionalInternships = generalInternships.filter(
          general => !uniqueInternships.find(unique => unique.id === general.id)
        );
        uniqueInternships.push(...additionalInternships);
      }

      return { data: uniqueInternships.slice(0, limit), error: null };
    } catch (error) {
      console.error('Error fetching recommended internships:', error);
      return { data: [], error: error.message };
    }
  }

  // Generate search terms based on course of study
  generateSearchTerms(course) {
    const courseTerms = {
      // Computer Science related
      'computer science': ['software', 'developer', 'programming', 'tech', 'IT', 'web', 'mobile', 'data'],
      'software engineering': ['software', 'developer', 'programming', 'tech', 'engineering'],
      'information technology': ['IT', 'tech', 'software', 'systems', 'network'],
      'data science': ['data', 'analytics', 'machine learning', 'AI', 'data analyst'],
      'cybersecurity': ['security', 'cyber', 'IT', 'network', 'systems'],
      
      // Business related
      'business administration': ['business', 'management', 'admin', 'operations', 'marketing'],
      'marketing': ['marketing', 'digital marketing', 'social media', 'brand', 'communications'],
      'finance': ['finance', 'accounting', 'banking', 'investment', 'analyst'],
      'accounting': ['accounting', 'finance', 'audit', 'bookkeeping'],
      
      // Engineering
      'mechanical engineering': ['mechanical', 'engineering', 'manufacturing', 'design'],
      'electrical engineering': ['electrical', 'engineering', 'electronics', 'power'],
      'civil engineering': ['civil', 'engineering', 'construction', 'infrastructure'],
      
      // Design
      'graphic design': ['design', 'graphic', 'creative', 'visual', 'UI/UX'],
      'web design': ['web', 'design', 'UI', 'UX', 'frontend'],
      
      // Others
      'psychology': ['psychology', 'human resources', 'counseling', 'research'],
      'mass communication': ['communications', 'media', 'journalism', 'PR', 'marketing'],
    };

    const courseLower = course.toLowerCase();
    
    // Find exact match first
    if (courseTerms[courseLower]) {
      return courseTerms[courseLower];
    }

    // Find partial matches
    for (const [key, terms] of Object.entries(courseTerms)) {
      if (courseLower.includes(key) || key.includes(courseLower)) {
        return terms;
      }
    }

    // Extract key words from course name
    const words = courseLower.split(' ').filter(word => word.length > 3);
    return words.length > 0 ? words : ['intern'];
  }

  // Get general internships when no course-specific matches (excluding applied ones)
  async getGeneralInternships(limit = 3, excludeIds = []) {
    try {
      let query = supabase
        .from('internships')
        .select(`
          id,
          position_title,
          department,
          location,
          work_type,
          compensation,
          organizations (
            id,
            organization_name,
            logo_url,
            industry
          )
        `)
        .eq('is_active', true);

      // Exclude already applied internships
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching general internships:', error);
      return { data: [], error: error.message };
    }
  }

  // Get upcoming events/deadlines for student
  async getUpcomingEvents() {
    try {
      const { data: applications } = await this.getStudentApplications();
      
      const events = [];
      
      // Add events based on application status
      applications.forEach(app => {
        if (app.status === 'accepted') {
          events.push({
            title: `Start internship at ${app.internships?.organizations?.organization_name}`,
            time: 'Coming soon',
            type: 'start',
            internshipId: app.internships?.id
          });
        } else if (app.status === 'pending') {
          const daysSinceApplied = Math.floor((new Date() - new Date(app.applied_at)) / (1000 * 60 * 60 * 24));
          if (daysSinceApplied > 7) {
            events.push({
              title: `Follow up on ${app.internships?.organizations?.organization_name} application`,
              time: `Applied ${daysSinceApplied} days ago`,
              type: 'followup',
              internshipId: app.internships?.id
            });
          }
        }
      });

      // Add some general events
      events.push({
        title: 'Update your profile and CV',
        time: 'Recommended monthly',
        type: 'maintenance'
      });

      return { data: events.slice(0, 5), error: null };
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return { data: [], error: error.message };
    }
  }

  // Format application for display
  formatApplicationForDisplay(application) {
    return {
      id: application.id,
      internshipId: application.internships?.id,
      title: application.internships?.position_title,
      company: application.internships?.organizations?.organization_name,
      logo: application.internships?.organizations?.logo_url,
      status: application.status,
      appliedDate: application.applied_at,
      location: application.internships?.location,
      workType: application.internships?.work_type,
      department: application.internships?.department
    };
  }
}

export default new StudentDashboardService();