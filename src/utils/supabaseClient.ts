import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-public-key';

console.log('[Supabase Client Diagnostics]');
console.log('NEXT_PUBLIC_SUPABASE_URL is present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY is present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('Initialized URL path:', supabaseUrl);

// Automatically sanitize URL in case user copy-pasted the REST API endpoint instead of project URL
if (supabaseUrl.endsWith('/rest/v1/')) {
  supabaseUrl = supabaseUrl.slice(0, -9);
} else if (supabaseUrl.endsWith('/rest/v1')) {
  supabaseUrl = supabaseUrl.slice(0, -8);
}

export const getSupabaseClientStatus = () => {
  const isConfigured = 
    supabaseUrl && 
    supabaseUrl !== 'https://your-supabase-project.supabase.co' && 
    supabaseUrl !== '' &&
    supabaseAnonKey && 
    supabaseAnonKey !== 'your-anon-public-key' &&
    supabaseAnonKey !== '';
  return {
    isConfigured,
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey
  };
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);



