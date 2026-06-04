'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, AlertCircle, XCircle, DollarSign, Users, TrendingUp, Loader2, Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AssinaturaRow {
  escola_id: string
  escola_nome: string
  escola_ativa: boolean
  status: string
  asaas_customer_id: string | null
  trial_ate: string | null
  qtd_alunos: number
  faixa: string
  valor_mensal: number
}

interface Props {
  dados: AssinaturaRow[]
  receitaPotencial: number
}

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: any }> = {
  ativa:           { label: 'Ativa',          color: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 },
  trial:           { label: 'Trial',           color: 'bg-blue-100 text-blue-700',      Icon: Clock        },
  suspensa:        { label: 'Suspensa',        color: 'bg-amber-100 text-amber-700',    Icon: AlertCircle  },
  cancelada:       { label: 'Cancelada',       color: 'bg-red-100 text-red-700',        Icon: XCircle      },
  sem_assinatura:  { label: 'Sem assinatura',  color: 'bg-slate-100 text-slate-500',    Icon: XCircle      },
}

export function AssinaturasClient({ dados, receitaPotencial }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [, startTransition] = useTransition()
  const [editando, setEditando] = useState<AssinaturaRow | null>(null)
  const [form, setForm] = useState({ status: 'trial', asaas_customer_id: '', trial_ate: '' })
  const [salvando, setSalvando] = useState(false)
  const [gerandoCobrancas, setGerandoCobrancas] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)

  function abrirEdicao(row: AssinaturaRow) {
    setEditando(row)
    setForm({
      status:            row.status === 'sem_assinatura' ? 'trial' : row.status,
      asaas_customer_id: row.asaas_customer_id ?? '',
      trial_ate:         row.trial_ate ?? new Date(Date.now() + 30*86400000).toISOString().slice(0,10),
    })
  }

  async function salvar() {
    if (!editando) return
    setSalvando(true)
    const sb = supabase as any
    const payload = {
      escola_id:         editando.escola_id,
      status:            form.status,
      asaas_customer_id: form.asaas_customer_id || null,
      trial_ate:         form.trial_ate || null,
      atualizado_em:     new Date().toISOString(),
    }
    await sb.from('assinaturas_saas').upsert(payload, { onConflict: 'escola_id' })
    setSalvando(false)
    setEditando(null)
    startTransition(() => router.refresh())
  }

  async function gerarCobrancas() {
    setGerandoCobrancas(true)
    setResultado(null)
    try {
      const res = await fetch('/api/billing/gerar-cobrancas', {
        method: 'POST',
        headers: { 'x-billing-secret': '' }, // será preenchido via env no server
      })
      const data = await res.json()
      if (res.ok) {
        setResultado(`✅ ${data.total} escola(s) processada(s) para ${data.mes}`)
      } else {
        setResultado(`❌ Erro: ${data.error}`)
      }
    } catch {
      setResultado('❌ Erro ao gerar cobranças')
    }
    setGerandoCobrancas(false)
  }

  const totalAtivas = dados.filter(d => d.status === 'ativa').length
  const totalTrial  = dados.filter(d => d.status === 'trial').length
  const totalAlunos = dados.reduce((acc, d) => acc + d.qtd_alunos, 0)

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Assinaturas</h1>
        <p className="text-muted-foreground mt-1">Gerencie as escolas clientes e cobranças mensais.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-soft p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Escolas ativas</p>
          <p className="text-3xl font-bold mt-1 text-emerald-600">{totalAtivas}</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Em trial</p>
          <p className="text-3xl font-bold mt-1 text-blue-600">{totalTrial}</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total de alunos</p>
          <p className="text-3xl font-bold mt-1">{totalAlunos}</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Receita potencial</p>
          <p className="text-2xl font-bold mt-1 text-primary">
            R$ {receitaPotencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-soft overflow-hidden mb-4">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_48px] gap-4 px-5 py-3 border-b border-border/50">
          {['Escola','Alunos','Faixa','Valor/mês','Status',''].map(h => (
            <p key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</p>
          ))}
        </div>

        {dados.map(row => {
          const cfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.sem_assinatura
          const Icon = cfg.Icon
          return (
            <div key={row.escola_id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_48px] gap-4 px-5 py-4 border-b border-border/30 last:border-0 items-center hover:bg-slate-50/50">
              <div>
                <p className="font-bold text-slate-800 text-sm">{row.escola_nome}</p>
                {row.asaas_customer_id && <p className="text-xs text-slate-400 truncate">{row.asaas_customer_id}</p>}
              </div>
              <p className="text-sm text-slate-600">{row.qtd_alunos}</p>
              <p className="text-xs text-slate-500">{row.faixa}</p>
              <p className="text-sm font-semibold text-slate-700">
                R$ {row.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full w-fit ${cfg.color}`}>
                <Icon className="w-3 h-3" />{cfg.label}
              </span>
              <button onClick={() => abrirEdicao(row)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Botão gerar cobranças */}
      <div className="flex items-center gap-4">
        <Button onClick={gerarCobrancas} disabled={gerandoCobrancas} className="gap-2">
          {gerandoCobrancas ? <><Loader2 className="w-4 h-4 animate-spin" />Gerando...</> : <><DollarSign className="w-4 h-4" />Gerar cobranças do mês</>}
        </Button>
        <p className="text-xs text-slate-400">Executado automaticamente todo dia 1º às 09h</p>
      </div>
      {resultado && <p className="mt-3 text-sm font-medium">{resultado}</p>}

      {/* Modal edição */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditando(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md z-10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-800">{editando.escola_nome}</h2>
              <button onClick={() => setEditando(null)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-600">
              <strong>{editando.qtd_alunos} alunos</strong> → faixa <strong>{editando.faixa}</strong> →
              <strong> R$ {editando.valor_mensal.toFixed(2).replace('.',',')}/mês</strong>
            </div>

            <div className="space-y-1">
              <Label className="font-bold text-slate-700 text-sm">Status</Label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base outline-none focus:ring-2 focus:ring-primary/20">
                <option value="trial">Trial</option>
                <option value="ativa">Ativa</option>
                <option value="suspensa">Suspensa</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            {form.status === 'trial' && (
              <div className="space-y-1">
                <Label className="font-bold text-slate-700 text-sm">Trial até</Label>
                <Input type="date" value={form.trial_ate} onChange={e => setForm(f => ({ ...f, trial_ate: e.target.value }))} />
              </div>
            )}

            <div className="space-y-1">
              <Label className="font-bold text-slate-700 text-sm">ID do cliente no Asaas</Label>
              <Input placeholder="cus_xxxxxxxxxxxxxxxx" value={form.asaas_customer_id}
                onChange={e => setForm(f => ({ ...f, asaas_customer_id: e.target.value }))} />
              <p className="text-xs text-slate-400">Necessário para gerar PIX/boleto automático</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditando(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={salvar} disabled={salvando}>
                {salvando ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
