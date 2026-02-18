import { supabase } from './supabase';

/**
 * CV Data Service - Handle all CV data operations with Supabase
 */

// Get current user's CV data
export const getCVData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('cv_data')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching CV data:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error in getCVData:', error);
    return null;
  }
};

// Save or update CV data
export const saveCVData = async (cvData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const now = new Date().toISOString();
    const cvPayload = {
      user_id: user.id,
      full_name: cvData.fullName || null,
      email: cvData.email || null,
      phone: cvData.phone || null,
      linkedin: cvData.linkedin || null,
      location: cvData.location || null,
      summary: cvData.summary || null,
      education: cvData.education || [],
      experiences: cvData.experiences || [],
      projects: cvData.projects || [],
      skills: cvData.skills || null,
      languages: cvData.languages || null,
      certifications: cvData.certifications || null,
      template_name: cvData.templateName || 'modern',
      last_saved_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('cv_data')
      .upsert(cvPayload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving CV data:', error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error('Error in saveCVData:', error);
    return { error };
  }
};


// Auto-save CV data (debounced from frontend)
export const autoSaveCVData = async (formData) => {
  return saveCVData(formData);
};

// Get user's token balance from Supabase
export const getTokenBalance = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase
      .from('user_tokens')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching token balance:', error);
      return 0;
    }

    return data?.balance ?? 0;
  } catch (error) {
    console.error('Error in getTokenBalance:', error);
    return 0;
  }
};

// Deduct tokens for AI suggestions or other features
export const deductTokens = async (amount, description) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current balance
    const balanceData = await getTokenBalance();
    if (balanceData < amount) {
      return { error: 'Insufficient tokens' };
    }

    // Update balance
    const newBalance = balanceData - amount;
    const { error: updateError } = await supabase
      .from('user_tokens')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error deducting tokens:', updateError);
      return { error: updateError };
    }

    // Log transaction
    await supabase
      .from('token_transactions')
      .insert([
        {
          user_id: user.id,
          transaction_type: 'usage',
          amount: -amount,
          description,
          balance_after: newBalance,
          created_at: new Date().toISOString(),
        },
      ]);

    return { success: true, newBalance };
  } catch (error) {
    console.error('Error in deductTokens:', error);
    return { error };
  }
};

// Initialize token balance for new user
export const initializeTokenBalance = async (initialBalance = 100) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if already exists
    const { data: existingTokens } = await supabase
      .from('user_tokens')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (existingTokens) {
      console.log(`✅ User already has tokens: ${existingTokens.balance}`);
      return { data: existingTokens };
    }

    // Create new token record with initialBalance (default 100 free tokens)
    const { data, error } = await supabase
      .from('user_tokens')
      .insert([
        {
          user_id: user.id,
          balance: initialBalance,
          total_purchased: 0,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Error initializing token balance:', error);
      return { error };
    }

    console.log(`✅ Initialized ${initialBalance} free tokens for new user ${user.id}`);
    return { data: data[0] };
  } catch (error) {
    console.error('Error in initializeTokenBalance:', error);
    return { error };
  }
};

// Get transaction history
export const getTransactionHistory = async (limit = 50) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTransactionHistory:', error);
    return [];
  }
};

// Subscribe to real-time CV data changes
export const subscribeToCV = async (callback) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return supabase
      .from('cv_data')
      .on('*', (payload) => {
        if (payload.new.user_id === user.id) {
          callback(payload.new);
        }
      })
      .subscribe();
  } catch (error) {
    console.error('Error in subscribeToCV:', error);
    return null;
  }
};

// Subscribe to real-time token balance changes
export const subscribeToTokenBalance = async (callback) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return supabase
      .from('user_tokens')
      .on('UPDATE', (payload) => {
        if (payload.new.user_id === user.id) {
          callback(payload.new.balance);
        }
      })
      .subscribe();
  } catch (error) {
    console.error('Error in subscribeToTokenBalance:', error);
    return null;
  }
};
