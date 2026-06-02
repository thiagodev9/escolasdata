import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { TurmasClient } from '@/components/turmas/turmas-client'

export default async function TurmasPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdmin()

  const { data: usuario } = await (admin as any)
    .from('usuarios').select('escola_id').eq('id', user?.id).single() as { data: { escola_id: string } | null }
  const escolaId = usuario?.escola_id ?? ''

  const [turmasRes, professoresRes] = await Promise.all([
    (admin as any)
      .from('turmas')
      .select('*, professor:usuarios(id, nome), alunos_turmas(aluno:alunos(id, nome, foto_url, status))')
      .eq('escola_id', escolaId)
      .order('nome'),
    (admin as any)
      .from('usuarios')
      .select('id, nome')
      .eq('escola_id', escolaId)
      .eq('role', 'professora')
      .order('nome'),
  ])

  return (
    <div className="p-6 lg:p-10">
      <TurmasClient
        turmas={turmasRes.data ?? []}
        professores={professoresRes.data ?? []}
        escolaId={escolaId}
      />
    </div>
  )
}
