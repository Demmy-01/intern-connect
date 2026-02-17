import axios from 'axios';

// Detect API URL - works on any server
const getAPIBaseURL = () => {
    // Use environment variable if provided
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    
    // Use same origin + /api for universal compatibility
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${hostname}${port}/api`;
};

const API_BASE_URL = getAPIBaseURL();

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Get user's token balance
 */
export async function getTokenBalance() {
    const response = await api.get('/tokens/balance');
    return response.data;
}

/**
 * Get token pricing information
 */
export async function getTokenPricing() {
    const response = await api.get('/tokens/pricing');
    return response.data;
}

/**
 * Get AI suggestion for CV content
 * @param {string} content - Original content
 * @param {string} section - Section type (summary, experience, etc.)
 */
export async function getAISuggestion(content, section = 'general') {
    const response = await api.post('/ai/suggest', { content, section });
    return response.data;
}

/**
 * Initialize payment transaction
 * @param {string} email - User's email
 * @param {number} packageIndex - Selected package index
 */
export async function initializePayment(email, packageIndex) {
    const response = await api.post('/payment/initialize', {
        email,
        packageIndex,
        callbackUrl: window.location.origin // Add current URL as callback
    });
    return response.data;
}

/**
 * Verify payment transaction
 * @param {string} reference - Payment reference from Paystack
 */
export async function verifyPayment(reference) {
    try {
        const response = await api.post('/payment/verify', { reference });
        return response.data;
    } catch (error) {
        console.error('Payment verification error:', error);
        throw error;
    }
}

/**
 * Check API health
 */
export async function checkHealth() {
    const response = await api.get('/health');
    return response.data;
}

// ==================== ATS API Functions ====================

/**
 * Calculate ATS score for CV data
 */
export async function calculateATSScore(cvData) {
    const response = await api.post('/ats/score', { cvData });
    return response.data;
}

/**
 * Get detailed ATS analysis
 */
export async function getATSAnalysis(cvData) {
    const response = await api.post('/ats/analyze', { cvData });
    return response.data;
}

/**
 * Get AI recommendations for a specific section
 */
export async function getATSRecommendation(section, content, score) {
    const response = await api.post('/ats/recommend', { section, content, score });
    return response.data;
}

export default api;
