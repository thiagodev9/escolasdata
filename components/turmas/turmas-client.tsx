'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Users, BookOpen, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Professor { id: string; nome: string }
interface Aluno { id: string; nome: string; foto_url: string | null; status: string }
interface Turma {
  id: string; nome: string; capacidade: number; ano_letivo: number
  professor: Professor | null
  alunos_turmas: { aluno: Aluno }[]
}

interface Props {
  turmas: Turma[]
  professores: Professor[]
  escolaId: string
}

const FORM_VAZIO = { nome: '', capacidade: '20', ano_letivo: '2024', professor_id: '' }

export function TurmasClient({ turmas, professores, escolaId }: Props) {
  const [showModal, setShowModal]   = useState(false)
  const [editando, setEditando]     = useState<Turma | null>(null)
  const [expandida, setExpandida]   = useState<string | null>(null)
  const [form, setForm]             = useState(FORM_VAZIO)
  const [salvando, setSalvando]     = useState(false)
  const [excluindo, setExcluindo]   = useState<string | null>(null)
  const [erro, setErro]             = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const sb = createClient() as any

  function abrirNova() {
    setEditando(null)
    setForm(FORM_VAZIO)
    setErro('')
    setShowModal(true)
  }

  function abrirEdicao(t: Turma) {
    setEditando(t)
    setForm({
      nome: t.nome,
      capacidade: String(t.capacidade),
      ano_letivo: String(t.ano_letivo),
      professor_id: t.professor?.id ?? '',
    })
    setErro('')
    setShowModal(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome) { setErro('Nome é obrigatório.'); return }
    setSalvando(true); setErro('')
    try {
      const payload = {
        nome: form.nome,
        capacidade: parseInt(form.capacidade) || 20,
        ano_letivo: parseInt(form.ano_letivo) || 2024,
        professor_id: form.professor_id || null,
        escola_id: escolaId,
      }
      if (editando) {
        const { error } = await sb.from('turmas').update(payload).eq('id', editando.id)
        if (error) throw error
      } else {
        const { error } = await sb.from('turmas').insert(payload)
        if (error) throw error
      }
      setShowModal(false)
      startTransition(() => router.refresh())
    } catch (err: any) {
      setErro(err.message ?? 'Erro ao salvar.')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta turma? Os alunos serão desvinculados.')) return
    setExcluindo(id)
    await sb.from('alunos_turmas').delete().eq('turma_id', id)
    await sb.from('turmas').delete().eq('id', id)
    setExcluindo(null)
    startTransition(() => router.refresh())
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Turmas</h1>
          <p className="text-muted-foreground mt-1">{turmas.length} turmas · {turmas.reduce((s, t) => s + t.alunos_turmas.length, 0)} alunos matriculados</p>
        </div>
        <Button onClick={abrirNova} className="gap-2"><Plus className="w-4 h-4" /> Nova Turma</Button>
      </div>

      {/* Grid de turmas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {turmas.map(turma => {
          const total   = turma.alunos_turmas.length
          const ocup    = Math.round((total / turma.capacidade) * 100)
          const aberta  = expandida === turma.id
          return (
            <div key={turma.id} className="bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-float transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => abrirEdicao(turma)} className="w-8 h-8 rounded hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => excluir(turma.id)} disabled={excluindo === turma.id} className="w-8 h-8 rounded hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                      {excluindo === turma.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold">{turma.nome}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {turma.professor?.nome ?? <span className="text-amber-500">Sem professora</span>}
                </p>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" /> {total}/{turma.capacidade}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    ocup >= 90 ? 'bg-red-100 text-red-600' : ocup >= 70 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                  }`}>{ocup}%</span>
                </div>
                <div className="mt-2 h-1.5 bg-muted rounded-full">
                  <div className={`h-full rounded-full ${ocup >= 90 ? 'bg-red-400' : ocup >= 70 ? 'bg-amber-400' : 'bg-green-400'}`}
                    style={{ width: `${Math.min(ocup, 100)}%` }} />
                </div>
              </div>

              {/* Expandir alunos */}
              <button onClick={() => setExpandida(aberta ? null : turma.id)}
                className="w-full flex items-center justify-between px-5 py-2.5 bg-muted/40 hover:bg-muted text-xs font-semibold text-muted-foreground transition-colors border-t border-border/40">
                <span>Ver alunos ({total})</span>
                {aberta ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {aberta && (
                <div className="divide-y divide-border/30 max-h-48 overflow-y-auto">
                  {turma.alunos_turmas.length === 0
                    ? <p className="px-5 py-3 text-xs text-muted-foreground">Nenhum aluno nesta turma.</p>
                    : turma.alunos_turmas.map(({ aluno }) => (
                      <div key={aluno.id} className="flex items-center gap-3 px-5 py-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-primary">
                          {aluno.nome.split(' ').slice(0,2).map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm flex-1 truncate">{aluno.nome}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          aluno.status === 'ativo' ? 'bg-green-100 text-green-700' :
                          aluno.status === 'pendente' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                        }`}>{aluno.status}</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )
        })}

        {/* Card nova turma */}
        <button onClick={abrirNova}
          className="bg-white rounded-lg shadow-soft p-5 border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 min-h-[180px] hover:border-primary/50 hover:bg-primary/5 transition-all group">
          <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground group-hover:text-primary">Nova Turma</p>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-modal w-full max-w-md z-10">
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="text-lg font-bold">{editando ? 'Editar Turma' : 'Nova Turma'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={salvar} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label>Nome da turma *</Label>
                <Input placeholder="Ex: Maternal I" value={form.nome} onChange={e => setForm(f => ({...f, nome: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Capacidade</Label>
                  <Input type="number" min={1} max={50} value={form.capacidade} onChange={e => setForm(f => ({...f, capacidade: e.target.value}))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Ano letivo</Label>
                  <Input type="number" min={2020} max={2030} value={form.ano_letivo} onChange={e => setForm(f => ({...f, ano_letivo: e.target.value}))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Professora responsável</Label>
                <select value={form.professor_id} onChange={e => setForm(f => ({...f, professor_id: e.target.value}))}
                  className="flex h-12 w-full rounded border border-primary/20 bg-white px-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                  <option value="">Sem professora vinculada</option>
                  {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              {erro && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{erro}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" disabled={salvando}>
                  {salvando ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : editando ? 'Atualizar' : 'Criar Turma'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
