import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hroatjeyouqcbdfrgknj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyb2F0amV5b3VxY2JkZnJna25qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNTM5OTIsImV4cCI6MjA3MjgyOTk5Mn0.hnXyuekYNlh9tjVENbHMkwX8REvWpLq9ARV5XrCyQIM'

export const supabase = createClient(supabaseUrl, supabaseKey)