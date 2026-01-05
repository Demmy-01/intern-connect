// supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Regular client for normal operations ONLY
// SECURITY: Never expose SERVICE_ROLE_KEY in browser - it grants admin access
export const supabase = createClient(supabaseUrl, supabaseAnonKey)