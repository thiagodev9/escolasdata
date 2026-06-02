'use client'

import { useState } from 'react'
import { Search, QrCode, FileText, CreditCard, Plus, X, Loader2, Download, Copy, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { AsaasCobranca } from '@/lib/asaas/types'

interface Props {
  cobrancas: AsaasCobranca[]
  alunos: any[]
  asaasAtivo: boolean
}

const STATUS_CFG: Record<string, { label:string; cls:string }> = {
  PENDING:   { label:'Pendente',   cls:'bg-amber-100 text-amber-700' },
  RECEIVED:  { label:'Recebido',   cls:'bg-green-100 text-green-700' },
  CONFIRMED: { label:'Confirmado', cls:'bg-green-100 text-green-700' },
  OVERDUE:   { label:'Vencido',    cls:'bg-red-100   text-red-700'   },
  REFUNDED:  { label:'Estornado',  cls:'bg-gray-100  text-gray-600'  },
  CANCELLED: { label:'Cancelado',  cls:'bg-gray-100  text-gray-500'  },
}
const BILLING_ICON: Record<string, React.ReactNode> = {
  PIX:         <QrCode   className="w-4 h-4 text-green-600" />,
  BOLETO:      <FileText  className="w-4 h-4 text-amber-600" />,
  CREDIT_CARD: <CreditCard className="w-4 h-4 text-primary" />,
  DEBIT_CARD:  <CreditCard className="w-4 h-4 text-secondary" />,
}
const FILTROS = ['Todos','Pendente','Recebido','Vencido','Cancelado']
const fmt = (v: number) => v.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})

