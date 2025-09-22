import { supabase } from './supabase';

class AuthService {
  // Student Authentication Methods
  async signUpStudent(email, password, username) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: 'student',
            username: username,
            display_name: username
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?type=student`
        }
      });

      if (error) {
        return {
          success: false,
          message: error.message
        };
      }

      return {
        success: true,
        message: "Account created! Please check your email to verify your account.",
        user: data.user,
        userType: 'student'
      };
    } catch (error) {
      return {
        success: false,
        message: "An error occurred during student sign up."
      };
    }
  }

  async signInStudent(email, password) {
    try {
      if (!email.includes('@')) {
        return {
          success: false,
          message: "Please use your email address to login."
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return {
          success: false,
          message: error.message
        };
      }

      // Verify this is a student account
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .single();

      if (profileError || profile.user_type !== 'student') {
        await supabase.auth.signOut();
        return {
          success: false,
          message: "Invalid student credentials. Please use the organization login if you're an organization."
        };
      }

      return {
        success: true,
        message: "Login successful!",
        user: data.user,
        userType: 'student'
      };
    } catch (error) {
      return {
        success: false,
        message: "An error occurred during student sign in."
      };
    }
  }

  // Organization Authentication Methods
  async signUpOrganization(formData) {
    try {
      const { organizationName, email, phone, password } = formData;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: 'organization',
            username: organizationName,
            company_name: organizationName,
            display_name: organizationName,
            phone: phone || null
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?type=organization`
        }
      });

      if (error) {
        return {
          success: false,
          message: error.message
        };
      }

      return {
        success: true,
        message: "Organization account created! Please check your email to verify your account.",
        user: data.user,
        userType: 'organization'
      };
    } catch (error) {
      return {
        success: false,
        message: "An error occurred during organization sign up."
      };
    }
  }

  async signInOrganization(email, password) {
    try {
      if (!email.includes('@')) {
        return {
          success: false,
          message: "Please use your organization email address to login."
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return {
          success: false,
          message: error.message
        };
      }

      // Verify this is an organization account
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .single();

      if (profileError || profile.user_type !== 'organization') {
        await supabase.auth.signOut();
        return {
          success: false,
          message: "Invalid organization credentials. Please use the student login if you're a student."
        };
      }

      return {
        success: true,
        message: "Login successful!",
        user: data.user,
        userType: 'organization'
      };
    } catch (error) {
      return {
        success: false,
        message: "An error occurred during organization sign in."
      };
    }
  }

  // Google Sign-in (Student only)
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?type=student&provider=google`,
          queryParams: {
            user_type: 'student'
          }
        }
      });

      if (error) {
        return {
          success: false,
          message: error.message
        };
      }

      return {
        success: true,
        message: "Redirecting to Google...",
        data
      };
    } catch (error) {
      return {
        success: false,
        message: "An error occurred with Google sign-in."
      };
    }
  }

  // Password Reset
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return {
          success: false,
          message: error.message
        };
      }

      return {
        success: true,
        message: "Password reset email sent! Check your inbox."
      };
    } catch (error) {
      return {
        success: false,
        message: "An error occurred while sending reset email."
      };
    }
  }

  // Update Password - NEW METHOD
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return {
          success: false,
          message: error.message
        };
      }

      return {
        success: true,
        message: "Password updated successfully!",
        user: data.user
      };
    } catch (error) {
      console.error('Error updating password:', error);
      return {
        success: false,
        message: "An error occurred while updating password."
      };
    }
  }

  // Get user profile with type
  async getUserProfile() {
    try {
      console.log("authService: getUserProfile called");
      const { data: { user } } = await supabase.auth.getUser();
      console.log("authService: supabase.auth.getUser result:", user);
      
      if (!user) {
        console.log("authService: No user found");
        return { user: null, profile: null, userType: null };
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log("authService: Profile query result:", profile, error);

      if (error) {
        console.error('Error fetching profile:', error);
        return { user, profile: null, userType: null };
      }

      // Get detailed profile based on user type
      let detailedProfile = null;
      if (profile.user_type === 'student') {
        const { data: studentProfile } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();
        detailedProfile = studentProfile;
        console.log("authService: Student profile fetched:", studentProfile);
      } else if (profile.user_type === 'organization') {
        const { data: orgProfile } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', user.id)
          .single();
        detailedProfile = orgProfile;
        console.log("authService: Organization profile fetched:", orgProfile);
      }

      return {
        user,
        profile: { ...profile, ...detailedProfile },
        userType: profile.user_type
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return { user: null, profile: null, userType: null };
    }
  }

  // Auth state change listener
  onAuthStateChanged(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profileData = await this.getUserProfile();
          callback(profileData);
        } else {
          callback({ user: null, profile: null, userType: null });
        }
      }
    );

    return () => subscription?.unsubscribe();
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: "Signed out successfully" };
    } catch (error) {
      return { success: false, message: "An error occurred during sign out" };
    }
  }

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // Legacy methods for backward compatibility (update existing calls)
  async signUp(email, password, username) {
    return this.signUpStudent(email, password, username);
  }

  async signIn(emailOrUsername, password) {
    return this.signInStudent(emailOrUsername, password);
  }
}

const authService = new AuthService();
export default authService;