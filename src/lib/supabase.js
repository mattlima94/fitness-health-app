import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nfjlhfyombyzjknsdtfp.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mamxoZnlvbWJ5emprbnNkdGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDIxMjMsImV4cCI6MjA4OTA3ODEyM30.ajU8Kpzd2gdM_kRx5nqsI-WTuE6i1cHlS84MWAdV1qI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
