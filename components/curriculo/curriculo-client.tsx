'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { ChevronLeft, ChevronRight, Save, Send, CheckCircle, Loader2, BookMarked } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Turma { id: string; nome: string }

interface DiaData {
  objetivo: string
  atividades: string
  materiais: string
}

interface Planejamento {
  id: string
  status: 'rascunho' | 'enviado' | 'aprovado'
  usuario_id: string | null
  dias: Record<number, DiaData>
}

interface Props {
  turmas: Turma[]
  escolaId: string
  userId: string
  userRole: string
}

const DIAS_NOMES = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']

function getMondayOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function toISO(d: Date): string {
  return d.toISOString().split('T')[0]
}

function formatRange(monday: Date): string {
  const friday = addDays(monday, 4)
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }
  return `${monday.toLocaleDateString('pt-BR', opts)} – ${friday.toLocaleDateString('pt-BR', opts)}`
}

const EMPTY_DIA: DiaData = { objetivo: '', atividades: '', materiais: '' }

const STATUS_CONFIG = {
  rascunho: { label: 'Rascunho',  color: 'bg-slate-100 text-slate-600' },
  enviado:  { label: 'Aguardando aprovação', color: 'bg-amber-100 text-amber-700' },
  aprovado: { label: 'Aprovado',  color: 'bg-emerald-100 text-emerald-700' },
}

