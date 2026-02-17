// API endpoint to get token pricing
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const pricing = {
      success: true,
      packages: [
        {
          name: 'Starter',
          tokens: 50,
          bonus: 10,
          price: 500,
        },
        {
          name: 'Professional',
          tokens: 150,
          bonus: 50,
          price: 1200,
        },
        {
          name: 'Enterprise',
          tokens: 500,
          bonus: 200,
          price: 3500,
        },
      ],
      costs: {
        AI_SUGGESTION: 20,
        ATS_ANALYSIS: 30,
        INITIAL_FREE_TOKENS: 100,
      },
    };

    return res.status(200).json(pricing);
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch pricing' 
    });
  }
}
