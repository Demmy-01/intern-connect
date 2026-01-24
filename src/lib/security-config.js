
/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required environment variable is missing
 */
export function validateEnvironment() {
    const requiredVars = {
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    };

    const missing = [];

    for (const [key, value] of Object.entries(requiredVars)) {
        if (!value) {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file and ensure all variables are set.'
        );
    }

    // Validate URL format
    const url = requiredVars.VITE_SUPABASE_URL;
    if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
        throw new Error(
            'Invalid VITE_SUPABASE_URL format. Expected: https://your-project.supabase.co'
        );
    }

    // Validate publishable key format
    const key = requiredVars.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!key.startsWith('sb_publishable_')) {
        throw new Error(
            'Invalid VITE_SUPABASE_PUBLISHABLE_KEY format. Expected key to start with "sb_publishable_"'
        );
    }
}

/**
 * Security best practices reminder
 */
export const SECURITY_NOTES = {
    PUBLISHABLE_KEY: 'The publishable key is safe to use in browsers when RLS is enabled',
    SECRET_KEY: 'NEVER use the secret key in browser code - only on servers',
    RLS_REQUIRED: 'Row Level Security (RLS) must be enabled on all Supabase tables',
};

/**
 * Check if we're in development mode
 */
export const isDevelopment = import.meta.env.DEV;

/**
 * Check if we're in production mode
 */
export const isProduction = import.meta.env.PROD;
