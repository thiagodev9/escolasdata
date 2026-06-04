export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@/lib/supabase/admin'
import { Calendar, CreditCard, ChevronRight, Footprints, BookOpen, NotebookPen, CalendarX } from 'lucide-react'
import { getResponsavel } from '@/lib/portal/get-responsavel'

export default async function PortalHomePage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  // getResponsavel usa React.cache() — sem round-trip extra se layout já chamou
  const responsavel = await getResponsavel(user.email!)

  if (!responsavel) redirect('/portal/login?erro=nao-cadastrado')

  const admin = createAdminClient()

  const { data: links } = await (admin as any)
    .from('alunos_responsaveis')
    .select('alunos(id, nome, dt_nascimento, alunos_turmas(turmas(nome)))')
    .eq('responsavel_id', responsavel.id)

  const alunos: { id: string; nome: string; turma: string }[] = (links ?? []).map((l: any) => ({
    id: l.alunos.id,
    nome: l.alunos.nome,
    turma: l.alunos.alunos_turmas?.[0]?.turmas?.nome ?? '—',
  }))

  const hoje = new Date().toISOString().split('T')[0]
  const alunoIds = alunos.map(a => a.id)

  const [presencasHoje, mensalidasPendentes, diariosRes, vistosRes] = await Promise.all([
    alunoIds.length > 0
      ? (admin as any).from('presencas').select('aluno_id, status').in('aluno_id', alunoIds).eq('data', hoje)
      : { data: [] },
    alunoIds.length > 0
      ? (admin as any).from('mensalidades').select('id').in('aluno_id', alunoIds).in('status', ['pendente', 'vencido'])
      : { data: [] },
    alunoIds.length > 0
      ? (admin as any)
          .from('registros_diarios')
          .select('id')
          .in('aluno_id', alunoIds)
          .gte('data', (() => { const d = new Date(); d.setDate(d.getDate() - 3); return d.toISOString().split('T')[0] })())
      : { data: [] },
    (admin as any)
      .from('diario_visualizacoes')
      .select('registro_id')
      .eq('responsavel_id', responsavel.id),
  ])

  const vistosSet = new Set((vistosRes.data ?? []).map((v: any) => v.registro_id))
  const qtdDiariosNaoVistos = (diariosRes.data ?? []).filter((r: any) => !vistosSet.has(r.id)).length

  const presMap = new Map((presencasHoje.data ?? []).map((p: any) => [p.aluno_id, p.status]))
  const qtdPendente = (mensalidasPendentes.data ?? []).length

  const primeiroNome = responsavel.nome.split(' ')[0]

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative w-12 h-12 shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Footprints className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500">Olá,</p>
          <h1 className="text-xl font-black text-slate-800">{primeiroNome} 👋</h1>
        </div>
      </div>

      {/* Alerta mensalidade pendente */}
      {qtdPendente > 0 && (
        <Link href="/portal/mensalidades" className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <div>
            <p className="font-bold text-amber-800 text-sm">Mensalidade em aberto</p>
            <p className="text-xs text-amber-600 mt-0.5">
              {qtdPendente} cobrança{qtdPendente > 1 ? 's' : ''} pendente{qtdPendente > 1 ? 's' : ''}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
        </Link>
      )}

      {/* Cards dos filhos */}
      <div className="space-y-3 mb-6">
        {alunos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-sm text-slate-400">
            Nenhum aluno vinculado à sua conta. Entre em contato com a escola.
          </div>
        ) : (
          alunos.map(aluno => {
            const status = presMap.get(aluno.id)
            return (
              <div key={aluno.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-slate-800">{aluno.nome}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{aluno.turma}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
                    status === 'presente'
                      ? 'bg-emerald-100 text-emerald-700'
                      : status === 'ausente'
                      ? 'bg-red-100 text-red-700'
                      : status === 'justificado'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {status === 'presente' ? 'Presente hoje'
                      : status === 'ausente' ? 'Ausente hoje'
                      : status === 'justificado' ? 'Falta justificada'
                      : 'Sem registro'}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Atalhos */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/portal/frequencia" className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-2 hover:border-blue-200 transition-colors">
          <Calendar className="w-6 h-6 text-blue-500" />
          <span className="font-bold text-slate-700 text-sm">Frequência</span>
          <span className="text-xs text-slate-400">Presenças do mês</span>
        </Link>
        <Link href="/portal/mensalidades" className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-2 hover:border-emerald-200 transition-colors">
          <CreditCard className="w-6 h-6 text-emerald-500" />
          <span className="font-bold text-slate-700 text-sm">Mensalidades</span>
          <span className="text-xs text-slate-400">Situação financeira</span>
        </Link>
        <Link href="/portal/diario" className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-2 hover:border-violet-200 transition-colors relative">
          <NotebookPen className="w-6 h-6 text-violet-500" />
          <span className="font-bold text-slate-700 text-sm">Diário</span>
          <span className="text-xs text-slate-400">Atividades do dia</span>
          {qtdDiariosNaoVistos > 0 && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {qtdDiariosNaoVistos > 9 ? '9+' : qtdDiariosNaoVistos}
            </span>
          )}
        </Link>
        <Link href="/portal/avisar-falta" className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-2 hover:border-amber-200 transition-colors">
          <CalendarX className="w-6 h-6 text-amber-500" />
          <span className="font-bold text-slate-700 text-sm">Avisar falta</span>
          <span className="text-xs text-slate-400">Avisar ausência</span>
        </Link>
        <Link href="/portal/avisos" className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-2 hover:border-orange-200 transition-colors col-span-2">
          <BookOpen className="w-6 h-6 text-orange-500" />
          <span className="font-bold text-slate-700 text-sm">Avisos da escola</span>
          <span className="text-xs text-slate-400">Comunicados e novidades</span>
        </Link>
      </div>
    </div>
  )
}
