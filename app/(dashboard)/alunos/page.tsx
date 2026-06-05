import { createClient as createAdmin } from '@/lib/supabase/admin'
import { AlunosClient } from '@/components/alunos/alunos-client'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'
import { redirect } from 'next/navigation'

export default async function AlunosPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect('/login')

  const admin = createAdmin()
  const escolaId = usuario.escola_id

  const [alunosRes, turmasRes] = await Promise.all([
    (admin as any)
      .from('alunos')
      .select('*, alunos_turmas(turma:turmas(id, nome)), alunos_responsaveis(responsaveis(nome, telefone))')
      .eq('escola_id', escolaId)
      .order('nome'),
    (admin as any)
      .from('turmas')
      .select('id, nome')
      .eq('escola_id', escolaId)
      .order('nome'),
  ])

  const alunos = (alunosRes.data ?? []).map((a: any) => {
    const resp = a.alunos_responsaveis?.[0]?.responsaveis
    return {
      ...a,
      turma_nome:       a.alunos_turmas?.[0]?.turma?.nome ?? null,
      turma_id:         a.alunos_turmas?.[0]?.turma?.id   ?? null,
      responsavel_nome: resp?.nome     ?? null,
      responsavel_tel:  resp?.telefone ?? null,
    }
  })

  return (
    <div className="p-6 lg:p-10">
      <AlunosClient
        alunos={alunos}
        turmas={turmasRes.data ?? []}
        escolaId={escolaId}
      />
    </div>
  )
}
