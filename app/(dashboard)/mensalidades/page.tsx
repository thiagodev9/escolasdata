import { createClient as createAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { MensalidadesClient, type AlunoComMensalidade } from '@/components/mensalidades/mensalidades-client'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'

export const dynamic = 'force-dynamic'

export default async function MensalidadesPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario || !['diretora','super_admin'].includes(usuario.role)) redirect('/dashboard')

  const admin = createAdmin() as any
  const escolaId = usuario.escola_id
  const hoje = new Date()
  const mesRef = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}`

  // 3 queries em paralelo (antes eram 3 waterfalls sequenciais)
  const [configRes, alunosRawRes, mensalidadesRawRes] = await Promise.all([
    admin.from('configuracoes_escola')
      .select('valor_mensalidade, dia_vencimento')
      .eq('escola_id', escolaId)
      .maybeSingle(),
    admin.from('alunos')
      .select('id, nome, alunos_turmas(turma:turmas(nome))')
      .eq('escola_id', escolaId)
      .eq('status', 'ativo')
      .order('nome'),
    admin.from('mensalidades')
      .select('*')
      .eq('escola_id', escolaId)
      .eq('mes_referencia', mesRef),
  ])

  const config         = configRes.data
  const alunosRaw      = alunosRawRes.data
  const mensalidadesRaw = mensalidadesRawRes.data

  const valorPadrao   = config?.valor_mensalidade ?? 0
  const diaVencimento = config?.dia_vencimento ?? 10

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
        usuarioId={usuario.id}
        valorPadrao={valorPadrao}
        diaVencimento={diaVencimento}
      />
    </div>
  )
}
