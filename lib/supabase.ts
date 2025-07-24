import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('⚠️  NEXT_PUBLIC_SUPABASE_URL is not set. Authentication will not work properly.')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Authentication will not work properly.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 