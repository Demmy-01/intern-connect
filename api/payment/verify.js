import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ success: false, error: 'Missing payment reference' });
    }

    const payStackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!payStackSecretKey) {
      return res.status(500).json({ success: false, error: 'Payment service not configured' });
    }

    // Verify payment with Paystack
    const verifyResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${payStackSecretKey}` } }
    );

    if (!verifyResponse.data.status) {
      return res.status(400).json({
        success: false,
        error: verifyResponse.data.message || 'Payment verification failed',
      });
    }

    const tx = verifyResponse.data.data;

    if (tx.status !== 'success') {
      return res.status(400).json({
        success: false,
        error: 'Payment was not completed successfully',
        status: tx.status,
      });
    }

    const tokensAdded = tx.metadata?.tokens || 60;
    const userId = tx.metadata?.userId;
    const email = (tx.customer?.email || '').toLowerCase().trim();
    const packageName = tx.metadata?.packageName || 'Token Package';

    let newBalance = tokensAdded;

    // Credit tokens to Supabase if we have a userId
    if (userId) {
      // Get current balance
      const { data: existing } = await supabase
        .from('user_tokens')
        .select('balance, total_purchased')
        .eq('user_id', userId)
        .single();

      const currentBalance = existing?.balance ?? 0;
      const currentPurchased = existing?.total_purchased ?? 0;
      newBalance = currentBalance + tokensAdded;

      // Upsert token record
      const { error: upsertError } = await supabase
        .from('user_tokens')
        .upsert({
          user_id: userId,
          balance: newBalance,
          total_purchased: currentPurchased + tokensAdded,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (upsertError) {
        console.error('Error upserting tokens:', upsertError);
        return res.status(500).json({ success: false, error: 'Failed to credit tokens' });
      }

      // Log transaction
      await supabase.from('token_transactions').insert([{
        user_id: userId,
        transaction_type: 'purchase',
        amount: tokensAdded,
        description: `Paystack payment: ${packageName}`,
        reference,
        balance_after: newBalance,
      }]);

      console.log(`✅ Credited ${tokensAdded} tokens to user ${userId}. New balance: ${newBalance}`);
    }

    return res.status(200).json({
      success: true,
      tokensAdded,
      newBalance,
      reference,
      email,
      message: 'Payment verified and tokens credited successfully',
    });

  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || 'Verification failed',
    });
  }
}
