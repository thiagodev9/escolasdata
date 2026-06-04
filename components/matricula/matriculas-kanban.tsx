'use client'

import { useState, useTransition } from 'react'
import { Baby, Phone, Calendar, Link2, X, ChevronRight, ChevronLeft, MessageCircle, StickyNote, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Matricula, MatriculaStatus } from '@/lib/supabase/types'

interface Props {
  matriculas: Matricula[]
  escolaId: string
  slug: string
}

const ETAPAS: { status: MatriculaStatus; label: string; cor: string; corBg: string; corBorder: string; emoji: string }[] = [
  { status: 'nova',          label: 'Nova solicitação', cor: 'text-orange-700', corBg: 'bg-orange-50',  corBorder: 'border-orange-200', emoji: '📬' },
  { status: 'contato',       label: 'Contato feito',    cor: 'text-blue-700',   corBg: 'bg-blue-50',    corBorder: 'border-blue-200',   emoji: '📞' },
  { status: 'visita',        label: 'Visita agendada',  cor: 'text-purple-700', corBg: 'bg-purple-50',  corBorder: 'border-purple-200', emoji: '🏫' },
  { status: 'documentacao',  label: 'Documentação',     cor: 'text-indigo-700', corBg: 'bg-indigo-50',  corBorder: 'border-indigo-200', emoji: '📋' },
  { status: 'aprovada',      label: 'Aprovada',         cor: 'text-emerald-700',corBg: 'bg-emerald-50', corBorder: 'border-emerald-200',emoji: '✅' },
  { status: 'rejeitada',     label: 'Cancelado',        cor: 'text-slate-600',  corBg: 'bg-slate-50',   corBorder: 'border-slate-200',  emoji: '❌' },
]

function calcularIdade(nascimento: string): string {
  const hoje = new Date()
  const nasc = new Date(nascimento)
  let anos = hoje.getFullYear() - nasc.getFullYear()
  let meses = hoje.getMonth() - nasc.getMonth()
  if (meses < 0) { anos--; meses += 12 }
  if (anos === 0) return `${meses}m`
  return `${anos}a`
}

function formatPhone(tel: string): string {
  return tel.replace(/\D/g, '')
}

