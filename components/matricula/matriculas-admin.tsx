'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Clock, Eye, Baby, User, Phone, Mail, Calendar, Link2, ChevronDown, ChevronUp } from 'lucide-react'
import type { Matricula, MatriculaStatus } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Props {
  matriculas: Matricula[]
  escolaId: string
  slug: string
}

const STATUS_CONFIG: Record<MatriculaStatus, { label: string; color: string; icon: React.ElementType }> = {
  aguardando: { label: 'Aguardando',  color: 'bg-amber-100 text-amber-700',  icon: Clock },
  aprovada:   { label: 'Aprovada',    color: 'bg-green-100 text-green-700',   icon: Check },
  rejeitada:  { label: 'Rejeitada',   color: 'bg-red-100 text-red-700',       icon: X     },
}

export function MatriculasAdmin({ matriculas: inicial, escolaId, slug }: Props) {
  const [items, setItems]       = useState(inicial)
  const [filtro, setFiltro]     = useState<MatriculaStatus | 'todos'>('todos')
  const [expandido, setExpandido] = useState<string | null>(null)
  const [, startTransition]     = useTransition()
  const router = useRouter()
  const sb = createClient() as any

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/matricula/${slug}`
    : `/matricula/${slug}`

  async function mudarStatus(id: string, status: MatriculaStatus) {
    await sb.from('matriculas').update({ status }).eq('id', id)
    setItems(prev => prev.map(m => m.id === id ? { ...m, status } : m))
    startTransition(() => router.refresh())
  }

  const filtrados = filtro === 'todos' ? items : items.filter(m => m.status === filtro)
  const contagem: Record<string, number> = {
    todos:      items.length,
    aguardando: items.filter(m => m.status === 'aguardando').length,
    aprovada:   items.filter(m => m.status === 'aprovada').length,
    rejeitada:  items.filter(m => m.status === 'rejeitada').length,
  }

  return (
    <div>
      {/* Link público */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3 mb-6">
        <Link2 className="w-4 h-4 text-blue-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-blue-700 mb-0.5">Link público de pré-matrícula</p>
          <p className="text-xs text-blue-600 truncate">{url}</p>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(url)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 shrink-0"
        >
          Copiar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['todos', 'aguardando', 'aprovada', 'rejeitada'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors capitalize ${
              filtro === f ? 'bg-primary text-white border-primary' : 'border-border hover:bg-muted'
            }`}
          >
            {f === 'todos' ? 'Todos' : STATUS_CONFIG[f as MatriculaStatus].label} ({contagem[f]})
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Baby className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-semibold">Nenhuma solicitação {filtro !== 'todos' ? STATUS_CONFIG[filtro as MatriculaStatus].label.toLowerCase() : ''}</p>
          <p className="text-sm mt-1">Compartilhe o link de matrícula com os pais.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map(m => {
            const cfg = STATUS_CONFIG[m.status]
            const StatusIcon = cfg.icon
            const isOpen = expandido === m.id
            const idade = calcularIdade(m.aluno_nascimento)

            return (
              <div key={m.id} className="bg-white rounded-lg border border-border shadow-soft">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandido(isOpen ? null : m.id)}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Baby className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground">{m.aluno_nome}</p>
                    <p className="text-xs text-muted-foreground">{idade} · {m.turma_interesse ?? 'Turma não especificada'}</p>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </span>

                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>

                {isOpen && (
                  <div className="border-t border-border px-4 py-4 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <InfoRow icon={Baby}     label="Nascimento" value={new Date(m.aluno_nascimento).toLocaleDateString('pt-BR')} />
                      <InfoRow icon={User}     label="Responsável" value={`${m.resp_nome} (${m.resp_parentesco})`} />
                      <InfoRow icon={Phone}    label="Telefone" value={m.resp_telefone} />
                      {m.resp_email && <InfoRow icon={Mail} label="E-mail" value={m.resp_email} />}
                      <InfoRow icon={Calendar} label="Enviado em" value={new Date(m.criado_em).toLocaleDateString('pt-BR')} />
                    </div>

                    {m.status === 'aguardando' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="gap-1.5 bg-green-600 hover:bg-green-700"
                          onClick={() => mudarStatus(m.id, 'aprovada')}
                        >
                          <Check className="w-3.5 h-3.5" /> Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => mudarStatus(m.id, 'rejeitada')}
                        >
                          <X className="w-3.5 h-3.5" /> Rejeitar
                        </Button>
                        <a
                          href={`https://wa.me/55${m.resp_telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${m.resp_nome}! Recebemos a solicitação de pré-matrícula de ${m.aluno_nome}. Vamos verificar a disponibilidade de vaga e retornaremos em breve.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-[#25D366] text-white hover:bg-[#22c55e] transition-colors"
                        >
                          WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

function calcularIdade(nascimento: string) {
  const hoje = new Date()
  const nasc  = new Date(nascimento)
  let anos    = hoje.getFullYear() - nasc.getFullYear()
  let meses   = hoje.getMonth() - nasc.getMonth()
  if (meses < 0) { anos--; meses += 12 }
  if (anos === 0) return `${meses} mese${meses !== 1 ? 's' : ''}`
  return `${anos} ano${anos !== 1 ? 's' : ''}`
}
