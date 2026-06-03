'use client'

import { useState, useTransition } from 'react'
import {
  ChevronLeft, ChevronRight, Pencil, Loader2, CheckCircle2,
  AlertTriangle, UtensilsCrossed, Coffee, Soup, Cookie,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface CardapioItem {
  id: string
  escola_id: string
  semana_inicio: string
  dia_semana: number   // 1=seg … 5=sex
  refeicao: string
  descricao: string
}

interface Props {
  items: CardapioItem[]
  escolaId: string
}

const DIAS = ['Segunda','Terça','Quarta','Quinta','Sexta']
const REFEICOES = [
  { value: 'cafe_manha',   label: 'Café da manhã',  Icon: Coffee,   color: 'bg-amber-50  border-amber-200  text-amber-800' },
  { value: 'almoco',       label: 'Almoço',         Icon: Soup,     color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  { value: 'lanche_tarde', label: 'Lanche da tarde', Icon: Cookie,  color: 'bg-pink-50   border-pink-200    text-pink-800' },
]

function getMondayOf(d: Date): Date {
  const day = d.getDay() || 7
  const mon = new Date(d)
  mon.setDate(d.getDate() - day + 1)
  mon.setHours(0, 0, 0, 0)
  return mon
}

function fmtSemana(inicio: string) {
  const [y, m, d] = inicio.split('-').map(Number)
  const fim = new Date(y, m-1, d+4)
  const i   = new Date(y, m-1, d)
  return `${d.toString().padStart(2,'0')}/${m.toString().padStart(2,'0')} – ${String(fim.getDate()).padStart(2,'0')}/${String(fim.getMonth()+1).padStart(2,'0')}/${y}`
}

export function CardapioClient({ items: itemsIniciais, escolaId }: Props) {
  const router  = useRouter()
  const supabase = createClient()
  const [, start] = useTransition()

  const hoje = new Date()
  const [semana, setSemana] = useState(() => getMondayOf(hoje))
  const [items, setItems]   = useState(itemsIniciais)
  const [editando, setEditando] = useState<{ dia: number; refeicao: string } | null>(null)
  const [texto, setTexto]   = useState('')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso]   = useState<string | null>(null)
  const [erro, setErro]         = useState('')

  const semanaStr = semana.toISOString().slice(0, 10)

  function navSemana(delta: number) {
    setSemana(s => {
      const n = new Date(s)
      n.setDate(n.getDate() + delta * 7)
      return n
    })
  }

  function getItem(dia: number, refeicao: string) {
    return items.find(i => i.semana_inicio === semanaStr && i.dia_semana === dia && i.refeicao === refeicao)
  }

  function abrirEdicao(dia: number, refeicao: string) {
    const item = getItem(dia, refeicao)
    setTexto(item?.descricao ?? '')
    setEditando({ dia, refeicao })
    setErro('')
  }

  async function salvar() {
    if (!editando) return
    setSalvando(true); setErro('')
    try {
      const existing = getItem(editando.dia, editando.refeicao)
      const payload = {
        escola_id:     escolaId,
        semana_inicio: semanaStr,
        dia_semana:    editando.dia,
        refeicao:      editando.refeicao,
        descricao:     texto.trim(),
      }

      if (texto.trim() === '') {
        // Apagar
        if (existing) {
          await (supabase as any).from('cardapio').delete().eq('id', existing.id)
          setItems(prev => prev.filter(i => i.id !== existing.id))
        }
      } else if (existing) {
        await (supabase as any).from('cardapio').update({ descricao: texto.trim() }).eq('id', existing.id)
        setItems(prev => prev.map(i => i.id === existing.id ? { ...i, descricao: texto.trim() } : i))
      } else {
        const { data, error } = await (supabase as any).from('cardapio').insert(payload).select().single()
        if (error) throw error
        setItems(prev => [...prev, data as CardapioItem])
      }

      setSucesso(`${DIAS[editando.dia - 1]} — ${REFEICOES.find(r => r.value === editando.refeicao)?.label}`)
      setTimeout(() => setSucesso(null), 2500)
      setEditando(null)
      start(() => router.refresh())
    } catch (e: any) { setErro(e.message) }
    finally { setSalvando(false) }
  }

  // Copiar semana anterior
  async function copiarSemanaAnterior() {
    if (!confirm('Copiar cardápio da semana anterior para esta semana? Itens existentes serão substituídos.')) return
    const ant = new Date(semana); ant.setDate(ant.getDate() - 7)
    const antStr = ant.toISOString().slice(0, 10)
    const itensAnt = items.filter(i => i.semana_inicio === antStr)
    if (itensAnt.length === 0) { setErro('Semana anterior não possui cardápio cadastrado.'); return }

    setSalvando(true)
    try {
      // Remove itens atuais desta semana
      await (supabase as any).from('cardapio').delete().eq('escola_id', escolaId).eq('semana_inicio', semanaStr)

      // Insere cópia
      const novos = itensAnt.map(({ dia_semana, refeicao, descricao }) => ({
        escola_id: escolaId, semana_inicio: semanaStr, dia_semana, refeicao, descricao,
      }))
      const { data, error } = await (supabase as any).from('cardapio').insert(novos).select()
      if (error) throw error
      setItems(prev => [
        ...prev.filter(i => i.semana_inicio !== semanaStr),
        ...(data as CardapioItem[]),
      ])
      setSucesso('Semana copiada com sucesso!')
      setTimeout(() => setSucesso(null), 3000)
    } catch (e: any) { setErro(e.message) }
    finally { setSalvando(false) }
  }

  const isSemanaAtual = semanaStr === getMondayOf(hoje).toISOString().slice(0, 10)

  return (
    <div>
      {/* Nav semana */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navSemana(-1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center min-w-[200px]">
            <p className={cn('text-base font-black', isSemanaAtual ? 'text-primary' : 'text-slate-800')}>
              {isSemanaAtual ? '📅 Semana atual' : 'Semana'}
            </p>
            <p className="text-xs text-slate-400">{fmtSemana(semanaStr)}</p>
          </div>
          <button onClick={() => navSemana(1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          {!isSemanaAtual && (
            <Button variant="outline" size="sm" onClick={() => setSemana(getMondayOf(hoje))}>
              Ir para hoje
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={copiarSemanaAnterior} disabled={salvando}>
            Copiar semana anterior
          </Button>
        </div>
      </div>

      {/* Feedback global */}
      {sucesso && (
        <div className="mb-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {sucesso}
        </div>
      )}
      {erro && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {erro}
        </div>
      )}

      {/* Grid cardápio */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header dias */}
          <div className="grid grid-cols-6 gap-2 mb-2">
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider px-2 flex items-center">
              <UtensilsCrossed className="w-3.5 h-3.5 mr-1" /> Refeição
            </div>
            {DIAS.map(d => (
              <div key={d} className="text-xs font-black text-slate-600 text-center py-2 bg-slate-100 rounded-xl uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Linhas por refeição */}
          {REFEICOES.map(ref => (
            <div key={ref.value} className="grid grid-cols-6 gap-2 mb-2">
              {/* Label refeição */}
              <div className={cn('flex items-center gap-2 px-3 py-3 rounded-xl border text-xs font-bold', ref.color)}>
                <ref.Icon className="w-4 h-4 shrink-0" />
                <span>{ref.label}</span>
              </div>

              {/* Células por dia */}
              {[1,2,3,4,5].map(dia => {
                const item = getItem(dia, ref.value)
                const isEdit = editando?.dia === dia && editando?.refeicao === ref.value

                return (
                  <div key={dia}
                    className={cn(
                      'rounded-xl border p-2 min-h-[80px] transition-all',
                      isEdit ? 'border-primary bg-blue-50 shadow-soft' : 'border-slate-100 bg-white hover:border-slate-200'
                    )}
                  >
                    {isEdit ? (
                      <div className="flex flex-col h-full gap-1">
                        <textarea
                          autoFocus
                          value={texto}
                          onChange={e => setTexto(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) salvar() }}
                          className="flex-1 w-full text-xs resize-none bg-transparent outline-none text-slate-700 placeholder:text-slate-400 min-h-[44px]"
                          placeholder="Descreva o cardápio..."
                        />
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => setEditando(null)} className="text-xs text-slate-400 hover:text-slate-700 px-2 py-0.5">
                            ✕
                          </button>
                          <button onClick={salvar} disabled={salvando}
                            className="text-xs font-bold bg-primary text-white px-2.5 py-1 rounded-lg flex items-center gap-1">
                            {salvando ? <Loader2 className="w-3 h-3 animate-spin" /> : '✓'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="w-full h-full text-left group"
                        onClick={() => abrirEdicao(dia, ref.value)}
                      >
                        {item ? (
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-xs text-slate-700 leading-relaxed">{item.descricao}</p>
                            <Pencil className="w-3 h-3 text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5" />
                          </div>
                        ) : (
                          <p className="text-xs text-slate-300 group-hover:text-slate-400 italic">
                            + Adicionar
                          </p>
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-4">Clique em qualquer célula para editar. Ctrl+Enter para salvar rapidamente.</p>
    </div>
  )
}
