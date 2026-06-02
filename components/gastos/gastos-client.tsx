'use client'

import { useState, useTransition, useMemo } from 'react'
import {
  Plus, Search, X, Loader2, Pencil, Trash2, AlertTriangle,
  TrendingDown, TrendingUp, Wallet, Tag, Calendar, Building2,
  FileText, CreditCard, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export interface Gasto {
  id: string; escola_id: string; descricao: string; categoria: string
  valor: number; dt_pagamento: string; forma_pagamento: string | null
  fornecedor: string | null; observacoes: string | null; criado_em: string
}

interface Props { gastos: Gasto[]; escolaId: string; usuarioId: string }

const CATEGORIAS = [
  { value: 'folha_pagamento',   label: 'Folha de Pagamento',   color: 'bg-blue-100 text-blue-700',     bar: '#3B82F6' },
  { value: 'alimentacao',       label: 'Alimentação/Merenda',  color: 'bg-orange-100 text-orange-700', bar: '#F97316' },
  { value: 'material_pedagogico',label:'Material Pedagógico',  color: 'bg-violet-100 text-violet-700', bar: '#7C3AED' },
  { value: 'aluguel',           label: 'Aluguel',              color: 'bg-slate-200 text-slate-700',   bar: '#64748B' },
  { value: 'energia_agua',      label: 'Energia/Água',         color: 'bg-yellow-100 text-yellow-700', bar: '#EAB308' },
  { value: 'internet_telefone', label: 'Internet/Telefone',    color: 'bg-sky-100 text-sky-700',       bar: '#0EA5E9' },
  { value: 'material_limpeza',  label: 'Material de Limpeza',  color: 'bg-teal-100 text-teal-700',     bar: '#14B8A6' },
  { value: 'manutencao',        label: 'Manutenção',           color: 'bg-amber-100 text-amber-700',   bar: '#F59E0B' },
  { value: 'equipamentos',      label: 'Equipamentos',         color: 'bg-indigo-100 text-indigo-700', bar: '#6366F1' },
  { value: 'marketing',         label: 'Marketing',            color: 'bg-pink-100 text-pink-700',     bar: '#EC4899' },
  { value: 'impostos',          label: 'Impostos/Taxas',       color: 'bg-red-100 text-red-700',       bar: '#EF4444' },
  { value: 'transporte',        label: 'Transporte',           color: 'bg-emerald-100 text-emerald-700',bar:'#10B981' },
  { value: 'outros',            label: 'Outros',               color: 'bg-slate-100 text-slate-500',   bar: '#94A3B8' },
]

const FORMAS = [
  { value: 'pix',            label: 'PIX' },
  { value: 'transferencia',  label: 'Transferência' },
  { value: 'boleto',         label: 'Boleto' },
  { value: 'dinheiro',       label: 'Dinheiro' },
  { value: 'cartao_debito',  label: 'Cartão Débito' },
  { value: 'cartao_credito', label: 'Cartão Crédito' },
]

function catInfo(v: string) { return CATEGORIAS.find(c => c.value === v) ?? { label: v, color: 'bg-slate-100 text-slate-500', bar: '#94A3B8' } }
function formaLabel(v: string | null) { return FORMAS.find(f => f.value === v)?.label ?? v ?? '—' }
function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function parseDate(d: string) { const [y,m,day] = d.split('-'); return `${day}/${m}/${y}` }

const FORM_VAZIO = {
  descricao: '', categoria: 'outros', valor: '',
  dt_pagamento: new Date().toISOString().slice(0,10),
  forma_pagamento: 'pix', fornecedor: '', observacoes: '',
}

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export function GastosClient({ gastos, escolaId, usuarioId }: Props) {
  const now = new Date()
  const [mesAtual, setMesAtual]       = useState(now.getMonth())
  const [anoAtual, setAnoAtual]       = useState(now.getFullYear())
  const [busca, setBusca]             = useState('')
  const [filtCat, setFiltCat]         = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [editGasto, setEditGasto]     = useState<Gasto | null>(null)
  const [deleteGasto, setDeleteGasto] = useState<Gasto | null>(null)
  const [form, setForm]               = useState(FORM_VAZIO)
  const [erros, setErros]             = useState<Record<string, string>>({})
  const [erroGeral, setErroGeral]     = useState('')
  const [salvando, setSalvando]       = useState(false)
  const [deletando, setDeletando]     = useState(false)
  const [, startTransition]           = useTransition()
  const router   = useRouter()
  const supabase = createClient()

  // Filtra pelo mês selecionado
  const gastosMes = useMemo(() => gastos.filter(g => {
    const [y, m] = g.dt_pagamento.split('-').map(Number)
    return y === anoAtual && m - 1 === mesAtual
  }), [gastos, mesAtual, anoAtual])

  // Mês anterior para comparação
  const mesAntIdx = mesAtual === 0 ? 11 : mesAtual - 1
  const anoAnt    = mesAtual === 0 ? anoAtual - 1 : anoAtual
  const gastosMesAnt = useMemo(() => gastos.filter(g => {
    const [y, m] = g.dt_pagamento.split('-').map(Number)
    return y === anoAnt && m - 1 === mesAntIdx
  }), [gastos, mesAntIdx, anoAnt])

  const totalMes    = gastosMes.reduce((s,g) => s + g.valor, 0)
  const totalAnt    = gastosMesAnt.reduce((s,g) => s + g.valor, 0)
  const varPct      = totalAnt > 0 ? ((totalMes - totalAnt) / totalAnt) * 100 : null

  // Breakdown por categoria no mês
  const porCategoria = useMemo(() => {
    const map: Record<string, number> = {}
    gastosMes.forEach(g => { map[g.categoria] = (map[g.categoria] ?? 0) + g.valor })
    return Object.entries(map)
      .sort((a,b) => b[1] - a[1])
      .map(([cat, val]) => ({ cat, val, pct: totalMes > 0 ? (val / totalMes) * 100 : 0 }))
  }, [gastosMes, totalMes])

  // Lista filtrada
  const listagem = useMemo(() => gastosMes.filter(g => {
    const matchBusca = g.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      (g.fornecedor ?? '').toLowerCase().includes(busca.toLowerCase())
    const matchCat = !filtCat || g.categoria === filtCat
    return matchBusca && matchCat
  }).sort((a,b) => b.dt_pagamento.localeCompare(a.dt_pagamento)), [gastosMes, busca, filtCat])

  function navMes(dir: -1 | 1) {
    setMesAtual(m => {
      const nm = m + dir
      if (nm < 0)  { setAnoAtual(y => y - 1); return 11 }
      if (nm > 11) { setAnoAtual(y => y + 1); return 0  }
      return nm
    })
  }

  function campo(key: keyof typeof FORM_VAZIO, val: string) {
    setForm(f => ({ ...f, [key]: val }))
    setErros(e => { const n = { ...e }; delete n[key]; return n })
  }

  function validar() {
    const novos: Record<string, string> = {}
    if (!form.descricao.trim()) novos.descricao = 'Descrição é obrigatória'
    if (!form.valor || isNaN(parseFloat(form.valor.replace(',','.')))) novos.valor = 'Valor inválido'
    if (!form.dt_pagamento) novos.dt_pagamento = 'Data é obrigatória'
    setErros(novos)
    return Object.keys(novos).length === 0
  }

  function abrirNovo() {
    setEditGasto(null)
    setForm({ ...FORM_VAZIO, dt_pagamento: `${anoAtual}-${String(mesAtual+1).padStart(2,'0')}-01` })
    setErros({}); setErroGeral(''); setShowModal(true)
  }

  function abrirEdicao(g: Gasto) {
    setEditGasto(g)
    setForm({
      descricao:       g.descricao,
      categoria:       g.categoria,
      valor:           String(g.valor),
      dt_pagamento:    g.dt_pagamento,
      forma_pagamento: g.forma_pagamento ?? 'pix',
      fornecedor:      g.fornecedor ?? '',
      observacoes:     g.observacoes ?? '',
    })
    setErros({}); setErroGeral(''); setShowModal(true)
  }

  function fecharModal() {
    setShowModal(false); setEditGasto(null)
    setForm(FORM_VAZIO); setErros({}); setErroGeral('')
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return
    setSalvando(true); setErroGeral('')

    const payload = {
      descricao:       form.descricao.trim(),
      categoria:       form.categoria,
      valor:           parseFloat(form.valor.replace(',','.')),
      dt_pagamento:    form.dt_pagamento,
      forma_pagamento: form.forma_pagamento || null,
      fornecedor:      form.fornecedor.trim() || null,
      observacoes:     form.observacoes.trim() || null,
    }

    try {
      const sb = supabase as any
      if (editGasto) {
        const { error } = await sb.from('gastos').update(payload).eq('id', editGasto.id)
        if (error) throw error
      } else {
        const { error } = await sb.from('gastos').insert({ ...payload, escola_id: escolaId, criado_por: usuarioId })
        if (error) throw error
      }
      fecharModal()
      startTransition(() => router.refresh())
    } catch (err: any) {
      setErroGeral(err.message ?? 'Erro ao salvar.')
    } finally {
      setSalvando(false)
    }
  }

  async function confirmarDelete() {
    if (!deleteGasto) return
    setDeletando(true)
    await (supabase as any).from('gastos').delete().eq('id', deleteGasto.id)
    setDeleteGasto(null); setDeletando(false)
    startTransition(() => router.refresh())
  }

  return (
    <>
      {/* ── Título + nav mês ── */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Controle de Gastos</h1>
          <p className="text-muted-foreground mt-1">Acompanhe todas as despesas operacionais da escola.</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl shadow-soft border border-slate-100 px-1 py-1">
          <button onClick={() => navMes(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-black text-slate-700 min-w-[130px] text-center">
            {MESES[mesAtual]} {anoAtual}
          </span>
          <button onClick={() => navMes(1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            disabled={mesAtual === now.getMonth() && anoAtual === now.getFullYear()}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-soft p-5 col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Total no Mês</p>
          <p className="text-2xl font-black text-foreground">{fmt(totalMes)}</p>
          {varPct !== null && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${varPct > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
              {varPct > 0
                ? <TrendingUp className="w-3.5 h-3.5" />
                : <TrendingDown className="w-3.5 h-3.5" />
              }
              {Math.abs(varPct).toFixed(1)}% vs {MESES[mesAntIdx]}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-soft p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Lançamentos</p>
          <p className="text-2xl font-black text-foreground">{gastosMes.length}</p>
          <p className="text-xs text-muted-foreground mt-1">despesas no mês</p>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Maior Categoria</p>
          {porCategoria[0]
            ? <>
                <p className="text-lg font-black text-foreground truncate">{catInfo(porCategoria[0].cat).label}</p>
                <p className="text-xs font-bold text-muted-foreground mt-1">{fmt(porCategoria[0].val)}</p>
              </>
            : <p className="text-sm text-muted-foreground mt-2">—</p>
          }
        </div>

        <div className="bg-white rounded-xl shadow-soft p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Mês Anterior</p>
          <p className="text-2xl font-black text-slate-400">{fmt(totalAnt)}</p>
          <p className="text-xs text-muted-foreground mt-1">{MESES[mesAntIdx]}</p>
        </div>
      </div>

      {/* ── Breakdown por categoria ── */}
      {porCategoria.length > 0 && (
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
          <h2 className="text-base font-black text-slate-800 mb-4">Distribuição por Categoria</h2>
          <div className="space-y-3">
            {porCategoria.map(({ cat, val, pct }) => {
              const info = catInfo(cat)
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 w-40 truncate ${info.color}`}>
                    {info.label}
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: info.bar }}
                    />
                  </div>
                  <span className="text-sm font-bold text-foreground w-28 text-right shrink-0">{fmt(val)}</span>
                  <span className="text-xs text-muted-foreground w-10 text-right shrink-0">{pct.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar despesa ou fornecedor..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10 h-10 min-h-0" />
        </div>
        <select value={filtCat} onChange={e => setFiltCat(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <Button onClick={abrirNovo} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Novo Gasto
        </Button>
      </div>

      {/* ── Tabela ── */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-3 border-b border-border/50">
          {['Descrição','Categoria','Valor','Data','Forma Pgto','Ações'].map(h => (
            <p key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</p>
          ))}
        </div>

        <div className="divide-y divide-border/30">
          {listagem.length === 0
            ? (
              <div className="py-20 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-muted-foreground text-sm">
                  {busca || filtCat ? 'Nenhuma despesa encontrada.' : `Nenhum gasto registrado em ${MESES[mesAtual]}.`}
                </p>
                {!busca && !filtCat && (
                  <Button size="sm" variant="outline" onClick={abrirNovo} className="gap-1.5 mt-1">
                    <Plus className="w-3.5 h-3.5" /> Registrar primeiro gasto
                  </Button>
                )}
              </div>
            )
            : listagem.map(g => {
                const info = catInfo(g.categoria)
                return (
                  <div key={g.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1.2fr_1fr_1fr_1fr_80px] gap-4 items-center px-6 py-4 hover:bg-muted/30 transition-colors">
                    {/* Descrição */}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{g.descricao}</p>
                      {g.fornecedor && <p className="text-xs text-muted-foreground truncate">{g.fornecedor}</p>}
                    </div>

                    {/* Categoria */}
                    <span className={`hidden md:inline-flex text-xs font-bold px-2.5 py-1 rounded-full w-fit ${info.color}`}>
                      {info.label}
                    </span>

                    {/* Valor */}
                    <p className="hidden md:block text-sm font-black text-foreground">{fmt(g.valor)}</p>

                    {/* Data */}
                    <p className="hidden md:block text-sm text-foreground">{parseDate(g.dt_pagamento)}</p>

                    {/* Forma */}
                    <p className="hidden md:block text-sm text-muted-foreground">{formaLabel(g.forma_pagamento)}</p>

                    {/* Ações */}
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => abrirEdicao(g)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteGasto(g)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
          }
        </div>

        {listagem.length > 0 && (
          <div className="px-6 py-3 border-t border-border/50 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{listagem.length} despesa{listagem.length !== 1 ? 's' : ''} — Total filtrado: <strong>{fmt(listagem.reduce((s,g)=>s+g.valor,0))}</strong></p>
          </div>
        )}
      </div>

      {/* ══ Modal Novo / Editar ══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={fecharModal} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-lg z-10 flex flex-col max-h-[92vh]">

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-black text-slate-800">{editGasto ? 'Editar Gasto' : 'Registrar Gasto'}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Campos com * são obrigatórios</p>
              </div>
              <button onClick={fecharModal} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={salvar} className="overflow-y-auto">
              <div className="px-6 py-5 space-y-4">

                {/* Descrição */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Descrição *</Label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Ex: Compra de material pedagógico" value={form.descricao}
                      onChange={e => campo('descricao', e.target.value)}
                      className={`pl-10 ${erros.descricao ? 'border-red-400' : ''}`} />
                  </div>
                  {erros.descricao && <p className="text-xs text-red-500">{erros.descricao}</p>}
                </div>

                {/* Valor + Data */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700">Valor (R$) *</Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">R$</span>
                      <Input type="number" step="0.01" min="0" placeholder="0,00" value={form.valor}
                        onChange={e => campo('valor', e.target.value)}
                        className={`pl-10 ${erros.valor ? 'border-red-400' : ''}`} />
                    </div>
                    {erros.valor && <p className="text-xs text-red-500">{erros.valor}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700">Data do Pagamento *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input type="date" value={form.dt_pagamento}
                        onChange={e => campo('dt_pagamento', e.target.value)}
                        className={`pl-10 ${erros.dt_pagamento ? 'border-red-400' : ''}`} />
                    </div>
                    {erros.dt_pagamento && <p className="text-xs text-red-500">{erros.dt_pagamento}</p>}
                  </div>
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Categoria *</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CATEGORIAS.map(c => (
                      <button key={c.value} type="button" onClick={() => campo('categoria', c.value)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all
                          ${form.categoria === c.value
                            ? `${c.color} border-current/30 ring-2 ring-current/20`
                            : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fornecedor + Forma pgto */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700">Fornecedor</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input placeholder="Ex: Papelaria ABC" value={form.fornecedor}
                        onChange={e => campo('fornecedor', e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700">Forma de Pagamento</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select value={form.forma_pagamento} onChange={e => campo('forma_pagamento', e.target.value)}
                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-base outline-none focus:ring-2 focus:ring-primary/20">
                        {FORMAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Observações</Label>
                  <textarea value={form.observacoes} onChange={e => campo('observacoes', e.target.value)}
                    rows={3} placeholder="Detalhes adicionais, número de nota fiscal..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none resize-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>

                {erroGeral && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{erroGeral}</div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
                <Button type="button" variant="outline" className="flex-1" onClick={fecharModal}>Cancelar</Button>
                <Button type="submit" className="flex-1" disabled={salvando}>
                  {salvando ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : editGasto ? 'Salvar Alterações' : 'Registrar Gasto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Confirmar Exclusão ══ */}
      {deleteGasto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deletando && setDeleteGasto(null)} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-sm z-10 p-6 animate-fade-in">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Excluir Gasto</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Remover <span className="font-bold text-slate-700">{deleteGasto.descricao}</span> ({fmt(deleteGasto.valor)})?
                </p>
              </div>
              <div className="flex gap-3 w-full mt-1">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteGasto(null)} disabled={deletando}>Cancelar</Button>
                <Button variant="destructive" className="flex-1" onClick={confirmarDelete} disabled={deletando}>
                  {deletando ? <><Loader2 className="w-4 h-4 animate-spin" /> Excluindo...</> : 'Excluir'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
