'use client'

import { useState, useMemo, useTransition } from 'react'
import {
  CheckCircle2, Clock, AlertCircle, Ban, ChevronLeft, ChevronRight,
  Search, DollarSign, Users, TrendingUp, TrendingDown, X, Loader2,
  Pencil, Plus, Printer, Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface Mensalidade {
  id: string
  aluno_id: string
  mes_referencia: string
  valor: number
  status: 'pendente' | 'pago' | 'vencido' | 'isento'
  dt_vencimento: string | null
  dt_pagamento: string | null
  forma_pagamento: string | null
  observacoes: string | null
}

export interface AlunoComMensalidade {
  id: string
  nome: string
  turma: string
  mensalidade: Mensalidade | null
}

interface Props {
  alunos: AlunoComMensalidade[]
  escolaId: string
  usuarioId: string
  valorPadrao: number
  diaVencimento: number
}

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const FORMAS = [
  { value: 'pix', label: 'PIX' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'cartao', label: 'Cartão' },
]

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

const STATUS_CONFIG = {
  pago:     { label: 'Pago',     color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  pendente: { label: 'Pendente', color: 'bg-amber-100 text-amber-700',    icon: Clock },
  vencido:  { label: 'Vencido',  color: 'bg-red-100 text-red-700',        icon: AlertCircle },
  isento:   { label: 'Isento',   color: 'bg-slate-100 text-slate-500',    icon: Ban },
}

export function MensalidadesClient({ alunos: alunosIniciais, escolaId, usuarioId, valorPadrao, diaVencimento }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [, startTransition] = useTransition()

  const hoje = new Date()
  const [ano, setAno]   = useState(hoje.getFullYear())
  const [mes, setMes]   = useState(hoje.getMonth()) // 0-indexed
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')

  const [alunos, setAlunos] = useState(alunosIniciais)
  const [modal, setModal]   = useState<AlunoComMensalidade | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const mesRef = `${ano}-${String(mes + 1).padStart(2, '0')}`

  // Form de pagamento
  const [form, setForm] = useState({
    valor: String(valorPadrao || ''),
    status: 'pago' as string,
    dt_vencimento: `${ano}-${String(mes + 1).padStart(2,'0')}-${String(diaVencimento).padStart(2,'0')}`,
    dt_pagamento: new Date().toISOString().slice(0, 10),
    forma_pagamento: 'pix',
    observacoes: '',
  })

  function abrirModal(aluno: AlunoComMensalidade) {
    const m = aluno.mensalidade
    setErro('')
    setForm({
      valor:           String(m?.valor ?? valorPadrao ?? ''),
      status:          m?.status ?? 'pago',
      dt_vencimento:   m?.dt_vencimento ?? `${ano}-${String(mes+1).padStart(2,'0')}-${String(diaVencimento).padStart(2,'0')}`,
      dt_pagamento:    m?.dt_pagamento ?? new Date().toISOString().slice(0,10),
      forma_pagamento: m?.forma_pagamento ?? 'pix',
      observacoes:     m?.observacoes ?? '',
    })
    setModal(aluno)
  }

  async function salvar() {
    if (!modal) return
    if (!form.valor || isNaN(Number(form.valor))) { setErro('Informe um valor válido.'); return }
    setSalvando(true); setErro('')
    try {
      const payload = {
        escola_id:       escolaId,
        aluno_id:        modal.id,
        mes_referencia:  mesRef,
        valor:           Number(form.valor),
        status:          form.status,
        dt_vencimento:   form.dt_vencimento || null,
        dt_pagamento:    form.status === 'pago' ? (form.dt_pagamento || null) : null,
        forma_pagamento: form.status === 'pago' ? form.forma_pagamento : null,
        observacoes:     form.observacoes || null,
        criado_por:      usuarioId,
      }

      if (modal.mensalidade) {
        await (supabase as any).from('mensalidades').update(payload).eq('id', modal.mensalidade.id)
      } else {
        await (supabase as any).from('mensalidades').insert(payload)
      }

      setModal(null)
      startTransition(() => router.refresh())
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setSalvando(false) }
  }

  // Gerar cobranças em lote para todos os alunos sem mensalidade neste mês
  async function gerarLote() {
    if (!confirm(`Gerar mensalidades pendentes para todos os alunos sem cobrança em ${MESES[mes]}/${ano}?`)) return
    setSalvando(true)
    const semCobranca = filtrado.filter(a => !a.mensalidade)
    const dtVenc = `${ano}-${String(mes+1).padStart(2,'0')}-${String(diaVencimento).padStart(2,'0')}`
    const rows = semCobranca.map(a => ({
      escola_id: escolaId, aluno_id: a.id, mes_referencia: mesRef,
      valor: valorPadrao, status: 'pendente', dt_vencimento: dtVenc, criado_por: usuarioId,
    }))
    if (rows.length > 0) {
      await (supabase as any).from('mensalidades').insert(rows)
    }
    startTransition(() => router.refresh())
    setSalvando(false)
  }

  function navMes(delta: number) {
    let nm = mes + delta, na = ano
    if (nm < 0)  { nm = 11; na-- }
    if (nm > 11) { nm = 0;  na++ }
    setMes(nm); setAno(na)
  }

  const filtrado = useMemo(() => {
    let list = alunos
    if (busca.trim()) {
      const q = busca.toLowerCase()
      list = list.filter(a => a.nome.toLowerCase().includes(q) || a.turma.toLowerCase().includes(q))
    }
    if (filtroStatus !== 'todos') {
      list = filtroStatus === 'sem_cobranca'
        ? list.filter(a => !a.mensalidade)
        : list.filter(a => a.mensalidade?.status === filtroStatus)
    }
    return list
  }, [alunos, busca, filtroStatus])

  // KPIs
  const total    = alunos.length
  const pagos    = alunos.filter(a => a.mensalidade?.status === 'pago').length
  const vencidos = alunos.filter(a => a.mensalidade?.status === 'vencido').length
  const semCob   = alunos.filter(a => !a.mensalidade).length
  const receita  = alunos.filter(a => a.mensalidade?.status === 'pago')
                         .reduce((s, a) => s + (a.mensalidade?.valor ?? 0), 0)
  const prevista = alunos.filter(a => a.mensalidade)
                         .reduce((s, a) => s + (a.mensalidade?.valor ?? 0), 0)

  return (
    <div>
      {/* Header + nav de mês */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navMes(-1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-black text-slate-800 min-w-[180px] text-center">
            {MESES[mes]} {ano}
          </h2>
          <button onClick={() => navMes(1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={gerarLote} disabled={salvando} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Gerar em lote
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
            <Printer className="w-3.5 h-3.5" /> Imprimir
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total Alunos',    value: total,         sub: 'ativos',           color: 'text-slate-700',    bg: 'bg-slate-50',    icon: Users },
          { label: 'Pagos',           value: pagos,         sub: `${total ? Math.round(pagos/total*100) : 0}%`,   color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { label: 'Vencidos',        value: vencidos,      sub: 'em atraso',        color: 'text-red-700',      bg: 'bg-red-50',      icon: AlertCircle },
          { label: 'Sem cobrança',    value: semCob,        sub: 'não geradas',      color: 'text-amber-700',    bg: 'bg-amber-50',    icon: Clock },
          { label: 'Receita Recebida',value: fmt(receita),  sub: `prev. ${fmt(prevista)}`, color: 'text-blue-700', bg: 'bg-blue-50', icon: DollarSign },
        ].map(k => (
          <div key={k.label} className={cn('rounded-xl p-4', k.bg)}>
            <k.icon className={cn('w-4 h-4 mb-1', k.color)} />
            <div className={cn('text-xl font-black', k.color)}>{k.value}</div>
            <div className="text-xs text-slate-500 font-medium">{k.label}</div>
            <div className="text-xs text-slate-400">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar aluno ou turma..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {[
            { value: 'todos', label: 'Todos' },
            { value: 'pago', label: 'Pagos' },
            { value: 'pendente', label: 'Pendentes' },
            { value: 'vencido', label: 'Vencidos' },
            { value: 'sem_cobranca', label: 'Sem cobrança' },
          ].map(f => (
            <button key={f.value} onClick={() => setFiltroStatus(f.value)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                filtroStatus === f.value ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700')}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-wider">
          <span>Aluno</span><span>Turma</span><span>Vencimento</span><span>Valor</span><span className="text-right">Status</span>
        </div>

        {filtrado.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Nenhum aluno encontrado</p>
          </div>
        ) : filtrado.map((aluno, i) => {
          const m = aluno.mensalidade
          const cfg = m ? STATUS_CONFIG[m.status] : null
          const Icon = cfg?.icon ?? Clock

          return (
            <div key={aluno.id}
              className={cn('grid grid-cols-[1fr_120px] md:grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 px-5 py-3.5 items-center border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors', i % 2 === 0 ? '' : 'bg-slate-50/30')}
              onClick={() => abrirModal(aluno)}
            >
              <div>
                <p className="font-bold text-slate-800 text-sm">{aluno.nome}</p>
                <p className="text-xs text-slate-400 md:hidden">{aluno.turma}</p>
              </div>
              <p className="hidden md:block text-sm text-slate-600">{aluno.turma || '—'}</p>
              <p className="hidden md:block text-sm text-slate-600">
                {m?.dt_vencimento ? m.dt_vencimento.split('-').reverse().join('/') : '—'}
              </p>
              <p className="hidden md:block text-sm font-semibold text-slate-700">
                {m ? fmt(m.valor) : '—'}
              </p>
              <div className="flex justify-end">
                {cfg ? (
                  <span className={cn('inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full', cfg.color)}>
                    <Icon className="w-3 h-3" />{cfg.label}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-400">
                    <Plus className="w-3 h-3" /> Lançar
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de lançamento/edição */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  {modal.mensalidade ? 'Editar mensalidade' : 'Lançar mensalidade'}
                </h3>
                <p className="text-sm text-slate-500">{modal.nome} — {MESES[mes]}/{ano}</p>
              </div>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Valor (R$) *</Label>
                  <Input type="number" step="0.01" value={form.valor}
                    onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                    placeholder="0,00" className="mt-1" />
                </div>
                <div>
                  <Label>Status *</Label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="mt-1 w-full h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white">
                    <option value="pago">Pago</option>
                    <option value="pendente">Pendente</option>
                    <option value="vencido">Vencido</option>
                    <option value="isento">Isento</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Vencimento</Label>
                  <Input type="date" value={form.dt_vencimento}
                    onChange={e => setForm(f => ({ ...f, dt_vencimento: e.target.value }))}
                    className="mt-1" />
                </div>
                {form.status === 'pago' && (
                  <div>
                    <Label>Data do pagamento</Label>
                    <Input type="date" value={form.dt_pagamento}
                      onChange={e => setForm(f => ({ ...f, dt_pagamento: e.target.value }))}
                      className="mt-1" />
                  </div>
                )}
              </div>

              {form.status === 'pago' && (
                <div>
                  <Label>Forma de pagamento</Label>
                  <select value={form.forma_pagamento} onChange={e => setForm(f => ({ ...f, forma_pagamento: e.target.value }))}
                    className="mt-1 w-full h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white">
                    {FORMAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              )}

              <div>
                <Label>Observações</Label>
                <textarea value={form.observacoes}
                  onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none h-20"
                  placeholder="Desconto, bolsa, observação..." />
              </div>

              {erro && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{erro}</p>}
            </div>

            <div className="flex gap-2 p-5 pt-0">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Cancelar</Button>
              <Button className="flex-1 gap-2" onClick={salvar} disabled={salvando}>
                {salvando ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
