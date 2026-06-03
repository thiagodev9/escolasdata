'use client'

import { useState } from 'react'
import { FileText, Users, CalendarDays, DollarSign, ExternalLink, Download, Cake } from 'lucide-react'

interface Turma { id: string; nome: string }
interface Props { turmas: Turma[] }

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export function RelatoriosClient({ turmas }: Props) {
  const hoje  = new Date()
  const [mes,   setMes]   = useState(String(hoje.getMonth() + 1))
  const [ano,   setAno]   = useState(String(hoje.getFullYear()))
  const [turma, setTurma] = useState('')

  function abrir(tipo: string) {
    const p = new URLSearchParams()
    if (mes)   p.set('mes',   mes)
    if (ano)   p.set('ano',   ano)
    if (turma) p.set('turma', turma)
    window.open(`/print/relatorios/${tipo}?${p}`, '_blank')
  }

  const anos = [hoje.getFullYear() - 1, hoje.getFullYear(), hoje.getFullYear() + 1]

  return (
    <div className="max-w-3xl">
      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5 mb-8">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Filtros do Relatório</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Mês</label>
            <select value={mes} onChange={e => setMes(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-primary outline-none">
              {MESES.map((m, i) => <option key={m} value={String(i+1)}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Ano</label>
            <select value={ano} onChange={e => setAno(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-primary outline-none">
              {anos.map(a => <option key={a} value={String(a)}>{a}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Turma (opcional)</label>
            <select value={turma} onChange={e => setTurma(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-primary outline-none">
              <option value="">Todas as turmas</option>
              {turmas.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
            </select>
          </div>
        </div>
      </div>

      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Relatórios Disponíveis</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <ReportCard
          icon={Users} iconColor="bg-blue-100 text-blue-600"
          title="Lista de Alunos"
          desc="Relação completa por turma com data de nascimento, idade e espaço para assinatura."
          onOpen={() => abrir('alunos')}
        />
        <ReportCard
          icon={CalendarDays} iconColor="bg-emerald-100 text-emerald-600"
          title="Frequência Mensal"
          desc="Percentual de presença por aluno no mês selecionado, com barras visuais e situação."
          onOpen={() => abrir('frequencia')}
        />
        <ReportCard
          icon={DollarSign} iconColor="bg-amber-100 text-amber-700"
          title="Relatório Financeiro"
          desc="Pagos, vencidos e pendentes do mês com totais. Ideal para cobrança e prestação de contas."
          onOpen={() => abrir('financeiro')}
        />
        <ReportCard
          icon={Cake} iconColor="bg-pink-100 text-pink-600"
          title="Aniversariantes do Mês"
          desc="Lista de alunos e colaboradores que fazem aniversário no mês selecionado."
          onOpen={() => abrir('aniversariantes')}
        />
      </div>

      <div className="mt-6 bg-slate-50 rounded-xl px-4 py-3 flex items-start gap-3">
        <Download className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-500">
          Os relatórios abrem em nova aba com layout para impressão. Use <strong>Ctrl+P</strong> e selecione <strong>&ldquo;Salvar como PDF&rdquo;</strong>.
        </p>
      </div>
    </div>
  )
}

function ReportCard({ icon: Icon, iconColor, title, desc, onOpen, disabled }: {
  icon: React.ElementType; iconColor: string; title: string; desc: string
  onOpen: () => void; disabled?: boolean
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-soft p-5 flex flex-col gap-3 ${disabled ? 'opacity-40' : ''}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-black text-sm text-slate-800">{title}</p>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
      </div>
      <button onClick={onOpen} disabled={disabled}
        className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline disabled:pointer-events-none">
        <ExternalLink className="w-3.5 h-3.5" /> Abrir relatório
      </button>
    </div>
  )
}
