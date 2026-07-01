import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const isDemo = !supabaseUrl || !supabaseAnonKey

export const supabase = isDemo
  ? null
  : createClient(supabaseUrl, supabaseAnonKey)

export const USE_DEMO = isDemo