export function FinanceiroClient({ cobrancas, alunos, asaasAtivo }: Props) {
  const [busca,        setBusca]        = useState('')
  const [filtro,       setFiltro]       = useState('Todos')
  const [showModal,    setShowModal]    = useState(false)
  const [salvando,     setSalvando]     = useState(false)
  const [pixData,      setPixData]      = useState<{ encodedImage:string; payload:string } | null>(null)
  const [copied,       setCopied]       = useState(false)
  const [erro,         setErro]         = useState('')

  const [form, setForm] = useState({
    aluno_id: '', tipo: 'PIX' as 'PIX'|'BOLETO'|'CREDIT_CARD',
    valor: '1200', vencimento: new Date(Date.now() + 86400000*7).toISOString().split('T')[0],
    descricao: 'Mensalidade', responsavelNome: '', responsavelEmail: '', responsavelCpf: '',
  })

  function selecionarAluno(alunoId: string) {
    const aluno = alunos.find(a => a.id === alunoId)
    const resp  = aluno?.alunos_responsaveis?.[0]?.responsavel
    setForm(f => ({
      ...f, aluno_id: alunoId,
      responsavelNome:  resp?.nome  ?? f.responsavelNome,
      responsavelEmail: resp?.email ?? f.responsavelEmail,
    }))
  }

  async function gerarCobranca(e: React.FormEvent) {
    e.preventDefault()
    if (!form.aluno_id) { setErro('Selecione um aluno.'); return }
    setSalvando(true); setErro(''); setPixData(null)

    const aluno = alunos.find(a => a.id === form.aluno_id)
    const res = await fetch('/api/asaas/cobrancas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responsavelNome:  form.responsavelNome  || aluno?.nome,
        responsavelEmail: form.responsavelEmail,
        responsavelCpf:   form.responsavelCpf,
        valor:      parseFloat(form.valor),
        vencimento: form.vencimento,
        descricao:  form.descricao,
        tipo:       form.tipo,
        alunoId:    form.aluno_id,
      }),
    })
    const data = await res.json()
    setSalvando(false)

    if (!res.ok || data.error) {
      setErro(data.error ?? 'Erro ao gerar cobrança.')
      return
    }
    if (data.pixData) setPixData(data.pixData)
    else {
      setShowModal(false)
      alert(`Cobrança criada! ID: ${data.cobranca?.id}`)
    }
  }

  function copiarPix() {
    if (!pixData?.payload) return
    navigator.clipboard.writeText(pixData.payload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filtradas = cobrancas.filter(c => {
    const mb = !busca || (c.customerName ?? '').toLowerCase().includes(busca.toLowerCase())
    const mf = filtro==='Todos' ||
      (filtro==='Pendente'  && c.status==='PENDING')  ||
      (filtro==='Recebido'  && ['RECEIVED','CONFIRMED'].includes(c.status)) ||
      (filtro==='Vencido'   && c.status==='OVERDUE')  ||
      (filtro==='Cancelado' && c.status==='CANCELLED')
    return mb && mf
  })

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filtro===f ? 'bg-primary text-white' : 'border border-border text-foreground hover:bg-muted'
              }`}>{f}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={busca} onChange={e=>setBusca(e.target.value)} className="pl-9 h-9 min-h-0 text-sm w-48" />
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2 h-9 min-h-0 text-sm px-4">
            <Plus className="w-4 h-4" /> Nova Cobrança
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-soft">
        <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_110px_90px_70px] gap-4 px-6 py-3 border-b border-border/50">
          {['Responsável','Descrição','Vencimento','Valor','Status','Método'].map(h => (
            <p key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</p>
          ))}
        </div>
        <div className="divide-y divide-border/30">
          {filtradas.length===0
            ? <p className="py-12 text-center text-muted-foreground text-sm">Nenhuma cobrança encontrada.</p>
            : filtradas.map(c => {
              const st = STATUS_CFG[c.status] ?? STATUS_CFG.PENDING
              return (
                <div key={c.id} className="grid md:grid-cols-[2fr_1.5fr_1fr_110px_90px_70px] gap-4 px-6 py-4 items-center hover:bg-muted/20 transition-colors">
                  <p className="font-semibold text-sm truncate">{c.customerName}</p>
                  <p className="text-sm text-muted-foreground truncate">{c.description}</p>
                  <p className="text-sm">{new Date(c.dueDate+'T12:00').toLocaleDateString('pt-BR')}</p>
                  <p className="text-sm font-bold">{fmt(c.value)}</p>
                  <span className={`inline-flex items-center justify-center text-xs font-semibold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                  <div className="flex items-center gap-1.5">{BILLING_ICON[c.billingType]}</div>
                </div>
              )
            })
          }
        </div>
        {filtradas.length>0 && (
          <div className="px-6 py-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">{filtradas.length} cobranças</p>
          </div>
        )}
      </div>

      {/* Modal nova cobrança */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowModal(false); setPixData(null) }} />
          <div className="relative bg-white rounded-xl shadow-modal w-full max-w-md z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border/50 sticky top-0 bg-white">
              <h2 className="text-lg font-bold">Nova Cobrança</h2>
              <button onClick={() => { setShowModal(false); setPixData(null) }} className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Code PIX */}
            {pixData && (
              <div className="p-6 flex flex-col items-center gap-4">
                <p className="text-green-600 font-bold text-lg">✅ Cobrança gerada!</p>
                <img src={`data:image/png;base64,${pixData.encodedImage}`} alt="QR Code PIX" className="w-48 h-48 rounded-lg border border-border" />
                <div className="w-full">
                  <p className="text-xs text-muted-foreground text-center mb-2">Copia e cola PIX</p>
                  <div className="flex gap-2">
                    <input readOnly value={pixData.payload} className="flex-1 text-xs border border-border rounded px-3 py-2 bg-muted" />
                    <button onClick={copiarPix} className="px-3 py-2 bg-primary text-white rounded text-xs font-semibold flex items-center gap-1">
                      {copied ? <><Check className="w-3 h-3" />Copiado!</> : <><Copy className="w-3 h-3" />Copiar</>}
                    </button>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => { setShowModal(false); setPixData(null) }}>Fechar</Button>
              </div>
            )}

            {!pixData && (
              <form onSubmit={gerarCobranca} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label>Aluno *</Label>
                  <select value={form.aluno_id} onChange={e => selecionarAluno(e.target.value)}
                    className="flex h-12 w-full rounded border border-primary/20 bg-white px-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                    <option value="">Selecione o aluno</option>
                    {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Tipo de cobrança</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['PIX','BOLETO','CREDIT_CARD'] as const).map(t => (
                      <button key={t} type="button" onClick={() => setForm(f => ({...f, tipo:t}))}
                        className={`py-2.5 rounded-md text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5
                          ${form.tipo===t ? 'bg-primary text-white border-primary' : 'border-border text-foreground hover:bg-muted'}`}>
                        {BILLING_ICON[t]}
                        {t==='CREDIT_CARD' ? 'Cartão' : t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Valor (R$)</Label>
                    <Input type="number" step="0.01" min="1" value={form.valor} onChange={e => setForm(f => ({...f, valor:e.target.value}))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Vencimento</Label>
                    <Input type="date" value={form.vencimento} onChange={e => setForm(f => ({...f, vencimento:e.target.value}))} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Input value={form.descricao} onChange={e => setForm(f => ({...f, descricao:e.target.value}))} />
                </div>

                <div className="space-y-1.5">
                  <Label>Nome do responsável</Label>
                  <Input value={form.responsavelNome} onChange={e => setForm(f => ({...f, responsavelNome:e.target.value}))} placeholder="Auto-preenchido ao selecionar aluno" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>E-mail</Label>
                    <Input type="email" value={form.responsavelEmail} onChange={e => setForm(f => ({...f, responsavelEmail:e.target.value}))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>CPF</Label>
                    <Input value={form.responsavelCpf} onChange={e => setForm(f => ({...f, responsavelCpf:e.target.value}))} placeholder="000.000.000-00" />
                  </div>
                </div>

                {!asaasAtivo && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded px-3 py-2">
                    ⚠️ Asaas não configurado — a cobrança será simulada.
                  </p>
                )}
                {erro && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{erro}</p>}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancelar</Button>
                  <Button type="submit" className="flex-1" disabled={salvando}>
                    {salvando ? <><Loader2 className="w-4 h-4 animate-spin" />Gerando...</> : `Gerar ${form.tipo}`}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
