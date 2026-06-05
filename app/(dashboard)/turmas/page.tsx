import { createClient as createAdmin } from '@/lib/supabase/admin'
import { TurmasClient } from '@/components/turmas/turmas-client'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'
import { redirect } from 'next/navigation'

export default async function TurmasPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect('/login')

  const admin = createAdmin()
  const escolaId = usuario.escola_id

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
