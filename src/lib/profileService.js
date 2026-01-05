import { supabase } from './supabase';

class ProfileService {
  // Get user profile with all related data
  async getProfile(userId) {
    try {
      // Get current user to ensure we have access
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      if (!profile) {
        console.log('No profile found for user:', userId);
        return {
          success: true,
          data: null,
          message: 'No profile found'
        };
      }

      // Fetch student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (studentError && studentError.code !== 'PGRST116') {
        console.error('Student fetch error:', studentError);
      }

      // Fetch skills, experiences, and education in parallel
      const [skillsResult, experiencesResult, educationResult] = await Promise.all([
        supabase
          .from('student_skills')
          .select('skill_name')
          .eq('student_id', userId)
          .order('created_at', { ascending: true }),
        supabase
          .from('experiences')
          .select('*')
          .eq('student_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('student_education')
          .select('*')
          .eq('student_id', userId)
          .order('created_at', { ascending: false })
      ]);

      const skills = skillsResult.error ? [] : (skillsResult.data || []);
      const experiences = experiencesResult.error ? [] : (experiencesResult.data || []);
      const education = educationResult.error ? [] : (educationResult.data || []);

      if (skillsResult.error) {
        console.error('Skills fetch error:', skillsResult.error);
      }
      if (experiencesResult.error) {
        console.error('Experiences fetch error:', experiencesResult.error);
      }
      if (educationResult.error) {
        console.error('Education fetch error:', educationResult.error);
      }

      return {
        success: true,
        data: {
          // Profile fields
          name: profile.display_name || '',
          username: profile.username || '',
          email: user.email || '', // FIXED: Get email from auth user, not profile
          phone: profile.phone || '',
          profileImage: profile.avatar_url || '',
          
          // Student fields
          bio: studentData?.bio || '',
          
          // Related data
          skills: skills ? skills.map(s => s.skill_name) : [],
          experiences: experiences || [],
          education: education || []
        }
      };
    } catch (error) {
      console.error('Profile service error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch profile'
      };
    }
  }

  // Update profile
  async updateProfile(userId, profileData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      console.log('ProfileService: Starting update for user:', userId);

      // SECURITY: Prevent user_type modification - user_type is immutable after creation
      if (profileData.user_type) {
        console.error('SECURITY VIOLATION: Attempt to modify user_type detected!');
        throw new Error('User type cannot be changed after account creation');
      }

      // Validate username if changed
      if (profileData.username) {
        const { data: existingUser, error: usernameError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', profileData.username)
          .neq('id', userId)
          .maybeSingle();

        if (usernameError && usernameError.code !== 'PGRST116') {
          throw usernameError;
        }

        if (existingUser) {
          throw new Error('Username already taken');
        }
      }

      // Update profiles table - NEVER include user_type (immutable field)
      console.log('ProfileService: Updating profiles...');
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: profileData.name,
          username: profileData.username,
          phone: profileData.phone,
          avatar_url: profileData.profileImage || null,
          // NOTE: user_type is intentionally NOT updated - it is immutable
        })
        .eq('id', userId);

      if (profileError) {
        console.error('ProfileService: Profile update error:', profileError);
        throw profileError;
      }

      // Update/create student record
      console.log('ProfileService: Upserting student data...');
      const { error: studentError } = await supabase
        .from('students')
        .upsert({
          id: userId,
          bio: profileData.bio || '',
        });

      if (studentError) {
        console.error('ProfileService: Student upsert error:', studentError);
        throw studentError;
      }

      // Update skills
      console.log('ProfileService: Updating skills...');
      const { error: deleteSkillsError } = await supabase
        .from('student_skills')
        .delete()
        .eq('student_id', userId);

      if (deleteSkillsError) {
        console.warn('ProfileService: Delete skills warning:', deleteSkillsError);
      }

      if (profileData.skills && profileData.skills.length > 0) {
        const skillsToInsert = profileData.skills.map(skill => ({
          student_id: userId,
          skill_name: skill
        }));

        const { error: skillsError } = await supabase
          .from('student_skills')
          .insert(skillsToInsert);

        if (skillsError) {
          console.error('ProfileService: Skills insert error:', skillsError);
          throw skillsError;
        }
      }

      // Update education
      console.log('ProfileService: Updating education...');
      const { error: deleteEducationError } = await supabase
        .from('student_education')
        .delete()
        .eq('student_id', userId);

      if (deleteEducationError) {
        console.warn('ProfileService: Delete education warning:', deleteEducationError);
      }

      if (profileData.education && profileData.education.length > 0) {
        const validEducation = profileData.education.filter(edu => 
          edu.institution && edu.institution.trim() && edu.degree && edu.degree.trim()
        );

        if (validEducation.length > 0) {
          const educationToInsert = validEducation.map(edu => ({
            student_id: userId,
            institution: edu.institution,
            degree: edu.degree,
            duration: edu.duration,
            coursework: edu.coursework
          }));

          const { error: educationError } = await supabase
            .from('student_education')
            .insert(educationToInsert);

          if (educationError) {
            console.error('ProfileService: Education insert error:', educationError);
            throw educationError;
          }
        }
      }

      // Update experiences
      console.log('ProfileService: Updating experiences...');
      console.log('ProfileService: Experiences data:', profileData.experiences);
      const { error: deleteExperiencesError } = await supabase
        .from('experiences')
        .delete()
        .eq('student_id', userId);

      if (deleteExperiencesError) {
        console.warn('ProfileService: Delete experiences warning:', deleteExperiencesError);
      }

      if (profileData.experiences && profileData.experiences.length > 0) {
        console.log('ProfileService: Processing', profileData.experiences.length, 'experiences');
        const validExperiences = profileData.experiences.filter(exp => {
          const isValid = exp.title && exp.title.trim() && exp.company && exp.company.trim();
          if (!isValid) {
            console.warn('ProfileService: Skipping invalid experience:', exp);
          }
          return isValid;
        });

        console.log('ProfileService: Valid experiences count:', validExperiences.length);

        if (validExperiences.length > 0) {
          const experiencesToInsert = validExperiences.map(exp => {
            const experienceRecord = {
              student_id: userId,
              title: exp.title,
              company: exp.company,
              duration: exp.duration || '',
              description: exp.description || ''
            };
            console.log('ProfileService: Inserting experience:', experienceRecord);
            return experienceRecord;
          });

          const { error: experiencesError } = await supabase
            .from('experiences')
            .insert(experiencesToInsert);

          if (experiencesError) {
            console.error('ProfileService: Experiences insert error:', experiencesError);
            console.error('ProfileService: Failed to insert experiences:', experiencesToInsert);
            throw new Error(`Failed to save experiences: ${experiencesError.message}`);
          }
          console.log('ProfileService: Experiences saved successfully');
        } else {
          console.log('ProfileService: No valid experiences to save');
        }
      }

      console.log('ProfileService: Update completed successfully');
      return {
        success: true,
        message: "Profile updated successfully!"
      };
    } catch (error) {
      console.error('ProfileService: Update profile error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update profile'
      };
    }
  }

  // Upload profile image
  async uploadProfileImage(userId, file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('ProfileService: Image upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Don't update profile here - let the caller handle it
      // This avoids double updates

      return {
        success: true,
        imageUrl: publicUrl
      };
    } catch (error) {
      console.error('ProfileService: Upload image error:', error);
      return {
        success: false,
        message: error.message || 'Failed to upload image'
      };
    }
  }
}

const profileService = new ProfileService();
export default profileService;