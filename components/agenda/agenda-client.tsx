'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Clock, MapPin, Users, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Evento {
  id: string; titulo: string; descricao?: string
  data: string; hora?: string; local?: string
  turma?: string; tipo: string
}
interface Turma { id: string; nome: string }
interface Props { eventos: Evento[]; turmas: Turma[]; escolaId: string }

const TIPO_CFG: Record<string, { label: string; cls: string }> = {
  reuniao:   { label: 'Reunião',   cls: 'bg-blue-100   text-blue-700   border-blue-200'   },
  evento:    { label: 'Evento',    cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  avaliacao: { label: 'Avaliação', cls: 'bg-amber-100  text-amber-700  border-amber-200'  },
  passeio:   { label: 'Passeio',   cls: 'bg-green-100  text-green-700  border-green-200'  },
  geral:     { label: 'Geral',     cls: 'bg-gray-100   text-gray-600   border-gray-200'   },
}
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

const FORM_VAZIO = {
  titulo: '', descricao: '', data: '', hora: '', local: '', turma: '', tipo: 'geral',
}

export function AgendaClient({ eventos, turmas, escolaId }: Props) {
  const hoje = new Date()
  const [mes,  setMes]  = useState(hoje.getMonth())
  const [ano,  setAno]  = useState(hoje.getFullYear())
  const [show, setShow] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [, startTransition] = useTransition()
  const router = useRouter()
  const sb = createClient() as any

  function campo(k: keyof typeof FORM_VAZIO, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function navMes(dir: number) {
    setMes(m => {
      const nm = m + dir
      if (nm < 0)  { setAno(a => a - 1); return 11 }
      if (nm > 11) { setAno(a => a + 1); return 0  }
      return nm
    })
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo || !form.data) { setErro('Título e data são obrigatórios.'); return }
    setSalvando(true); setErro('')
    try {
      const { error } = await sb.from('eventos').insert({
        titulo:    form.titulo,
        descricao: form.descricao || null,
        data:      form.data,
        hora:      form.hora     || null,
        local:     form.local    || null,
        turma:     form.turma    || null,
        tipo:      form.tipo,
        escola_id: escolaId,
      })
      if (error) throw error
      setShow(false)
      setForm(FORM_VAZIO)
      startTransition(() => router.refresh())
    } catch (err: any) {
      setErro(err.message ?? 'Erro ao salvar. Verifique se a tabela eventos existe no banco.')
    } finally {
      setSalvando(false)
    }
  }

  // Dias do mês
  const primeiroDia = new Date(ano, mes, 1).getDay()
  const totalDias   = new Date(ano, mes + 1, 0).getDate()

  function eventosNoDia(dia: number) {
    const data = `${ano}-${String(mes + 1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
    return eventos.filter(e => e.data === data)
  }

  // Próximos eventos (futuros ordenados)
  const proximos = [...eventos]
    .filter(e => new Date(e.data + 'T12:00') >= new Date(hoje.toDateString()))
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 5)

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground mt-1">Eventos, reuniões e comunicados da escola.</p>
        </div>
        <Button onClick={() => { setShow(true); setForm(FORM_VAZIO); setErro('') }} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Evento
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">{MESES[mes]} {ano}</h2>
            <div className="flex gap-1">
              <button onClick={() => navMes(-1)} aria-label="Mês anterior" className="w-8 h-8 rounded flex items-center justify-center hover:bg-muted transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => navMes(1)} aria-label="Próximo mês" className="w-8 h-8 rounded flex items-center justify-center hover:bg-muted transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
            ))}
            {Array.from({ length: primeiroDia }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: totalDias }, (_, i) => i + 1).map(dia => {
              const evs    = eventosNoDia(dia)
              const isHoje = dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()
              return (
                <button key={dia} onClick={() => {
                  if (evs.length === 0) {
                    const d = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
                    setForm(f => ({ ...f, data: d }))
                    setShow(true)
                  }
                }}
                  className={`relative aspect-square rounded-md flex flex-col items-center justify-start pt-1.5 text-sm font-semibold transition-colors
                    ${isHoje ? 'bg-primary text-white' : 'hover:bg-muted text-foreground'}`}>
                  {dia}
                  {evs.length > 0 && (
                    <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isHoje ? 'bg-white' : 'bg-accent'}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Próximos eventos */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Próximos Eventos</h2>
          {proximos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-soft p-8 text-center">
              <p className="text-muted-foreground text-sm">Nenhum evento futuro cadastrado.</p>
              <button onClick={() => setShow(true)} className="mt-3 text-primary text-sm font-semibold hover:underline">
                + Criar primeiro evento
              </button>
            </div>
          ) : proximos.map(ev => {
            const d    = new Date(ev.data + 'T12:00')
            const cfg  = TIPO_CFG[ev.tipo] ?? TIPO_CFG.geral
            return (
              <div key={ev.id} className="bg-white rounded-lg shadow-soft p-4 hover:shadow-float transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-md p-2 shrink-0 text-center min-w-[48px]">
                    <p className="text-[10px] font-bold text-primary uppercase">{MESES[d.getMonth()].slice(0,3)}</p>
                    <p className="text-xl font-bold text-primary leading-none">{d.getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight truncate">{ev.titulo}</p>
                    {ev.hora  && <p className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{ev.hora.slice(0,5)}</p>}
                    {ev.local && <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{ev.local}</p>}
                    {ev.turma && <p className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" />{ev.turma}</p>}
                    <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal Novo Evento */}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShow(false)} />
          <div className="relative bg-white rounded-xl shadow-modal w-full max-w-md z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border/50 sticky top-0 bg-white">
              <h2 className="text-lg font-bold">Novo Evento</h2>
              <button onClick={() => setShow(false)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={salvar} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label>Título *</Label>
                <Input placeholder="Ex: Reunião de Pais" value={form.titulo} onChange={e => campo('titulo', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Data *</Label>
                  <Input type="date" value={form.data} onChange={e => campo('data', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Horário</Label>
                  <Input type="time" value={form.hora} onChange={e => campo('hora', e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(TIPO_CFG).map(([k, v]) => (
                    <button key={k} type="button" onClick={() => campo('tipo', k)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        form.tipo === k ? `${v.cls} border-current` : 'border-border text-foreground hover:bg-muted'
                      }`}>{v.label}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Local</Label>
                <Input placeholder="Ex: Auditório" value={form.local} onChange={e => campo('local', e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>Turma(s)</Label>
                <select value={form.turma} onChange={e => campo('turma', e.target.value)}
                  className="flex h-12 w-full rounded border border-primary/20 bg-white px-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                  <option value="">Todas as turmas</option>
                  {turmas.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
                  <option value="Todas as turmas">Todas as turmas</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Descrição</Label>
                <textarea value={form.descricao} onChange={e => campo('descricao', e.target.value)}
                  placeholder="Detalhes do evento..."
                  rows={3}
                  className="flex w-full rounded border border-primary/20 bg-white px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" />
              </div>

              {erro && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{erro}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShow(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" disabled={salvando}>
                  {salvando ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : 'Criar Evento'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
