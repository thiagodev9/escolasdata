'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2, CalendarX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Aluno { id: string; nome: string; foto_url: string | null }
interface AvisoExistente { aluno_id: string; data: string; motivo: string | null }

interface Props {
  alunos: Aluno[]
  responsavelId: string
  escolaId: string
  avisosExistentes: AvisoExistente[]
}

function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}

function toISO(d: Date) { return d.toISOString().split('T')[0] }

function formatData(iso: string) {
  return new Date(iso + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}

export function AvisarFaltaClient({ alunos, responsavelId, escolaId, avisosExistentes }: Props) {
  const router   = useRouter()
  const supabase = createClient()
  const [, startTransition] = useTransition()

  const hoje   = new Date()
  const amanha = addDays(hoje, 1)

  const [alunoId, setAlunoId] = useState(alunos[0]?.id ?? '')
  const [data,    setData]    = useState(toISO(amanha))
  const [motivo,  setMotivo]  = useState('')
  const [saving,  setSaving]  = useState(false)
  const [ok,      setOk]      = useState(false)
  const [avisos,  setAvisos]  = useState<AvisoExistente[]>(avisosExistentes)

  const jaAvisado = avisos.find(a => a.aluno_id === alunoId && a.data === data)
  const alunoSel  = alunos.find(a => a.id === alunoId)

  async function enviar() {
    if (!alunoId || !data) return
    setSaving(true)

    await (supabase as any)
      .from('avisos_falta')
      .upsert({
        escola_id: escolaId,
        aluno_id: alunoId,
        responsavel_id: responsavelId,
        data,
        motivo: motivo.trim() || null,
      }, { onConflict: 'aluno_id,data' })

    setAvisos(prev => {
      const filtered = prev.filter(a => !(a.aluno_id === alunoId && a.data === data))
      return [...filtered, { aluno_id: alunoId, data, motivo: motivo.trim() || null }]
    })
    setOk(true)
    setMotivo('')
    setTimeout(() => setOk(false), 3000)
    setSaving(false)
    startTransition(() => router.refresh())
  }

  if (alunos.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <CalendarX className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="font-semibold">Nenhum aluno vinculado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        Avise a escola com antecedência sobre a ausência do seu filho. Isso ajuda a professora a se organizar.
      </p>

      {/* Selecionar filho */}
      <div className="space-y-2">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Filho(a)</p>
        <div className="flex flex-wrap gap-2">
          {alunos.map(a => (
            <button
              key={a.id}
              onClick={() => setAlunoId(a.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold transition-all',
                alunoId === a.id ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 text-slate-700'
              )}
            >
              {a.foto_url
                ? <img src={a.foto_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                : <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-black">{a.nome[0]}</div>
              }
              {a.nome.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Data */}
      <div className="space-y-2">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Data da ausência</p>
        <div className="flex gap-2 flex-wrap">
          {[0,1,2,3,4].map(offset => {
            const d = addDays(hoje, offset)
            const iso = toISO(d)
            if (d.getDay() === 0 || d.getDay() === 6) return null
            return (
              <button
                key={iso}
                onClick={() => setData(iso)}
                className={cn(
                  'px-3 py-2 rounded-xl border text-sm font-bold transition-all',
                  data === iso ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 text-slate-700'
                )}
              >
                {offset === 0 ? 'Hoje' : offset === 1 ? 'Amanhã' : formatData(iso)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Motivo */}
      <div className="space-y-2">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Motivo <span className="text-slate-300 font-normal normal-case">(opcional)</span></p>
        <textarea
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          placeholder="Ex: Consulta médica, indisposição..."
          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 h-20"
        />
      </div>

      {/* Status aviso existente */}
      {jaAvisado && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-sm text-emerald-700 font-semibold">
            Falta já avisada para {formatData(data)}.
            {jaAvisado.motivo ? ` Motivo: "${jaAvisado.motivo}"` : ''}
          </p>
        </div>
      )}

      <Button
        className="w-full gap-2"
        onClick={enviar}
        disabled={saving || !alunoId || !data}
      >
        {saving
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : ok
          ? <CheckCircle2 className="w-4 h-4" />
          : <CalendarX className="w-4 h-4" />
        }
        {ok ? 'Aviso enviado!' : jaAvisado ? 'Atualizar aviso' : 'Enviar aviso de falta'}
      </Button>

      {/* Histórico de avisos */}
      {avisos.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Avisos enviados</p>
          <div className="space-y-2">
            {[...avisos].sort((a, b) => b.data.localeCompare(a.data)).map(av => (
              <div key={`${av.aluno_id}-${av.data}`} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    {alunos.find(a => a.id === av.aluno_id)?.nome.split(' ')[0]} — {formatData(av.data)}
                  </p>
                  {av.motivo && <p className="text-xs text-slate-500">{av.motivo}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
