'use client'

import { useState } from 'react'
import {
  FileText, Plus, Settings, Check, Clock, X, AlertCircle,
  Download, ChevronDown, ChevronUp, RefreshCw, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { NfseConfig, NfseEmitida, NfseStatus } from '@/lib/supabase/types'

interface Aluno { id: string; nome: string; responsaveis: { id: string; nome: string; email: string | null }[] }

interface Props {
  emitidas:  NfseEmitida[]
  alunos:    Aluno[]
  config:    NfseConfig | null
  escolaId:  string
  autorId:   string
}

const STATUS_CFG: Record<NfseStatus, { label: string; color: string; icon: React.ElementType }> = {
  pendente:  { label: 'Pendente',  color: 'bg-amber-100 text-amber-700',  icon: Clock },
  emitida:   { label: 'Emitida',   color: 'bg-green-100 text-green-700',  icon: Check },
  cancelada: { label: 'Cancelada', color: 'bg-gray-100 text-gray-500',    icon: X     },
  erro:      { label: 'Erro',      color: 'bg-red-100 text-red-600',      icon: AlertCircle },
}

const MESES = ['01','02','03','04','05','06','07','08','09','10','11','12']
const MESES_NOME = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export function NfseClient({ emitidas: inicial, alunos, config, escolaId, autorId }: Props) {
  const [items,      setItems]      = useState(inicial)
  const [showModal,  setShowModal]  = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [expandido,  setExpandido]  = useState<string | null>(null)
  const [salvando,   setSalvando]   = useState(false)
  const [erro,       setErro]       = useState('')
  const [xmlModal,   setXmlModal]   = useState<{ xml: string; id: string } | null>(null)

  // Formulário emissão
  const hoje = new Date()
  const [alunoId,     setAlunoId]     = useState(alunos[0]?.id ?? '')
  const [valor,       setValor]       = useState('1200')
  const [competencia, setCompetencia] = useState(`${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}`)
  const [descricao,   setDescricao]   = useState('')

  // Formulário config
  const [cfg, setCfg] = useState<Partial<NfseConfig>>({
    prestador_cnpj:    config?.prestador_cnpj    ?? '',
    prestador_im:      config?.prestador_im      ?? '',
    regime_tributario: config?.regime_tributario ?? 'simples',
    iss_aliquota:      config?.iss_aliquota      ?? 5,
    codigo_servico:    config?.codigo_servico    ?? '8.01',
    municipio_ibge:    config?.municipio_ibge    ?? '',
    municipio_nome:    config?.municipio_nome    ?? '',
    ambiente:          config?.ambiente          ?? 'homologacao',
    nfeio_api_key:     config?.nfeio_api_key     ?? '',
  })

  const alunoSel = alunos.find(a => a.id === alunoId)
  const respSel  = alunoSel?.responsaveis[0]

  async function emitir(e: React.FormEvent) {
    e.preventDefault()
    if (!alunoId || !valor || !competencia) { setErro('Preencha todos os campos.'); return }
    setSalvando(true); setErro('')
    try {
      const res = await fetch('/api/nfse/emitir', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          aluno_id:          alunoId,
          responsavel_id:    respSel?.id,
          responsavel_nome:  respSel?.nome,
          responsavel_email: respSel?.email,
          valor:             parseFloat(valor),
          competencia,
          descricao:         descricao || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      if (json.xml) {
        setXmlModal({ xml: json.xml, id: json.id })
      }

      // Recarregar lista via fetch simples
      window.location.reload()
    } catch (e: any) { setErro(e.message) }
    finally { setSalvando(false) }
  }

  async function salvarConfig(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true); setErro('')
    try {
      const res = await fetch('/api/nfse/config', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(cfg),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setShowConfig(false)
    } catch (e: any) { setErro(e.message) }
    finally { setSalvando(false) }
  }

  function baixarXml(xml: string, id: string) {
    const blob = new Blob([xml], { type: 'application/xml' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: `nfse_${id}.xml` })
    a.click(); URL.revokeObjectURL(url)
  }

  const total       = items.filter(n => n.status === 'emitida').reduce((s, n) => s + n.valor, 0)
  const pendentes   = items.filter(n => n.status === 'pendente').length
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div>
      {/* Config incompleta warning */}
      {(!config?.prestador_cnpj || !config?.prestador_im) && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 flex-1">
            Configure o CNPJ e a Inscrição Municipal para emissão automática.
            Sem configuração, o sistema gera o XML para envio manual à prefeitura.
          </p>
          <button onClick={() => setShowConfig(true)}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 shrink-0">
            Configurar
          </button>
        </div>
      )}

      {/* KPIs + ações */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="bg-white rounded-lg shadow-soft px-5 py-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Emitido no mês</p>
          <p className="text-2xl font-bold text-green-600">{fmt(total)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft px-5 py-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Pendentes</p>
          <p className="text-2xl font-bold text-amber-600">{pendentes}</p>
        </div>
        <div className="flex-1" />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowConfig(true)} className="gap-2">
            <Settings className="w-4 h-4" /> Configurar NFS-e
          </Button>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Emitir NFS-e
          </Button>
        </div>
      </div>

      {/* Lista */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-white rounded-lg">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-semibold">Nenhuma NFS-e emitida ainda</p>
          <p className="text-sm mt-1">Clique em &ldquo;Emitir NFS-e&rdquo; para começar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(n => {
            const cfg2 = STATUS_CFG[n.status]
            const Icon  = cfg2.icon
            const open  = expandido === n.id
            const alunoNome = alunos.find(a => a.id === n.aluno_id)?.nome ?? '—'
            const comp  = n.competencia ? n.competencia.slice(0, 7) : '—'

            return (
              <div key={n.id} className="bg-white rounded-lg border border-border shadow-soft">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandido(open ? null : n.id)}
                >
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{alunoNome}</p>
                    <p className="text-xs text-muted-foreground">{n.descricao ?? '—'} · {comp}</p>
                  </div>
                  <p className="font-bold text-sm shrink-0">{fmt(n.valor)}</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg2.color} shrink-0`}>
                    <Icon className="w-3 h-3" />{cfg2.label}
                  </span>
                  {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>

                {open && (
                  <div className="border-t border-border px-4 py-3 flex flex-wrap gap-3">
                    {n.nfse_numero && <p className="text-xs text-muted-foreground">Número: <strong>{n.nfse_numero}</strong></p>}
                    {n.erro_msg    && <p className="text-xs text-red-500">{n.erro_msg}</p>}
                    {n.xml_url && (
                      <a href={n.xml_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold text-primary flex items-center gap-1">
                        <Download className="w-3 h-3" /> XML
                      </a>
                    )}
                    {n.pdf_url && (
                      <a href={n.pdf_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold text-primary flex items-center gap-1">
                        <Download className="w-3 h-3" /> PDF
                      </a>
                    )}
                    <p className="text-xs text-muted-foreground ml-auto">
                      {new Date(n.criado_em).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal emitir */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-bold text-lg">Emitir NFS-e</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={emitir} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label>Aluno</Label>
                <select value={alunoId} onChange={e => setAlunoId(e.target.value)}
                  className="flex h-11 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none">
                  {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
                {respSel && <p className="text-xs text-muted-foreground">Tomador: {respSel.nome}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Valor (R$)</Label>
                  <input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)}
                    className="flex h-11 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <Label>Competência</Label>
                  <input type="month" value={competencia} onChange={e => setCompetencia(e.target.value)}
                    className="flex h-11 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Discriminação (opcional)</Label>
                <input value={descricao} onChange={e => setDescricao(e.target.value)}
                  placeholder={`Mensalidade ${MESES_NOME[parseInt(competencia.split('-')[1])-1]}`}
                  className="flex h-11 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none" />
              </div>
              {erro && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{erro}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button type="submit" className="gap-2" disabled={salvando}>
                  {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  {salvando ? 'Emitindo...' : 'Emitir'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal XML */}
      {xmlModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-bold text-lg">NFS-e Gerada — Modo Manual</h2>
              <button onClick={() => setXmlModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
                <strong>Configure NFe.io</strong> para emissão automática. Por enquanto, baixe o XML e envie manualmente ao portal da prefeitura.
              </div>
              <pre className="bg-gray-50 rounded p-3 text-xs overflow-auto max-h-48 border border-gray-200">
                {xmlModal.xml.slice(0, 800)}...
              </pre>
              <div className="flex gap-2">
                <Button onClick={() => baixarXml(xmlModal.xml, xmlModal.id)} className="gap-2 flex-1">
                  <Download className="w-4 h-4" /> Baixar XML
                </Button>
                <Button variant="outline" onClick={() => setXmlModal(null)}>Fechar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal configuração */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-lg my-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-bold text-lg">Configuração NFS-e</h2>
              <button onClick={() => setShowConfig(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={salvarConfig} className="p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>CNPJ do Prestador</Label>
                  <input value={cfg.prestador_cnpj ?? ''} onChange={e => setCfg(p => ({...p, prestador_cnpj: e.target.value}))}
                    placeholder="00.000.000/0001-00"
                    className="flex h-11 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <Label>Inscrição Municipal</Label>
                  <input value={cfg.prestador_im ?? ''} onChange={e => setCfg(p => ({...p, prestador_im: e.target.value}))}
                    placeholder="00000000"
                    className="flex h-11 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <Label>Alíquota ISS (%)</Label>
                  <input type="number" step="0.01" value={cfg.iss_aliquota ?? 5} onChange={e => setCfg(p => ({...p, iss_aliquota: parseFloat(e.target.value)}))}
                    className="flex h-11 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <Label>Código do Serviço</Label>
                  <input value={cfg.codigo_servico ?? ''} onChange={e => setCfg(p => ({...p, codigo_servico: e.target.value}))}
                    placeholder="8.01"
                    className="flex h-11 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <Label>Município (IBGE)</Label>
                  <input value={cfg.municipio_ibge ?? ''} onChange={e => setCfg(p => ({...p, municipio_ibge: e.target.value}))}
                    placeholder="3550308 (São Paulo)"
                    className="flex h-11 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <Label>Regime Tributário</Label>
                  <select value={cfg.regime_tributario} onChange={e => setCfg(p => ({...p, regime_tributario: e.target.value as any}))}
                    className="flex h-11 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none">
                    <option value="simples">Simples Nacional</option>
                    <option value="lucro_presumido">Lucro Presumido</option>
                    <option value="lucro_real">Lucro Real</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>NFe.io API Key (opcional)</Label>
                <input type="password" value={cfg.nfeio_api_key ?? ''} onChange={e => setCfg(p => ({...p, nfeio_api_key: e.target.value}))}
                  placeholder="Para emissão automática via NFe.io"
                  className="flex h-11 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none" />
                <p className="text-xs text-muted-foreground">Obtenha em nfe.io. Sem esta chave, o sistema gera XML para emissão manual.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Ambiente</Label>
                <div className="flex gap-3">
                  {['homologacao', 'producao'].map(a => (
                    <label key={a} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="ambiente" value={a} checked={cfg.ambiente === a}
                        onChange={() => setCfg(p => ({...p, ambiente: a as any}))} />
                      <span className="text-sm font-semibold capitalize">{a === 'homologacao' ? 'Homologação (teste)' : 'Produção'}</span>
                    </label>
                  ))}
                </div>
              </div>
              {erro && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{erro}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setShowConfig(false)}>Cancelar</Button>
                <Button type="submit" disabled={salvando} className="gap-2">
                  {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Salvar Configuração
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
