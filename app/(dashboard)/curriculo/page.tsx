export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { CurriculoClient } from '@/components/curriculo/curriculo-client'

export default async function CurriculoPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdmin()
  const { data: usuario } = await (admin as any)
    .from('usuarios')
    .select('escola_id, role')
    .eq('id', user.id)
    .single()

  if (!usuario || !['super_admin','diretora','professora'].includes(usuario.role)) redirect('/dashboard')

  const { data: turmas } = await (admin as any)
    .from('turmas')
    .select('id, nome')
    .eq('escola_id', usuario.escola_id)
    .order('nome')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <CurriculoClient
        turmas={turmas ?? []}
        escolaId={usuario.escola_id}
        userId={user.id}
        userRole={usuario.role}
      />
    </div>
  )
}
