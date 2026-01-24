import { createClient } from '@supabase/supabase-js'
import { validateEnvironment, isDevelopment } from './security-config.js'

try {
    validateEnvironment();
} catch (error) {
    console.error('❌ Supabase Configuration Error:', error.message);
    throw error;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
})

if (isDevelopment) {
    console.log('✅ Supabase client initialized with publishable key');
}