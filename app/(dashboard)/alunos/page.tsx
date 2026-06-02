import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { AlunosClient } from '@/components/alunos/alunos-client'

export default async function AlunosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdmin()
  const { data: usuario } = await (admin as any)
    .from('usuarios').select('escola_id').eq('id', user?.id).single() as { data: { escola_id: string } | null }

  const escolaId = usuario?.escola_id ?? ''

  const [alunosRes, turmasRes, respsRes] = await Promise.all([
    (admin as any)
      .from('alunos')
      .select('*, alunos_turmas(turma:turmas(id, nome))')
      .eq('escola_id', escolaId)
      .order('nome'),
    (admin as any)
      .from('turmas')
      .select('id, nome')
      .eq('escola_id', escolaId)
      .order('nome'),
    (admin as any)
      .from('alunos_responsaveis')
      .select('aluno_id, principal, responsaveis(nome, telefone)')
      .eq('responsaveis.escola_id', escolaId),
  ])

  // Monta mapa aluno_id -> responsável principal
  const respMap: Record<string, { nome: string; telefone: string }> = {}
  for (const ar of (respsRes.data ?? [])) {
    if (!respMap[ar.aluno_id] || ar.principal) {
      respMap[ar.aluno_id] = {
        nome:     ar.responsaveis?.nome     ?? '',
        telefone: ar.responsaveis?.telefone ?? '',
      }
    }
  }

  const alunos = (alunosRes.data ?? []).map((a: any) => ({
    ...a,
    turma_nome:       a.alunos_turmas?.[0]?.turma?.nome ?? null,
    turma_id:         a.alunos_turmas?.[0]?.turma?.id   ?? null,
    responsavel_nome: respMap[a.id]?.nome     ?? null,
    responsavel_tel:  respMap[a.id]?.telefone ?? null,
  }))

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
