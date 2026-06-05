import { createClient as createAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { ImportarClient } from '@/components/importar/importar-client'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'

export const dynamic = 'force-dynamic'

export default async function ImportarPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario || !['diretora', 'super_admin'].includes(usuario.role)) redirect('/dashboard')

  const admin = createAdmin() as any
  const [alunosRes, colaboradoresRes] = await Promise.all([
    admin.from('alunos').select('id', { count: 'exact' }).eq('escola_id', usuario.escola_id).limit(1),
    admin.from('colaboradores').select('id', { count: 'exact' }).eq('escola_id', usuario.escola_id).limit(1),
  ])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ImportarClient
        temAlunos={(alunosRes.count ?? 0) > 0}
        temColaboradores={(colaboradoresRes.count ?? 0) > 0}
      />
    </div>
  )
}
