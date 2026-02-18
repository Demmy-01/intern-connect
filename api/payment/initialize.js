import axios from 'axios';

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
    const { email, packageIndex, callbackUrl, userId } = req.body;

    if (!email || packageIndex === undefined) {
      return res.status(400).json({ success: false, error: 'Missing email or packageIndex' });
    }

    const packages = [
      { name: 'Starter', tokens: 60, bonus: 10, price: 500 },
      { name: 'Professional', tokens: 200, bonus: 50, price: 1200 },
      { name: 'Enterprise', tokens: 700, bonus: 200, price: 3500 },
    ];

    const selectedPackage = packages[packageIndex];
    if (!selectedPackage) {
      return res.status(400).json({ success: false, error: 'Invalid package index' });
    }

    const payStackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!payStackSecretKey) {
      return res.status(500).json({ success: false, error: 'Payment service not configured' });
    }

    const totalTokens = selectedPackage.tokens + (selectedPackage.bonus || 0);

    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: selectedPackage.price * 100, // kobo
        metadata: {
          packageIndex,
          packageName: selectedPackage.name,
          tokens: totalTokens,
          userId, // stored so verify.js can credit the right user
          customFields: [
            { display_name: 'Package', variable_name: 'package', value: selectedPackage.name },
            { display_name: 'Tokens', variable_name: 'tokens', value: String(totalTokens) },
          ],
        },
        callback_url: callbackUrl || `${process.env.FRONTEND_URL || 'https://intern-connect.vercel.app'}/cv-generator`,
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
    return res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || 'Payment initialization failed',
    });
  }
}