export function CurriculoClient({ turmas, escolaId, userId, userRole }: Props) {
  const router   = useRouter()
  const supabase = createClient()

  const [turmaId,   setTurmaId]   = useState<string>(turmas[0]?.id ?? '')
  const [semana,    setSemana]     = useState<Date>(() => getMondayOfWeek(new Date()))
  const [plan,      setPlan]       = useState<Planejamento | null>(null)
  const [diasEdit,  setDiasEdit]   = useState<Record<number, DiaData>>({})
  const [loading,   setLoading]    = useState(false)
  const [saving,    setSaving]     = useState(false)
  const [saved,     setSaved]      = useState(false)
  const [, startTransition] = useTransition()

  const fetchPlan = useCallback(async () => {
    if (!turmaId) return
    setLoading(true)
    const semanaISO = toISO(semana)

    const { data: planRow } = await (supabase as any)
      .from('planejamentos_semanais')
      .select('id, status, usuario_id')
      .eq('escola_id', escolaId)
      .eq('turma_id', turmaId)
      .eq('semana_inicio', semanaISO)
      .maybeSingle()

    if (!planRow) {
      setPlan(null)
      setDiasEdit({ 1: {...EMPTY_DIA}, 2: {...EMPTY_DIA}, 3: {...EMPTY_DIA}, 4: {...EMPTY_DIA}, 5: {...EMPTY_DIA} })
      setLoading(false)
      return
    }

    const { data: diasRows } = await (supabase as any)
      .from('planejamento_dias')
      .select('dia_semana, objetivo, atividades, materiais')
      .eq('planejamento_id', planRow.id)

    const diasMap: Record<number, DiaData> = { 1: {...EMPTY_DIA}, 2: {...EMPTY_DIA}, 3: {...EMPTY_DIA}, 4: {...EMPTY_DIA}, 5: {...EMPTY_DIA} }
    for (const d of (diasRows ?? [])) {
      diasMap[d.dia_semana] = { objetivo: d.objetivo ?? '', atividades: d.atividades ?? '', materiais: d.materiais ?? '' }
    }

    setPlan({ id: planRow.id, status: planRow.status, usuario_id: planRow.usuario_id, dias: diasMap })
    setDiasEdit(diasMap)
    setLoading(false)
  }, [turmaId, semana, escolaId, supabase])

  useEffect(() => { fetchPlan() }, [fetchPlan])

  async function save(newStatus?: 'enviado' | 'aprovado') {
    setSaving(true)
    const semanaISO = toISO(semana)

    let planId = plan?.id
    const status = newStatus ?? plan?.status ?? 'rascunho'

    if (!planId) {
      const { data: created } = await (supabase as any)
        .from('planejamentos_semanais')
        .insert({ escola_id: escolaId, turma_id: turmaId, usuario_id: userId, semana_inicio: semanaISO, status })
        .select('id')
        .single()
      planId = created?.id
    } else if (newStatus) {
      await (supabase as any)
        .from('planejamentos_semanais')
        .update({ status: newStatus })
        .eq('id', planId)
    }

    if (!planId) { setSaving(false); return }

    const rows = [1,2,3,4,5].map(d => ({
      planejamento_id: planId,
      dia_semana: d,
      objetivo:   diasEdit[d]?.objetivo   ?? '',
      atividades: diasEdit[d]?.atividades ?? '',
      materiais:  diasEdit[d]?.materiais  ?? '',
    }))

    await (supabase as any)
      .from('planejamento_dias')
      .upsert(rows, { onConflict: 'planejamento_id,dia_semana' })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    startTransition(() => { router.refresh() })
    await fetchPlan()
  }

  function updateDia(dia: number, field: keyof DiaData, value: string) {
    setDiasEdit(prev => ({ ...prev, [dia]: { ...prev[dia], [field]: value } }))
  }

  const canEdit = !plan || plan.status === 'rascunho' || plan.status === 'enviado'
  const canApprove = userRole === 'diretora' || userRole === 'super_admin'
  const isApproved = plan?.status === 'aprovado'

  if (turmas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <BookMarked className="w-12 h-12 mb-3 opacity-40" />
        <p className="font-semibold">Nenhuma turma cadastrada.</p>
        <p className="text-sm mt-1">Crie turmas primeiro em <span className="text-primary font-bold">Turmas</span>.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Currículo Semanal</h1>
        <p className="text-slate-500 text-sm mt-1">Planejamento pedagógico por turma e semana.</p>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Turma */}
        <div className="flex gap-1.5 flex-wrap">
          {turmas.map(t => (
            <button
              key={t.id}
              onClick={() => setTurmaId(t.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-sm font-bold transition-all border',
                turmaId === t.id
                  ? 'bg-primary text-white border-primary shadow-soft'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary/50'
              )}
            >
              {t.nome}
            </button>
          ))}
        </div>

        {/* Semana */}
        <div className="ml-auto flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-1 py-1 shadow-soft">
          <button
            onClick={() => setSemana(prev => addDays(prev, -7))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-blue-50 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-700 min-w-[180px] text-center">
            {formatRange(semana)}
          </span>
          <button
            onClick={() => setSemana(prev => addDays(prev, 7))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-blue-50 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status badge + botões */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className={cn(
          'text-xs font-bold px-3 py-1.5 rounded-full',
          STATUS_CONFIG[plan?.status ?? 'rascunho'].color
        )}>
          {STATUS_CONFIG[plan?.status ?? 'rascunho'].label}
        </span>

        <div className="flex gap-2">
          {!isApproved && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => save()}
                disabled={saving}
                className="gap-2"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Save className="w-3.5 h-3.5" />}
                {saved ? 'Salvo!' : 'Salvar rascunho'}
              </Button>

              {(userRole === 'professora') && plan?.status !== 'enviado' && (
                <Button size="sm" onClick={() => save('enviado')} disabled={saving} className="gap-2">
                  <Send className="w-3.5 h-3.5" />
                  Enviar para aprovação
                </Button>
              )}

              {canApprove && plan && plan.status === 'enviado' && (
                <Button size="sm" onClick={() => save('aprovado')} disabled={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Aprovar planejamento
                </Button>
              )}
            </>
          )}

          {isApproved && canApprove && (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                if (!plan) return
                setSaving(true)
                await (supabase as any).from('planejamentos_semanais').update({ status: 'rascunho' }).eq('id', plan.id)
                setSaving(false)
                await fetchPlan()
              }}
              disabled={saving}
            >
              Reabrir para edição
            </Button>
          )}
        </div>
      </div>

      {/* Grade de dias */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="bg-slate-100 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(dia => {
            const data = diasEdit[dia] ?? EMPTY_DIA
            const diaDt = addDays(semana, dia - 1)
            const diaDtStr = diaDt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            return (
              <div key={dia} className={cn(
                'bg-white rounded-2xl border p-4 flex flex-col gap-3 shadow-soft',
                isApproved ? 'border-emerald-100' : 'border-slate-100'
              )}>
                <div className="flex items-center justify-between">
                  <p className="font-black text-slate-800 text-sm">{DIAS_NOMES[dia - 1]}</p>
                  <span className="text-xs text-slate-400">{diaDtStr}</span>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objetivo</label>
                    <textarea
                      value={data.objetivo}
                      onChange={e => updateDia(dia, 'objetivo', e.target.value)}
                      disabled={isApproved && !canApprove}
                      placeholder="Objetivo pedagógico do dia..."
                      className="w-full mt-1 text-sm text-slate-700 bg-slate-50 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 border border-slate-100 h-20 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atividades</label>
                    <textarea
                      value={data.atividades}
                      onChange={e => updateDia(dia, 'atividades', e.target.value)}
                      disabled={isApproved && !canApprove}
                      placeholder="Descreva as atividades..."
                      className="w-full mt-1 text-sm text-slate-700 bg-slate-50 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 border border-slate-100 h-24 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Materiais</label>
                    <textarea
                      value={data.materiais}
                      onChange={e => updateDia(dia, 'materiais', e.target.value)}
                      disabled={isApproved && !canApprove}
                      placeholder="Cola, tesoura, tinta..."
                      className="w-full mt-1 text-sm text-slate-700 bg-slate-50 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 border border-slate-100 h-16 disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