export function MatriculasKanban({ matriculas: inicial, slug }: Props) {
  const router   = useRouter()
  const sb       = createClient() as any
  const [, startTransition] = useTransition()

  const [items,    setItems]    = useState<Matricula[]>(inicial)
  const [selected, setSelected] = useState<Matricula | null>(null)
  const [nota,     setNota]     = useState('')
  const [saving,   setSaving]   = useState(false)

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/matricula/${slug}`
    : `/matricula/${slug}`

  async function moverEtapa(id: string, status: MatriculaStatus, obs?: string) {
    setSaving(true)
    await sb.from('matriculas')
      .update({ status, observacao_interna: obs ?? null, atualizado_em: new Date().toISOString() })
      .eq('id', id)
    setItems(prev => prev.map(m => m.id === id ? { ...m, status, observacao_interna: obs ?? null } : m))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status, observacao_interna: obs ?? null } : null)
    setSaving(false)
    startTransition(() => router.refresh())
  }

  function abrirCard(m: Matricula) {
    setSelected(m)
    setNota(m.observacao_interna ?? '')
  }

  function etapaAtual(status: MatriculaStatus) {
    return ETAPAS.findIndex(e => e.status === status)
  }

  function proxEtapa(status: MatriculaStatus): MatriculaStatus | null {
    const idx = ETAPAS.findIndex(e => e.status === status)
    const etapasAtivas = ETAPAS.filter(e => e.status !== 'rejeitada')
    const activeIdx = etapasAtivas.findIndex(e => e.status === status)
    if (activeIdx === -1 || activeIdx === etapasAtivas.length - 1) return null
    return etapasAtivas[activeIdx + 1].status
  }

  function prevEtapa(status: MatriculaStatus): MatriculaStatus | null {
    const etapasAtivas = ETAPAS.filter(e => e.status !== 'rejeitada')
    const activeIdx = etapasAtivas.findIndex(e => e.status === status)
    if (activeIdx <= 0) return null
    return etapasAtivas[activeIdx - 1].status
  }

  const total = items.length
  const aprovadas = items.filter(m => m.status === 'aprovada').length

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Matrículas</h1>
          <p className="text-slate-500 text-sm mt-1">
            {total} solicitaç{total !== 1 ? 'ões' : 'ão'} · {aprovadas} aprovada{aprovadas !== 1 ? 's' : ''}
          </p>
        </div>
        {/* Link público */}
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
          <Link2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="text-xs text-blue-700 font-semibold hidden sm:block truncate max-w-[240px]">{url}</span>
          <button
            onClick={() => navigator.clipboard.writeText(url)}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 shrink-0 ml-1"
          >
            Copiar link
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
        {ETAPAS.map(etapa => {
          const cards = items.filter(m => m.status === etapa.status)
          return (
            <div
              key={etapa.status}
              className={cn(
                'flex-shrink-0 w-64 flex flex-col rounded-2xl border',
                etapa.corBg, etapa.corBorder
              )}
            >
              {/* Column header */}
              <div className={cn('flex items-center justify-between px-3 py-2.5 border-b', etapa.corBorder)}>
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{etapa.emoji}</span>
                  <span className={cn('text-xs font-black', etapa.cor)}>{etapa.label}</span>
                </div>
                <span className={cn('text-xs font-black px-2 py-0.5 rounded-full', etapa.cor,
                  etapa.status === 'rejeitada' ? 'bg-slate-200' :
                  etapa.status === 'aprovada'  ? 'bg-emerald-200' : 'bg-white/70'
                )}>
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {cards.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Nenhuma matrícula
                  </div>
                )}
                {cards.map(m => (
                  <button
                    key={m.id}
                    onClick={() => abrirCard(m)}
                    className="w-full text-left bg-white rounded-xl border border-slate-100 shadow-soft p-3 hover:border-primary/30 hover:shadow-md transition-all group"
                  >
                    {/* Nome + idade */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 text-sm leading-tight truncate">{m.aluno_nome}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{calcularIdade(m.aluno_nascimento)} · {m.turma_interesse ?? '—'}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5 group-hover:text-primary" />
                    </div>
                    {/* Responsável */}
                    <p className="text-[11px] text-slate-600 font-semibold truncate">{m.resp_nome}</p>
                    {/* Data */}
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(m.criado_em).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })}
                    </p>
                    {/* Observação */}
                    {m.observacao_interna && (
                      <div className="mt-2 flex items-start gap-1">
                        <StickyNote className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-500 line-clamp-1">{m.observacao_interna}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal detalhes */}
      {selected && (() => {
        const etapaIdx   = etapaAtual(selected.status)
        const etapaConfig = ETAPAS[etapaIdx]
        const prox       = proxEtapa(selected.status)
        const prev       = prevEtapa(selected.status)

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Baby className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800">{selected.aluno_nome}</p>
                    <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full', etapaConfig.corBg, etapaConfig.cor)}>
                      {etapaConfig.emoji} {etapaConfig.label}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stepper */}
              <div className="px-5 pt-4">
                <div className="flex items-center gap-1">
                  {ETAPAS.filter(e => e.status !== 'rejeitada').map((e, i, arr) => {
                    const ativo = e.status === selected.status
                    const done  = etapaAtual(selected.status) > i && selected.status !== 'rejeitada'
                    return (
                      <div key={e.status} className="flex items-center flex-1 last:flex-none">
                        <button
                          onClick={() => moverEtapa(selected.id, e.status, nota || undefined)}
                          disabled={saving}
                          className={cn(
                            'w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 transition-all',
                            ativo  ? 'bg-primary text-white scale-110 ring-2 ring-primary/30' :
                            done   ? 'bg-emerald-500 text-white' :
                            'bg-slate-200 text-slate-400 hover:bg-slate-300'
                          )}
                          title={e.label}
                        >
                          {done ? <Check className="w-3 h-3" /> : i + 1}
                        </button>
                        {i < arr.length - 1 && (
                          <div className={cn('flex-1 h-0.5 mx-0.5', done ? 'bg-emerald-400' : 'bg-slate-200')} />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  {ETAPAS.filter(e => e.status !== 'rejeitada').map((e) => (
                    <span key={e.status} className={cn(
                      'text-[9px] font-semibold flex-1 text-center leading-tight',
                      e.status === selected.status ? 'text-primary' : 'text-slate-400'
                    )}>
                      {e.label.split(' ')[0]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="p-5 space-y-3">
                <InfoRow label="Aluno" value={`${selected.aluno_nome} · ${calcularIdade(selected.aluno_nascimento)}`} />
                <InfoRow label="Nascimento" value={new Date(selected.aluno_nascimento).toLocaleDateString('pt-BR')} />
                <InfoRow label="Turma desejada" value={selected.turma_interesse ?? '—'} />
                <div className="border-t border-slate-100 pt-3">
                  <InfoRow label="Responsável" value={`${selected.resp_nome} (${selected.resp_parentesco})`} />
                  <InfoRow label="Telefone" value={selected.resp_telefone} />
                  {selected.resp_email && <InfoRow label="E-mail" value={selected.resp_email} />}
                </div>
                <InfoRow
                  label="Enviado em"
                  value={new Date(selected.criado_em).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}
                />

                {/* Nota interna */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anotação interna</label>
                  <textarea
                    value={nota}
                    onChange={e => setNota(e.target.value)}
                    placeholder="Observações sobre este contato..."
                    className="w-full mt-1 text-sm text-slate-700 bg-slate-50 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 border border-slate-200 h-20"
                  />
                </div>
              </div>

              {/* Ações */}
              <div className="px-5 pb-5 space-y-2">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/55${formatPhone(selected.resp_telefone)}?text=${encodeURIComponent(`Olá ${selected.resp_nome}! Entramos em contato sobre a pré-matrícula de ${selected.aluno_nome}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#22c55e] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp — {selected.resp_nome.split(' ')[0]}
                </a>

                {/* Navegação de etapas */}
                <div className="flex gap-2">
                  {prev && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5"
                      disabled={saving}
                      onClick={() => moverEtapa(selected.id, prev, nota || undefined)}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      {ETAPAS.find(e => e.status === prev)?.label}
                    </Button>
                  )}
                  {prox && (
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5"
                      disabled={saving}
                      onClick={() => moverEtapa(selected.id, prox, nota || undefined)}
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      {ETAPAS.find(e => e.status === prox)?.label}
                    </Button>
                  )}
                </div>

                {/* Rejeitar / Reativar */}
                {selected.status !== 'rejeitada' ? (
                  <button
                    onClick={() => moverEtapa(selected.id, 'rejeitada', nota || undefined)}
                    disabled={saving}
                    className="w-full text-xs font-semibold text-slate-400 hover:text-red-500 py-2 transition-colors"
                  >
                    Cancelar esta matrícula
                  </button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => moverEtapa(selected.id, 'nova', nota || undefined)}
                  >
                    Reativar como nova solicitação
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm text-slate-700 font-semibold mt-0.5">{value}</p>
    </div>
  )
}
