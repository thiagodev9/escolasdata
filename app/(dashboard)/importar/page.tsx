import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { ImportarClient } from '@/components/importar/importar-client'

export const dynamic = 'force-dynamic'

export default async function ImportarPage() {
  const supabase = createClient()
  const { data: { user } } = await (supabase as any).auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdmin() as any
  const { data: usuario } = await admin.from('usuarios').select('escola_id, role').eq('id', user.id).single()
  if (!usuario || !['diretora', 'super_admin'].includes(usuario.role)) redirect('/dashboard')

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
