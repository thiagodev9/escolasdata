'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, UserX, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface Ausencia {
  id: string
  colaborador_id: string
  colaborador_nome: string
  data: string
  motivo: string | null
  substituido_por_nome: string | null
  criado_em: string
}

export interface ColaboradorOption {
  id: string
  nome: string
  cargo: string
}

interface Props {
  ausencias: Ausencia[]
  colaboradores: ColaboradorOption[]
  escolaId: string
}

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function formatData(d: string) {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

export function AusenciasClient({ ausencias: initialAusencias, colaboradores, escolaId }: Props) {
  const router   = useRouter()
  const supabase = createClient()
  const [, startTransition] = useTransition()

  const today = new Date()
  const [mes,   setMes]   = useState(today.getMonth())     // 0-indexed
  const [ano,   setAno]   = useState(today.getFullYear())
  const [modal, setModal] = useState(false)

  const [ausencias,  setAusencias]  = useState<Ausencia[]>(initialAusencias)
  const [saving,     setSaving]     = useState(false)
  const [deleting,   setDeleting]   = useState<string | null>(null)

  const [form, setForm] = useState({
    colaborador_id: '',
    data: today.toISOString().split('T')[0],
    motivo: '',
    substituido_por_nome: '',
  })

  const filtradas = ausencias.filter(a => {
    const [y, m] = a.data.split('-').map(Number)
    return y === ano && m - 1 === mes
  })

  function prevMes() {
    if (mes === 0) { setMes(11); setAno(a => a - 1) }
    else setMes(m => m - 1)
  }
  function nextMes() {
    if (mes === 11) { setMes(0); setAno(a => a + 1) }
    else setMes(m => m + 1)
  }

  async function registrar() {
    if (!form.colaborador_id || !form.data) return
    setSaving(true)

    const { data } = await (supabase as any)
      .from('ausencias_professores')
      .insert({
        escola_id: escolaId,
        colaborador_id: form.colaborador_id,
        data: form.data,
        motivo: form.motivo.trim() || null,
        substituido_por_nome: form.substituido_por_nome.trim() || null,
      })
      .select('id, colaborador_id, data, motivo, substituido_por_nome, criado_em')
      .single()

    if (data) {
      const colab = colaboradores.find(c => c.id === form.colaborador_id)
      setAusencias(prev => [{ ...data, colaborador_nome: colab?.nome ?? '' }, ...prev])
    }
    setForm({ colaborador_id: '', data: today.toISOString().split('T')[0], motivo: '', substituido_por_nome: '' })
    setModal(false)
    setSaving(false)
    startTransition(() => router.refresh())
  }

  async function deletar(id: string) {
    if (!confirm('Excluir este registro de ausência?')) return
    setDeleting(id)
    await (supabase as any).from('ausencias_professores').delete().eq('id', id)
    setAusencias(prev => prev.filter(a => a.id !== id))
    setDeleting(null)
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Ausências</h1>
          <p className="text-slate-500 text-sm mt-1">Registro de faltas e substituições da equipe.</p>
        </div>
        <Button onClick={() => setModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Registrar ausência
        </Button>
      </div>

      {/* Navegador de mês */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-1 py-1 shadow-soft w-fit">
        <button
          onClick={prevMes}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-blue-50 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-slate-700 min-w-[140px] text-center">
          {MESES[mes]} {ano}
        </span>
        <button
          onClick={nextMes}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-blue-50 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Resumo do mês */}
      {filtradas.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
            {MESES[mes]} — {filtradas.length} ausência{filtradas.length > 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(
              filtradas.reduce((acc: Record<string, number>, a) => {
                acc[a.colaborador_nome] = (acc[a.colaborador_nome] ?? 0) + 1
                return acc
              }, {})
            ).map(([nome, qtd]) => (
              <span key={nome} className="bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                {nome}: {qtd} falta{qtd > 1 ? 's' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <UserX className="w-12 h-12 mb-3 opacity-40" />
          <p className="font-semibold">Nenhuma ausência em {MESES[mes]}.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtradas
            .sort((a, b) => b.data.localeCompare(a.data))
            .map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4 flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <UserX className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-slate-800">{a.colaborador_nome}</p>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {formatData(a.data)}
                    </span>
                  </div>
                  {a.motivo && <p className="text-sm text-slate-600 mt-0.5">Motivo: {a.motivo}</p>}
                  {a.substituido_por_nome && (
                    <p className="text-xs text-emerald-600 mt-0.5 font-semibold">
                      Substituta: {a.substituido_por_nome}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deletar(a.id)}
                  disabled={deleting === a.id}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                >
                  {deleting === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
          ))}
        </div>
      )}

      {/* Modal registrar */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl shadow-float max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-slate-800">Registrar ausência</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Colaboradora</Label>
                <select
                  value={form.colaborador_id}
                  onChange={e => setForm(p => ({ ...p, colaborador_id: e.target.value }))}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Selecione...</option>
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} — {c.cargo}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Data da ausência</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={form.data}
                  onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                />
              </div>

              <div>
                <Label>Motivo <span className="text-slate-400 font-normal">(opcional)</span></Label>
                <Input
                  className="mt-1"
                  placeholder="Atestado, pessoal, imprevisto..."
                  value={form.motivo}
                  onChange={e => setForm(p => ({ ...p, motivo: e.target.value }))}
                />
              </div>

              <div>
                <Label>Substituta <span className="text-slate-400 font-normal">(opcional)</span></Label>
                <Input
                  className="mt-1"
                  placeholder="Nome de quem cobriu a turma"
                  value={form.substituido_por_nome}
                  onChange={e => setForm(p => ({ ...p, substituido_por_nome: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Cancelar</Button>
              <Button
                className="flex-1 gap-2"
                onClick={registrar}
                disabled={saving || !form.colaborador_id || !form.data}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                Registrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
