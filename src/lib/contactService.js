import { supabase } from './supabase';

export const contactService = {
  async submitContactForm(formData) {
    try {
      console.log('Submitting contact form data:', formData);
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      const contactData = {
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phoneNumber || null,
        message: formData.message,
        user_id: user ? user.id : null,
      };

      console.log('Prepared contact data:', contactData);

      const { data, error } = await supabase
        .from('contact_messages')
        .insert([contactData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return { 
          success: false, 
          error: error.message || 'Failed to submit contact form' 
        };
      }

      console.log('Contact form submitted successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to submit contact form' 
      };
    }
  },

  // Get user's own contact messages (authenticated users only)
  async getUserContactMessages() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch contact messages' 
      };
    }
  },

  // Get all contact messages (admin/organization users only)
  async getAllContactMessages(limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching all contact messages:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch contact messages' 
      };
    }
  }
};