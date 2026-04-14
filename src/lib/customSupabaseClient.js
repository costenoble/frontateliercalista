import { createClient } from '@supabase/supabase-js';

const legacySupabaseUrl = 'https://frynmmxfngvfhkcmenga.supabase.co';
const legacySupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeW5tbXhmbmd2ZmhrY21lbmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTYzNDksImV4cCI6MjA3Nzg3MjM0OX0.AvKY2vEosASjkVSd1vxSLe58sbRsqBktylelK5SrOc4';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || legacySupabaseUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || legacySupabaseAnonKey;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Using legacy Supabase fallback. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to switch to the new clean project.');
}

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
