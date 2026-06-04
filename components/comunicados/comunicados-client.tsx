'use client'

import { useState } from 'react'
import { Send, MessageSquare, Clock, Users, CheckCircle2, AlertCircle, Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Turma    { id: string; nome: string }
interface Historico {
  id: string; titulo: string; mensagem: string; criado_em: string
  enviados: number; falhas: number; canal: string
  turma: { nome: string } | null
  enviado_por_usuario: { nome: string } | null
}
interface Props {
  turmas: Turma[]; historico: Historico[]
  escolaId: string; escolaNome: string; whatsappAtivo: boolean
}

const TEMPLATES = [
  { label: 'Lembrete de pagamento', texto: 'Olá, {nome}! 👋\n\nPassamos para lembrar que a mensalidade de {escola} está em aberto.\n\nAcesse o app EduNest para pagar via PIX ou boleto. 💙' },
  { label: 'Reunião de pais',       texto: 'Olá, {nome}!\n\n🗓 Lembramos que haverá reunião de pais na {escola}.\n\nConfirme sua presença pelo app EduNest.' },
  { label: 'Recado da diretora',    texto: 'Olá, {nome}!\n\nA direção da {escola} tem um recado importante para você.\n\nAcesse o app EduNest para mais detalhes. 📲' },
  { label: 'Evento especial',       texto: 'Olá, {nome}! 🎉\n\nTemos um evento especial na {escola} em breve.\n\nFique de olho no calendário pelo app EduNest!' },
]

function tempoRelativo(d: string) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000)
  if (h < 1) return 'agora'; if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h/24)}d`
}

export function ComunicadosClient({ turmas, historico, escolaId, escolaNome, whatsappAtivo }: Props) {
  const [titulo,   setTitulo]   = useState('')
  const [mensagem, setMensagem] = useState('')
  const [turmaId,  setTurmaId]  = useState('')
  const [enviando, setEnviando] = useState(false)
  const [resultado,setResultado]= useState<{ enviados:number; falhas:number; total:number } | null>(null)
  const [erro,     setErro]     = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo || !mensagem) { setErro('Preencha título e mensagem.'); return }
    setEnviando(true); setErro(''); setResultado(null)
    try {
      const res = await fetch('/api/comunicados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, mensagem, turmaId: turmaId || null, escolaId, escolaNome }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResultado(data)
      setTitulo(''); setMensagem(''); setTurmaId('')
    } catch (err: any) {
      setErro(err.message ?? 'Erro ao enviar comunicado.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Comunicados</h1>
        <p className="text-muted-foreground mt-1">Envie mensagens em massa via WhatsApp para os responsáveis.</p>
      </div>

      {!whatsappAtivo && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3 text-sm">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-amber-700">
            <strong>Modo demo</strong> — Configure <code className="bg-amber-100 px-1 rounded">EVOLUTION_API_URL</code> e <code className="bg-amber-100 px-1 rounded">EVOLUTION_API_KEY</code> para envios reais.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Novo Comunicado
          </h2>

          {/* Templates rápidos */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Templates rápidos</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <button key={t.label} type="button"
                  onClick={() => { setTitulo(t.label); setMensagem(t.texto) }}
                  className="text-xs px-3 py-1.5 bg-primary/5 text-primary rounded-full font-semibold hover:bg-primary/10 transition-colors border border-primary/20">
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={enviar} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input placeholder="Ex: Lembrete de pagamento" value={titulo} onChange={e => setTitulo(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Destinatários</Label>
              <select value={turmaId} onChange={e => setTurmaId(e.target.value)}
                className="flex h-12 w-full rounded border border-primary/20 bg-white px-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                <option value="">Todos os responsáveis</option>
                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Mensagem *</Label>
                <span className="text-xs text-muted-foreground">Variáveis: {'{nome}'} {'{escola}'}</span>
              </div>
              <textarea
                value={mensagem}
                onChange={e => setMensagem(e.target.value)}
                rows={6}
                placeholder="Olá, {nome}! ..."
                className="flex w-full rounded border border-primary/20 bg-white px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              />
            </div>

            {/* Preview */}
            {mensagem && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-xs font-semibold text-green-700 mb-1">Preview WhatsApp</p>
                <p className="text-xs text-green-800 whitespace-pre-wrap">
                  {mensagem.replace('{nome}','Maria').replace('{escola}', escolaNome)}
                </p>
              </div>
            )}

            {resultado && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <p className="text-sm font-bold text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Comunicado enviado!
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {resultado.enviados} enviados · {resultado.falhas} falhas · {resultado.total} total
                  {!whatsappAtivo && ' (modo demo)'}
                </p>
              </div>
            )}

            {erro && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{erro}</p>}

            <Button type="submit" className="w-full gap-2" disabled={enviando}>
              {enviando
                ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</>
                : <><Send className="w-4 h-4" />Enviar via WhatsApp</>
              }
            </Button>
          </form>
        </div>

        {/* Histórico */}
        <div>
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" /> Histórico
          </h2>
          {historico.length === 0 ? (
            <div className="bg-white rounded-lg shadow-soft p-8 text-center">
              <p className="text-muted-foreground text-sm">Nenhum comunicado enviado ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historico.map(h => (
                <div key={h.id} className="bg-white rounded-lg shadow-soft p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-sm">{h.titulo}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{tempoRelativo(h.criado_em)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{h.mensagem}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />{h.enviados} enviados
                    </span>
                    {h.falhas > 0 && (
                      <span className="flex items-center gap-1 text-red-500 font-semibold">
                        <AlertCircle className="w-3 h-3" />{h.falhas} falhas
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-muted-foreground ml-auto">
                      <Users className="w-3 h-3" />{h.turma?.nome ?? 'Todos'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
