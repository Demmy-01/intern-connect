import { supabase } from './supabase';

class AuthService {
  // Check if email already exists in the system
  async checkEmailExists(email) {
    try {
      // Check in auth.users (if accessible)
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .limit(1);

      if (error) {
        console.warn('Error checking email:', error);
        // If we can't check, assume it might exist to be safe
        return false;
      }

      return data && data.length > 0; // True if email exists
    } catch (error) {
      console.warn('Error checking email existence:', error);
      return false;
    }
  }

  // Student Authentication Methods
  async signUpStudent(email, password, username) {
    try {
      // Check if email already exists
      const emailExists = await this.checkEmailExists(email);
      if (emailExists) {
        return {
          success: false,
          message: "This email is already registered. Please use a different email or try logging in."
        };
      }

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
        // Check if error is about email already existing
        if (error.message && error.message.toLowerCase().includes('user already registered')) {
          return {
            success: false,
            message: "This email is already registered. Please use a different email or try logging in."
          };
        }
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

  // Admin Authentication Methods
  async signInAdmin(email, password) {
    try {
      if (!email.includes('@')) {
        return {
          success: false,
          message: "Please use your admin email address to login."
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

      // Verify this is an admin account
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .single();

      if (profileError || profile.user_type !== 'admin') {
        await supabase.auth.signOut();
        return {
          success: false,
          message: "Invalid admin credentials. You don't have admin access."
        };
      }

      // Get admin details
      const { data: adminProfile, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (adminError) {
        await supabase.auth.signOut();
        return {
          success: false,
          message: "Admin profile not found."
        };
      }

      // Update last login
      await supabase
        .from('admins')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      // Log the login activity
      await this.logAdminActivity(data.user.id, 'login', null, null, {
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        message: "Admin login successful!",
        user: data.user,
        userType: 'admin',
        adminProfile
      };
    } catch (error) {
      console.error('Admin sign in error:', error);
      return {
        success: false,
        message: "An error occurred during admin sign in."
      };
    }
  }

  // Create admin account (should only be called by super admin or during initial setup)
  async createAdmin(email, password, displayName, role = 'admin', department = null) {
    try {
      // Check if current user is super admin (except for initial setup)
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        const { data: currentAdmin } = await supabase
          .from('admins')
          .select('role')
          .eq('id', currentUser.id)
          .single();

        if (!currentAdmin || currentAdmin.role !== 'super_admin') {
          return {
            success: false,
            message: "Only super admins can create new admin accounts."
          };
        }
      }

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: 'admin',
            username: email.split('@')[0],
            display_name: displayName
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?type=admin`
        }
      });

      if (error) {
        return {
          success: false,
          message: error.message
        };
      }

      // The profile should be created by a database trigger or you need to create it manually
      // Wait a bit for the profile to be created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create admin record
      const { error: adminError } = await supabase
        .from('admins')
        .insert({
          id: data.user.id,
          role,
          department,
          permissions: {
            manage_users: true,
            manage_organizations: true,
            manage_internships: true,
            view_analytics: true
          }
        });

      if (adminError) {
        console.error('Error creating admin record:', adminError);
        return {
          success: false,
          message: "Failed to create admin profile."
        };
      }

      return {
        success: true,
        message: "Admin account created successfully!",
        user: data.user,
        userType: 'admin'
      };
    } catch (error) {
      console.error('Create admin error:', error);
      return {
        success: false,
        message: "An error occurred while creating admin account."
      };
    }
  }

  // Log admin activity
  async logAdminActivity(adminId, action, targetType = null, targetId = null, details = {}) {
    try {
      await supabase
        .from('admin_activity_logs')
        .insert({
          admin_id: adminId,
          action,
          target_type: targetType,
          target_id: targetId,
          details,
          ip_address: null // You can add IP detection if needed
        });
    } catch (error) {
      console.error('Error logging admin activity:', error);
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

  // Update Password
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
      } else if (profile.user_type === 'admin') {
        const { data: adminProfile } = await supabase
          .from('admins')
          .select('*')
          .eq('id', user.id)
          .single();
        detailedProfile = adminProfile;
        console.log("authService: Admin profile fetched:", adminProfile);
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

  // Legacy methods for backward compatibility
  async signUp(email, password, username) {
    return this.signUpStudent(email, password, username);
  }

  async signIn(emailOrUsername, password) {
    return this.signInStudent(emailOrUsername, password);
  }
}

const authService = new AuthService();
export default authService;