import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { PresencaClient } from '@/components/presenca/presenca-client'

export default async function PresencaPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdmin()

  const { data: usuario } = await (admin as any)
    .from('usuarios').select('escola_id, role').eq('id', user?.id).single() as { data: any }

  const escolaId = usuario?.escola_id ?? ''
  const hoje = new Date().toISOString().split('T')[0]

  const [alunosRes, turmasRes, presencasRes] = await Promise.all([
    (admin as any)
      .from('alunos')
      .select('id, nome, foto_url, status, alunos_turmas(turma:turmas(id, nome))')
      .eq('escola_id', escolaId)
      .eq('status', 'ativo')
      .order('nome'),
    (admin as any)
      .from('turmas').select('id, nome').eq('escola_id', escolaId).order('nome'),
    (admin as any)
      .from('presencas').select('*').eq('escola_id', escolaId).eq('data', hoje),
  ])

  const alunos = (alunosRes.data ?? []).map((a: any) => ({
    ...a,
    turma_nome: a.alunos_turmas?.[0]?.turma?.nome ?? null,
    turma_id:   a.alunos_turmas?.[0]?.turma?.id   ?? null,
  }))

  const presencasMap: Record<string, any> = {}
  for (const p of presencasRes.data ?? []) {
    presencasMap[p.aluno_id] = p
  }

  return (
    <div className="p-6 lg:p-10">
      <PresencaClient
        alunos={alunos}
        turmas={turmasRes.data ?? []}
        presencasHoje={presencasMap}
        escolaId={escolaId}
        dataHoje={hoje}
      />
    </div>
  )
}
