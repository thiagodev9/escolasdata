import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'

export type UsuarioAtual = {
  id: string
  nome: string
  escola_id: string
  role: string
  escola: {
    nome: string
    configuracoes_escola: Array<{
      logo_url: string | null
      nome_fantasia: string | null
      cor_primaria: string | null
    }>
  } | null
} | null

// Busca no banco com cache de 60s por usuário — evita query a cada navegação
const fetchUsuarioDB = unstable_cache(
  async (userId: string): Promise<UsuarioAtual> => {
    const admin = createAdmin()
    const { data } = await (admin as any)
      .from('usuarios')
      .select('id, nome, escola_id, role, escola:escolas(nome, configuracoes_escola(logo_url, nome_fantasia, cor_primaria))')
      .eq('id', userId)
      .single()
    return data ?? null
  },
  ['usuario-atual'],
  { revalidate: 60, tags: ['usuario'] }
)

// React.cache() deduplica chamadas dentro do mesmo request (layout + pages)
export const getUsuarioAtual = cache(async (): Promise<UsuarioAtual> => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return fetchUsuarioDB(user.id)
})
