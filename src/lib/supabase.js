import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Solo-mode RLS: every row is gated on this user_id. There's no Supabase Auth
// in the app (PIN gate only), so we attach this id to every read and write.
export const USER_ID = 'c9ba3089-6667-4386-a22c-2956f7c01442';

export const isSupabaseConnected = () => !!supabase;
