import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ColaboradoresClient } from '@/components/colaboradores/colaboradores-client'

export const dynamic = 'force-dynamic'

export default async function ColaboradoresPage() {
  const supabase = createClient()

  const { data: { user } } = await (supabase as any).auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await (supabase as any)
    .from('usuarios')
    .select('escola_id, role')
    .eq('id', user.id)
    .single()

  if (!usuario || !['super_admin','diretora'].includes(usuario.role)) redirect('/dashboard')

  const { data: colaboradores } = await (supabase as any)
    .from('colaboradores')
    .select('*')
    .eq('escola_id', usuario.escola_id)
    .order('nome')

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ColaboradoresClient
        colaboradores={colaboradores ?? []}
        escolaId={usuario.escola_id}
      />
    </div>
  )
}
