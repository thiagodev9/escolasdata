'use client'

import { useState } from 'react'
import {
  Shield, FileDown, Trash2, RefreshCw, Check, X, Clock,
  AlertCircle, ChevronDown, ChevronUp, ExternalLink, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { LgpdRequest, LgpdStatus, LgpdTipo, AuditLog } from '@/lib/supabase/types'

interface Props {
  requests:  LgpdRequest[]
  auditLog:  AuditLog[]
  escolaId:  string
  slug:      string
}

const STATUS_CFG: Record<LgpdStatus, { label: string; color: string; icon: React.ElementType }> = {
  pendente:     { label: 'Pendente',     color: 'bg-amber-100 text-amber-700', icon: Clock     },
  processando:  { label: 'Processando',  color: 'bg-blue-100 text-blue-700',   icon: RefreshCw },
  concluido:    { label: 'Concluído',    color: 'bg-green-100 text-green-700', icon: Check     },
  rejeitado:    { label: 'Rejeitado',    color: 'bg-red-100 text-red-600',     icon: X         },
}

const TIPO_LABEL: Record<LgpdTipo, string> = {
  exportacao:     'Exportação de Dados',
  exclusao:       'Exclusão de Dados',
  correcao:       'Correção de Dados',
  portabilidade:  'Portabilidade',
}

const TIPO_ICON: Record<LgpdTipo, React.ElementType> = {
  exportacao:    FileDown,
  exclusao:      Trash2,
  correcao:      RefreshCw,
  portabilidade: ExternalLink,
}

export function LgpdClient({ requests: inicial, auditLog, escolaId, slug }: Props) {
  const [requests,    setRequests]    = useState(inicial)
  const [tab,         setTab]         = useState<'solicitacoes' | 'export' | 'auditoria'>('solicitacoes')
  const [expandido,   setExpandido]   = useState<string | null>(null)
  const [salvando,    setSalvando]    = useState(false)
  const [exportEmail, setExportEmail] = useState('')
  const [exportando,  setExportando]  = useState(false)
  const [exportErro,  setExportErro]  = useState('')
  const [respostaMap, setRespostaMap] = useState<Record<string, string>>({})

  async function processarRequest(id: string, status: LgpdStatus) {
    setSalvando(true)
    try {
      await fetch('/api/lgpd/request', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, status, resposta: respostaMap[id] }),
      })
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      setExpandido(null)
    } finally { setSalvando(false) }
  }

  async function exportarDados() {
    if (!exportEmail.trim()) { setExportErro('Informe o e-mail.'); return }
    setExportando(true); setExportErro('')
    try {
      const res = await fetch(`/api/lgpd/export?email=${encodeURIComponent(exportEmail.trim())}`)
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error)
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = Object.assign(document.createElement('a'), {
        href: url,
        download: `dados_${exportEmail.replace('@','_')}.json`,
      })
      a.click(); URL.revokeObjectURL(url)
    } catch (e: any) {
      setExportErro(e.message)
    } finally { setExportando(false) }
  }

  const pendentes   = requests.filter(r => r.status === 'pendente').length
  const publicLink  = typeof window !== 'undefined'
    ? `${window.location.origin}/privacidade`
    : '/privacidade'
  const solicitacoesLink = typeof window !== 'undefined'
    ? `${window.location.origin}/lgpd/solicitar?escola=${slug}`
    : `/lgpd/solicitar?escola=${slug}`

  return (
    <div>
      {/* Alerta de pendências */}
      {pendentes > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            <strong>{pendentes} solicitação{pendentes > 1 ? 'ões' : ''} LGPD</strong> aguardando resposta.
            O prazo legal é de <strong>15 dias úteis</strong>.
          </p>
          <button onClick={() => setTab('solicitacoes')} className="text-xs font-bold text-amber-700 hover:text-amber-900 shrink-0">
            Ver
          </button>
        </div>
      )}

      {/* Links úteis */}
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-border p-4 flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Política de Privacidade</p>
            <p className="text-xs text-muted-foreground truncate">{publicLink}</p>
          </div>
          <a href={publicLink} target="_blank" rel="noopener noreferrer"
            className="text-xs font-semibold text-primary hover:underline shrink-0">
            Abrir
          </a>
        </div>
        <div className="bg-white rounded-lg border border-border p-4 flex items-center gap-3">
          <ExternalLink className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Formulário de Solicitação</p>
            <p className="text-xs text-muted-foreground truncate">Para responsáveis enviarem pedidos</p>
          </div>
          <button onClick={() => navigator.clipboard.writeText(solicitacoesLink)}
            className="text-xs font-semibold text-primary hover:underline shrink-0">
            Copiar link
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-muted rounded-lg p-1 w-fit">
        {([
          { key: 'solicitacoes', label: 'Solicitações' },
          { key: 'export',       label: 'Exportar Dados' },
          { key: 'auditoria',    label: 'Auditoria' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
              tab === t.key ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
            {t.key === 'solicitacoes' && pendentes > 0 && (
              <span className="ml-1.5 bg-red-500 text-white rounded-full text-[10px] font-bold px-1.5">{pendentes}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Solicitações */}
      {tab === 'solicitacoes' && (
        <>
          {requests.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-white rounded-lg">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-semibold">Nenhuma solicitação LGPD</p>
              <p className="text-sm mt-1">As solicitações dos responsáveis aparecem aqui.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.map(r => {
                const cfg  = STATUS_CFG[r.status]
                const Icon = cfg.icon
                const TipoIcon = TIPO_ICON[r.tipo]
                const open = expandido === r.id

                return (
                  <div key={r.id} className="bg-white rounded-lg border border-border shadow-soft">
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer"
                      onClick={() => setExpandido(open ? null : r.id)}
                    >
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <TipoIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{TIPO_LABEL[r.tipo]}</p>
                        <p className="text-xs text-muted-foreground">{r.responsavel_email} · {new Date(r.criado_em).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                      {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>

                    {open && (
                      <div className="border-t border-border px-4 py-4 space-y-3">
                        {r.responsavel_nome && <p className="text-sm"><strong>Nome:</strong> {r.responsavel_nome}</p>}
                        {r.observacoes && <p className="text-sm"><strong>Observações:</strong> {r.observacoes}</p>}

                        {r.status === 'pendente' && (
                          <div className="space-y-2">
                            <Label className="text-xs">Resposta ao titular (opcional)</Label>
                            <textarea
                              value={respostaMap[r.id] ?? ''}
                              onChange={e => setRespostaMap(p => ({ ...p, [r.id]: e.target.value }))}
                              rows={2}
                              placeholder="Descreva o que foi feito..."
                              className="w-full rounded border border-border px-3 py-2 text-sm focus:border-primary outline-none resize-none"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700"
                                onClick={() => processarRequest(r.id, 'concluido')} disabled={salvando}>
                                <Check className="w-3.5 h-3.5" /> Marcar Concluído
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1.5 text-amber-600 border-amber-200"
                                onClick={() => processarRequest(r.id, 'processando')} disabled={salvando}>
                                <RefreshCw className="w-3.5 h-3.5" /> Em Processamento
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1.5 text-red-500 border-red-200"
                                onClick={() => processarRequest(r.id, 'rejeitado')} disabled={salvando}>
                                <X className="w-3.5 h-3.5" /> Rejeitar
                              </Button>
                            </div>
                          </div>
                        )}
                        {r.resposta && <p className="text-xs text-muted-foreground"><strong>Resposta dada:</strong> {r.resposta}</p>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Tab: Exportar Dados */}
      {tab === 'export' && (
        <div className="bg-white rounded-lg border border-border p-6 max-w-lg space-y-5">
          <div>
            <h2 className="font-bold text-lg mb-1">Exportar Dados de Responsável</h2>
            <p className="text-sm text-muted-foreground">
              Exporte todos os dados pessoais de um responsável em JSON. Exigido pelo Art. 18 da LGPD quando solicitado.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exp_email">E-mail do responsável</Label>
            <input
              id="exp_email"
              type="email"
              value={exportEmail}
              onChange={e => setExportEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="flex h-12 w-full rounded border border-border bg-white px-4 text-sm focus:border-primary outline-none"
            />
          </div>
          {exportErro && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{exportErro}</p>}
          <Button onClick={exportarDados} disabled={exportando} className="gap-2">
            {exportando ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {exportando ? 'Exportando...' : 'Exportar JSON'}
          </Button>
          <div className="bg-blue-50 rounded-lg px-4 py-3 text-xs text-blue-700">
            <strong>Inclui:</strong> dados do responsável, dados dos filhos, registros do diário, histórico de presenças.
            A exportação fica registrada no log de auditoria.
          </div>
        </div>
      )}

      {/* Tab: Auditoria */}
      {tab === 'auditoria' && (
        <>
          {auditLog.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-white rounded-lg">
              <p className="font-semibold">Log de auditoria vazio</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-muted-foreground text-xs uppercase tracking-wide">Ação</th>
                    <th className="px-4 py-3 text-left font-bold text-muted-foreground text-xs uppercase tracking-wide">Tabela</th>
                    <th className="px-4 py-3 text-left font-bold text-muted-foreground text-xs uppercase tracking-wide">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((log, i) => (
                    <tr key={log.id} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                      <td className="px-4 py-3 font-medium">{log.acao}</td>
                      <td className="px-4 py-3 text-muted-foreground">{log.tabela ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(log.criado_em).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
