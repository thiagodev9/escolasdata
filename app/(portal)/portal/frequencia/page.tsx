export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@/lib/supabase/admin'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getResponsavel } from '@/lib/portal/get-responsavel'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

export default async function PortalFrequenciaPage({
  searchParams,
}: {
  searchParams: { mes?: string }
}) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const admin = createAdminClient()
  const responsavel = await getResponsavel(user.email!)
  if (!responsavel) redirect('/portal/login?erro=nao-cadastrado')

  const hoje = new Date()
  const mesParam = searchParams.mes ?? hoje.toISOString().slice(0, 7)
  const [ano, mes] = mesParam.split('-').map(Number)

  const { data: links } = await (admin as any)
    .from('alunos_responsaveis')
    .select('alunos(id, nome, alunos_turmas(turmas(nome)))')
    .eq('responsavel_id', responsavel.id)

  const alunos: { id: string; nome: string; turma: string }[] = (links ?? []).map((l: any) => ({
    id: l.alunos.id,
    nome: l.alunos.nome,
    turma: l.alunos.alunos_turmas?.[0]?.turmas?.nome ?? '—',
  }))

  const alunoIds = alunos.map(a => a.id)
  const inicioMes = `${mesParam}-01`
  const fimMes = new Date(ano, mes, 0).toISOString().split('T')[0]

  const { data: presencas } = alunoIds.length > 0
    ? await (admin as any)
        .from('presencas')
        .select('aluno_id, data, status')
        .in('aluno_id', alunoIds)
        .gte('data', inicioMes)
        .lte('data', fimMes)
    : { data: [] }

  const diasNoMes = new Date(ano, mes, 0).getDate()
  const primeiroDia = new Date(ano, mes - 1, 1).getDay()

  const mesPrev = mes === 1 ? `${ano - 1}-12` : `${ano}-${String(mes - 1).padStart(2, '0')}`
  const mesNext = mes === 12 ? `${ano + 1}-01` : `${ano}-${String(mes + 1).padStart(2, '0')}`
  const isFuturo = new Date(ano, mes - 1) > new Date(hoje.getFullYear(), hoje.getMonth())
  const hojeStr = hoje.toISOString().split('T')[0]

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/portal" className="text-slate-400 hover:text-slate-600 p-1">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-black text-slate-800">Frequência</h1>
      </div>

      {/* Navegação de mês */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 px-4 py-3 mb-5">
        <Link href={`/portal/frequencia?mes=${mesPrev}`} className="text-slate-400 hover:text-blue-500 transition-colors p-1">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <span className="font-black text-slate-800">{MESES[mes - 1]} {ano}</span>
        {isFuturo ? (
          <div className="w-7" />
        ) : (
          <Link href={`/portal/frequencia?mes=${mesNext}`} className="text-slate-400 hover:text-blue-500 transition-colors p-1">
            <ChevronRight className="w-5 h-5" />
          </Link>
        )}
      </div>

      {alunos.map(aluno => {
        const presAluno = (presencas ?? []).filter((p: any) => p.aluno_id === aluno.id)
        const presMap = new Map(presAluno.map((p: any) => [p.data, p.status]))

        const totalRegistros = presAluno.length
        const totalPresente = presAluno.filter((p: any) => p.status === 'presente').length
        const totalJustificado = presAluno.filter((p: any) => p.status === 'justificado').length
        const pct = totalRegistros > 0 ? Math.round((totalPresente / totalRegistros) * 100) : null

        return (
          <div key={aluno.id} className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-black text-slate-800">{aluno.nome}</p>
                <p className="text-xs text-slate-500">{aluno.turma}</p>
              </div>
              {pct !== null && (
                <span className={`text-sm font-black px-3 py-1 rounded-full ${
                  pct >= 75 ? 'bg-emerald-100 text-emerald-700'
                  : pct >= 60 ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
                }`}>{pct}%</span>
              )}
            </div>

            {/* Cabeçalho dias da semana */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="text-[10px] font-bold text-slate-400">{d}</div>
              ))}
            </div>

            {/* Grid de dias */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: primeiroDia }).map((_, i) => (
                <div key={`vazio-${i}`} />
              ))}
              {Array.from({ length: diasNoMes }).map((_, i) => {
                const dia = i + 1
                const dateStr = `${mesParam}-${String(dia).padStart(2, '0')}`
                const status = presMap.get(dateStr)
                const isHoje = dateStr === hojeStr
                const dow = new Date(ano, mes - 1, dia).getDay()
                const isWeekend = dow === 0 || dow === 6

                return (
                  <div key={dia} className={`text-xs font-bold rounded-lg py-1 ${
                    isWeekend
                      ? 'text-slate-200'
                      : status === 'presente'
                      ? 'bg-emerald-100 text-emerald-700'
                      : status === 'ausente'
                      ? 'bg-red-100 text-red-600'
                      : status === 'justificado'
                      ? 'bg-blue-100 text-blue-600'
                      : isHoje
                      ? 'ring-1 ring-blue-300 text-blue-600'
                      : 'text-slate-400'
                  }`}>
                    {dia}
                  </div>
                )
              })}
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                {totalPresente} presente{totalPresente !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                {totalRegistros - totalPresente - totalJustificado} falta{(totalRegistros - totalPresente - totalJustificado) !== 1 ? 's' : ''}
              </span>
              {totalJustificado > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                  {totalJustificado} justificada{totalJustificado !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
