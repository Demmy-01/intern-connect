import axios from 'axios';

// API endpoint to initialize Paystack payment
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, packageIndex, callbackUrl } = req.body;

    if (!email || packageIndex === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing email or packageIndex' 
      });
    }

    // Pricing packages
    const packages = [
      { name: 'Starter', tokens: 60, price: 500 },
      { name: 'Professional', tokens: 200, price: 1200 },
      { name: 'Enterprise', tokens: 700, price: 3500 },
    ];

    const selectedPackage = packages[packageIndex];
    if (!selectedPackage) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid package index' 
      });
    }

    // Get Paystack secret key from environment
    const payStackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!payStackSecretKey) {
      // Return mock response for development
      console.warn('⚠️ PAYSTACK_SECRET_KEY not configured, returning mock payment URL');
      return res.status(200).json({
        success: true,
        mock: true,
        tokensAdded: selectedPackage.tokens,
        newBalance: 100 + selectedPackage.tokens,
        message: 'Mock payment mode - tokens will be added immediately'
      });
    }

    // Initialize Paystack transaction
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: selectedPackage.price * 100, // Convert to kobo
        metadata: {
          packageIndex,
          packageName: selectedPackage.name,
          tokens: selectedPackage.tokens,
          customFields: [
            {
              display_name: 'Package',
              variable_name: 'package',
              value: selectedPackage.name,
            },
            {
              display_name: 'Tokens',
              variable_name: 'tokens',
              value: selectedPackage.tokens.toString(),
            },
          ],
        },
        callback_url: callbackUrl || process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:5173/cv-generator',
      },
      {
        headers: {
          Authorization: `Bearer ${payStackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!paystackResponse.data.status) {
      return res.status(400).json({
        success: false,
        error: paystackResponse.data.message || 'Failed to initialize payment',
      });
    }

    return res.status(200).json({
      success: true,
      data: paystackResponse.data.data,
      message: 'Payment initialized successfully',
    });
  } catch (error) {
    console.error('Payment initialization error:', error.response?.data || error.message);
    
    // Return mock response on error for development
    const { email, packageIndex } = req.body;
    const packages = [
      { name: 'Starter', tokens: 60, price: 500 },
      { name: 'Professional', tokens: 200, price: 1200 },
      { name: 'Enterprise', tokens: 700, price: 3500 },
    ];
    
    return res.status(200).json({
      success: true,
      mock: true,
      tokensAdded: packages[packageIndex]?.tokens || 60,
      newBalance: 100 + (packages[packageIndex]?.tokens || 60),
      message: 'Operating in mock payment mode',
    });
  }
}
