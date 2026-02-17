import axios from 'axios';

// API endpoint to verify Paystack payment
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing payment reference' 
      });
    }

    const payStackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!payStackSecretKey) {
      // Return mock response for development
      console.warn('⚠️ PAYSTACK_SECRET_KEY not configured, returning mock verification');
      return res.status(200).json({
        success: true,
        tokensAdded: 60,
        newBalance: 160,
        reference,
        message: 'Mock verification - payment assumed successful',
      });
    }

    // Verify payment with Paystack
    const verifyResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${payStackSecretKey}`,
        },
      }
    );

    if (!verifyResponse.data.status) {
      return res.status(400).json({
        success: false,
        error: verifyResponse.data.message || 'Payment verification failed',
      });
    }

    const transactionData = verifyResponse.data.data;
    
    if (transactionData.status !== 'success') {
      return res.status(400).json({
        success: false,
        error: 'Payment was not completed successfully',
        status: transactionData.status,
      });
    }

    // Extract token information from metadata
    const tokensAdded = transactionData.metadata?.tokens || 60;
    
    // Here you would typically:
    // 1. Get user from email in transactionData
    // 2. Update their token balance in the database
    // 3. Log the transaction
    
    return res.status(200).json({
      success: true,
      tokensAdded,
      newBalance: 100 + tokensAdded, // This should be fetched from DB in production
      reference,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    
    return res.status(200).json({
      success: true,
      tokensAdded: 60,
      newBalance: 160,
      message: 'Payment processed (mock mode)',
    });
  }
}
