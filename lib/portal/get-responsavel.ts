import { cache } from 'react'
import { createClient as createAdminClient } from '@/lib/supabase/admin'

// React cache() deduplicates this call within the same request —
// layout e pages chamam esta função mas o banco é consultado só uma vez.
export const getResponsavel = cache(async (email: string) => {
  const admin = createAdminClient()
  const { data } = await (admin as any)
    .from('responsaveis')
    .select('id, nome, escola_id')
    .eq('email', email)
    .maybeSingle() as { data: { id: string; nome: string; escola_id: string } | null }
  return data
})
