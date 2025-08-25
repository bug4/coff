import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('URL:', supabaseUrl);
  console.error('Key exists:', !!supabaseAnonKey);
  throw new Error('Missing Supabase environment variables. Check your .env file or Netlify environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Confession = {
  id: string;
  name: string;
  confession: string;
  severity: string;
  mode: 'heaven' | 'hell';
  likes: number;
  created_at: string;
};