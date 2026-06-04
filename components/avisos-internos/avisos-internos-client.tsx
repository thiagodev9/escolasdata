'use client'

import { useState, useTransition } from 'react'
import { Plus, BellRing, AlertCircle, CheckCircle2, Trash2, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface AvisoInterno {
  id: string
  titulo: string
  conteudo: string
  prioridade: 'normal' | 'urgente'
  criado_em: string
  lido: boolean
  criado_por_nome?: string
}

interface Props {
  avisos: AvisoInterno[]
  escolaId: string
  userId: string
  userRole: string
}

export function AvisosInternosClient({ avisos: initialAvisos, escolaId, userId, userRole }: Props) {
  const router   = useRouter()
  const supabase = createClient()
  const [, startTransition] = useTransition()

  const [avisos,   setAvisos]   = useState<AvisoInterno[]>(initialAvisos)
  const [modal,    setModal]    = useState(false)
  const [selected, setSelected] = useState<AvisoInterno | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [form, setForm] = useState({ titulo: '', conteudo: '', prioridade: 'normal' as 'normal' | 'urgente' })

  const isDiretora = userRole === 'diretora' || userRole === 'super_admin'
  const naoLidos   = avisos.filter(a => !a.lido).length

  async function criar() {
    if (!form.titulo.trim() || !form.conteudo.trim()) return
    setSaving(true)

    const { data } = await (supabase as any)
      .from('avisos_internos')
      .insert({ escola_id: escolaId, titulo: form.titulo.trim(), conteudo: form.conteudo.trim(), prioridade: form.prioridade, criado_por: userId })
      .select('id, titulo, conteudo, prioridade, criado_em')
      .single()

    if (data) {
      setAvisos(prev => [{ ...data, lido: true, criado_por_nome: 'Você' }, ...prev])
    }
    setForm({ titulo: '', conteudo: '', prioridade: 'normal' })
    setModal(false)
    setSaving(false)
    startTransition(() => router.refresh())
  }

  async function deletar(id: string) {
    if (!confirm('Excluir este aviso?')) return
    setDeleting(id)
    await (supabase as any).from('avisos_internos').delete().eq('id', id)
    setAvisos(prev => prev.filter(a => a.id !== id))
    setDeleting(null)
    startTransition(() => router.refresh())
  }

  async function marcarLido(aviso: AvisoInterno) {
    setSelected(aviso)
    if (!aviso.lido) {
      await (supabase as any)
        .from('avisos_lidos')
        .upsert({ aviso_id: aviso.id, usuario_id: userId }, { onConflict: 'aviso_id,usuario_id' })
      setAvisos(prev => prev.map(a => a.id === aviso.id ? { ...a, lido: true } : a))
    }
  }

  function formatData(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Avisos Internos</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isDiretora ? 'Comunicados para a equipe pedagógica.' : 'Comunicados da diretoria para você.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {naoLidos > 0 && (
            <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
              {naoLidos} não lido{naoLidos > 1 ? 's' : ''}
            </span>
          )}
          {isDiretora && (
            <Button onClick={() => setModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo aviso
            </Button>
          )}
        </div>
      </div>

      {/* Lista */}
      {avisos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <BellRing className="w-12 h-12 mb-3 opacity-40" />
          <p className="font-semibold">Nenhum aviso publicado.</p>
          {isDiretora && <p className="text-sm mt-1">Clique em "Novo aviso" para criar o primeiro.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {avisos.map(aviso => (
            <div
              key={aviso.id}
              onClick={() => marcarLido(aviso)}
              className={cn(
                'bg-white rounded-2xl border p-5 cursor-pointer hover:border-primary/30 transition-all shadow-soft group relative',
                !aviso.lido ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100',
                aviso.prioridade === 'urgente' && !aviso.lido ? 'border-red-200 bg-red-50/20' : ''
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                  aviso.prioridade === 'urgente' ? 'bg-red-100' : 'bg-blue-100'
                )}>
                  {aviso.prioridade === 'urgente'
                    ? <AlertCircle className="w-4 h-4 text-red-500" />
                    : <BellRing className="w-4 h-4 text-blue-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-black text-slate-800">{aviso.titulo}</p>
                    {aviso.prioridade === 'urgente' && (
                      <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Urgente</span>
                    )}
                    {!aviso.lido && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{aviso.conteudo}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {aviso.criado_por_nome && <span>{aviso.criado_por_nome} · </span>}
                    {formatData(aviso.criado_em)}
                  </p>
                </div>
                {aviso.lido && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                )}
                {isDiretora && (
                  <button
                    onClick={e => { e.stopPropagation(); deletar(aviso.id) }}
                    disabled={deleting === aviso.id}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                  >
                    {deleting === aviso.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal detalhe */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-float max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center',
                  selected.prioridade === 'urgente' ? 'bg-red-100' : 'bg-blue-100'
                )}>
                  {selected.prioridade === 'urgente'
                    ? <AlertCircle className="w-4 h-4 text-red-500" />
                    : <BellRing className="w-4 h-4 text-blue-500" />
                  }
                </div>
                <div>
                  <p className="font-black text-slate-800">{selected.titulo}</p>
                  {selected.prioridade === 'urgente' && (
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">Urgente</span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selected.conteudo}</p>
            <p className="text-xs text-slate-400 mt-4">
              {selected.criado_por_nome && <span>{selected.criado_por_nome} · </span>}
              {formatData(selected.criado_em)}
            </p>
          </div>
        </div>
      )}

      {/* Modal criar aviso */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl shadow-float max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-slate-800">Novo aviso interno</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  className="mt-1"
                  placeholder="Ex: Reunião de planejamento — Sexta 14h"
                  value={form.titulo}
                  onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                />
              </div>

              <div>
                <Label>Mensagem</Label>
                <textarea
                  className="w-full mt-1 text-sm text-slate-700 bg-slate-50 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 border border-slate-200 h-28"
                  placeholder="Detalhes do comunicado..."
                  value={form.conteudo}
                  onChange={e => setForm(p => ({ ...p, conteudo: e.target.value }))}
                />
              </div>

              <div>
                <Label>Prioridade</Label>
                <div className="flex gap-2 mt-1">
                  {(['normal','urgente'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setForm(prev => ({ ...prev, prioridade: p }))}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-bold border transition-all',
                        form.prioridade === p
                          ? p === 'urgente' ? 'bg-red-100 border-red-300 text-red-700' : 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      )}
                    >
                      {p === 'urgente' ? '🔴 Urgente' : '🔵 Normal'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Cancelar</Button>
              <Button
                className="flex-1 gap-2"
                onClick={criar}
                disabled={saving || !form.titulo.trim() || !form.conteudo.trim()}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
                Publicar aviso
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
