import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Client com service_role — bypassa RLS. Usar apenas no servidor.
export function createClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
