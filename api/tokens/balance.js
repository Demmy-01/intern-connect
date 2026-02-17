import { supabaseAdmin } from '../lib/supabaseAdmin.js';

// API endpoint to get user's token balance
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For development/testing, return a default balance
      console.warn('No authorization header, returning default balance');
      return res.status(200).json({ 
        success: true, 
        balance: 100 // Default free tokens for new users
      });
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.warn('Authentication failed, returning default balance');
      return res.status(200).json({ 
        success: true, 
        balance: 100 
      });
    }

    // Get user's token balance from database
    const { data, error } = await supabaseAdmin
      .from('user_tokens')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // User doesn't have a record, create one with initial balance
      const initialBalance = 100;
      await supabaseAdmin.from('user_tokens').insert({
        user_id: user.id,
        balance: initialBalance,
        created_at: new Date().toISOString(),
      });
      
      return res.status(200).json({ 
        success: true, 
        balance: initialBalance 
      });
    }

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch token balance' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      balance: data?.balance || 100 
    });
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch token balance' 
    });
  }
}
