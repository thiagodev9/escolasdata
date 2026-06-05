export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { CurriculoClient } from '@/components/curriculo/curriculo-client'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'

export default async function CurriculoPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario || !['super_admin','diretora','professora'].includes(usuario.role)) redirect('/dashboard')

  const admin = createAdmin()

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
        userId={usuario.id}
        userRole={usuario.role}
      />
    </div>
  )
}
