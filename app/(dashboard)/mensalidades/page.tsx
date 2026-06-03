import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { MensalidadesClient, type AlunoComMensalidade } from '@/components/mensalidades/mensalidades-client'

export const dynamic = 'force-dynamic'

export default async function MensalidadesPage() {
  const supabase = createClient()
  const { data: { user } } = await (supabase as any).auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdmin() as any
  const { data: usuario } = await admin.from('usuarios').select('escola_id, role').eq('id', user.id).single()
  if (!usuario || !['diretora','super_admin'].includes(usuario.role)) redirect('/dashboard')

  const escolaId = usuario.escola_id
  const hoje = new Date()
  const mesRef = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}`

  // Configurações da escola (valor padrão e dia de vencimento)
  const { data: config } = await admin.from('configuracoes_escola')
    .select('valor_mensalidade, dia_vencimento')
    .eq('escola_id', escolaId)
    .maybeSingle()

  const valorPadrao    = config?.valor_mensalidade ?? 0
  const diaVencimento  = config?.dia_vencimento ?? 10

  // Alunos ativos com suas turmas
  const { data: alunosRaw } = await admin
    .from('alunos')
    .select('id, nome, alunos_turmas(turma:turmas(nome))')
    .eq('escola_id', escolaId)
    .eq('status', 'ativo')
    .order('nome')

  // Mensalidades do mês atual
  const { data: mensalidadesRaw } = await admin
    .from('mensalidades')
    .select('*')
    .eq('escola_id', escolaId)
    .eq('mes_referencia', mesRef)

  const mensMap: Record<string, any> = {}
  for (const m of (mensalidadesRaw ?? [])) {
    mensMap[m.aluno_id] = m
  }

  const alunos: AlunoComMensalidade[] = (alunosRaw ?? []).map((a: any) => ({
    id:   a.id,
    nome: a.nome,
    turma: a.alunos_turmas?.[0]?.turma?.nome ?? '',
    mensalidade: mensMap[a.id] ?? null,
  }))

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Mensalidades</h1>
        <p className="text-muted-foreground mt-1">Controle de pagamentos mensais dos alunos.</p>
      </div>
      <MensalidadesClient
        alunos={alunos}
        escolaId={escolaId}
        usuarioId={user.id}
        valorPadrao={valorPadrao}
        diaVencimento={diaVencimento}
      />
    </div>
  )
}
