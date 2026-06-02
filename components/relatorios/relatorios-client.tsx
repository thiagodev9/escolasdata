'use client'

import { useState } from 'react'
import { FileText, Users, CalendarDays, DollarSign, ExternalLink, Download } from 'lucide-react'

interface Turma { id: string; nome: string }

interface Props {
  turmas: Turma[]
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function RelatoriosClient({ turmas }: Props) {
  const hoje   = new Date()
  const [mes,  setMes]  = useState(String(hoje.getMonth() + 1))
  const [ano,  setAno]  = useState(String(hoje.getFullYear()))
  const [turma, setTurma] = useState('')

  function abrirRelatorio(tipo: 'alunos' | 'frequencia' | 'financeiro') {
    const params = new URLSearchParams()
    if (mes)   params.set('mes',  mes)
    if (ano)   params.set('ano',  ano)
    if (turma) params.set('turma', turma)
    window.open(`/print/relatorios/${tipo}?${params}`, '_blank')
  }

  const anos = [hoje.getFullYear() - 1, hoje.getFullYear(), hoje.getFullYear() + 1]

  return (
    <div className="max-w-3xl">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-soft p-5 mb-8">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">Filtros do Relatório</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Mês</label>
            <select value={mes} onChange={e => setMes(e.target.value)}
              className="flex h-10 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none">
              {MESES.map((m, i) => (
                <option key={m} value={String(i + 1)}>{m}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Ano</label>
            <select value={ano} onChange={e => setAno(e.target.value)}
              className="flex h-10 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none">
              {anos.map(a => <option key={a} value={String(a)}>{a}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Turma (opcional)</label>
            <select value={turma} onChange={e => setTurma(e.target.value)}
              className="flex h-10 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none">
              <option value="">Todas as turmas</option>
              {turmas.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Relatórios */}
      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Relatórios Disponíveis</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <ReportCard
          icon={Users}
          iconColor="bg-blue-100 text-blue-600"
          title="Lista de Alunos"
          desc="Relação completa de alunos por turma, com data de nascimento e espaço para assinatura."
          onOpen={() => abrirRelatorio('alunos')}
        />
        <ReportCard
          icon={CalendarDays}
          iconColor="bg-green-100 text-green-600"
          title="Frequência Mensal"
          desc="Percentual de presença por aluno no mês selecionado, com contagem de presenças e faltas."
          onOpen={() => abrirRelatorio('frequencia')}
        />
        <ReportCard
          icon={DollarSign}
          iconColor="bg-amber-100 text-amber-700"
          title="Relatório Financeiro"
          desc="Situação financeira dos alunos: ativos, inadimplentes e inativos, com lista de pendências."
          onOpen={() => abrirRelatorio('financeiro')}
        />
        <ReportCard
          icon={FileText}
          iconColor="bg-purple-100 text-purple-600"
          title="Em breve"
          desc="Relatório pedagógico com evolução dos registros do diário por aluno. (Sprint 3)"
          disabled
          onOpen={() => {}}
        />
      </div>

      <div className="mt-8 bg-muted rounded-lg px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Download className="w-4 h-4 shrink-0" />
          <span>Os relatórios abrem em nova aba com layout otimizado para impressão. Use <strong>Ctrl+P</strong> (ou <strong>⌘P</strong>) e selecione <strong>&ldquo;Salvar como PDF&rdquo;</strong> para baixar.</span>
        </div>
      </div>
    </div>
  )
}

function ReportCard({
  icon: Icon, iconColor, title, desc, onOpen, disabled,
}: {
  icon: React.ElementType
  iconColor: string
  title: string
  desc: string
  onOpen: () => void
  disabled?: boolean
}) {
  return (
    <div className={`bg-white rounded-lg border border-border shadow-soft p-5 flex flex-col gap-3 ${disabled ? 'opacity-50' : ''}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
      </div>
      <button
        onClick={onOpen}
        disabled={disabled}
        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:pointer-events-none"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Abrir relatório
      </button>
    </div>
  )
}
