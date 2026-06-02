'use client'

import { useState, useTransition } from 'react'
import { Utensils, Moon, Baby, Palette, MessageSquare, CheckCircle2, Loader2, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Aluno { id: string; nome: string; foto_url: string | null; status: string }
interface Turma { id: string; nome: string; alunos_turmas: { aluno: Aluno }[] }
interface Props  { turmas: Turma[]; escolaId: string; autorId: string }

const TIPOS = [
  { key: 'refeicao',  label: 'Refeição',   icon: Utensils,     color: 'bg-amber-100 text-amber-700',  fields: ['titulo','descricao','hora'] },
  { key: 'sono',      label: 'Sono',        icon: Moon,         color: 'bg-indigo-100 text-indigo-700', fields: ['hora','descricao'] },
  { key: 'fralda',    label: 'Fraldas',     icon: Baby,         color: 'bg-pink-100 text-pink-700',    fields: ['titulo','hora'] },
  { key: 'atividade', label: 'Atividade',   icon: Palette,      color: 'bg-orange-100 text-orange-700',fields: ['titulo','descricao'] },
  { key: 'recado',    label: 'Recado',      icon: MessageSquare,color: 'bg-blue-100 text-blue-700',    fields: ['titulo','descricao'] },
]

const REFEICOES_PRESET = ['Sopa de legumes com frango','Arroz, feijão e carne moída','Macarrão ao sugo','Frango grelhado com purê']
const ATIVIDADES_PRESET = ['Pintura com guache','Brincadeira no parquinho','Contação de histórias','Música e dança','Modelagem com argila']

export function DiarioMassaClient({ turmas, escolaId, autorId }: Props) {
  const [turmaId,   setTurmaId]   = useState(turmas[0]?.id ?? '')
  const [tipo,      setTipo]      = useState('refeicao')
  const [titulo,    setTitulo]    = useState('')
  const [descricao, setDescricao] = useState('')
  const [hora,      setHora]      = useState(new Date().toTimeString().slice(0,5))
  const [excluidos, setExcluidos] = useState<Set<string>>(new Set())
  const [salvando,  setSalvando]  = useState(false)
  const [sucesso,   setSucesso]   = useState<number | null>(null)
  const [erro,      setErro]      = useState('')
  const [showAlunos,setShowAlunos]= useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()
  const sb = createClient() as any

  const turma = turmas.find(t => t.id === turmaId)
  const alunosAtivos = turma?.alunos_turmas
    .map(at => at.aluno)
    .filter(a => a.status === 'ativo') ?? []
  const selecionados = alunosAtivos.filter(a => !excluidos.has(a.id))
  const tipoConfig   = TIPOS.find(t => t.key === tipo)!

  function toggleAluno(id: string) {
    setExcluidos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function usarPreset(preset: string) {
    if (tipo === 'refeicao') setTitulo(preset)
    else setTitulo(preset)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) { setErro('Informe o título/descrição.'); return }
    if (!selecionados.length) { setErro('Nenhum aluno selecionado.'); return }
    setSalvando(true); setErro(''); setSucesso(null)

    try {
      const hoje = new Date().toISOString().split('T')[0]
      const registros = selecionados.map(a => ({
        aluno_id:   a.id,
        escola_id:  escolaId,
        tipo,
        titulo:     titulo.trim(),
        descricao:  descricao.trim() || null,
        hora:       hora || null,
        data:       hoje,
        criado_por: autorId,
      }))

      const { error } = await sb.from('registros_diarios').insert(registros)
      if (error) throw error

      setSucesso(selecionados.length)
      setTitulo(''); setDescricao('')
      setExcluidos(new Set())
      startTransition(() => router.refresh())
    } catch (err: any) {
      setErro(err.message ?? 'Erro ao salvar registros.')
    } finally {
      setSalvando(false)
    }
  }

  const presets = tipo === 'refeicao' ? REFEICOES_PRESET : tipo === 'atividade' ? ATIVIDADES_PRESET : []

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Diário em Massa</h1>
        <p className="text-muted-foreground mt-1">Lance um registro para todos os alunos da turma de uma vez.</p>
      </div>

      <form onSubmit={salvar} className="space-y-5">
        {/* Turma */}
        <div className="bg-white rounded-lg shadow-soft p-5 space-y-3">
          <Label className="text-base font-bold">1. Selecione a turma</Label>
          <div className="flex flex-wrap gap-2">
            {turmas.map(t => (
              <button key={t.id} type="button" onClick={() => { setTurmaId(t.id); setExcluidos(new Set()) }}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  turmaId === t.id ? 'bg-primary text-white border-primary' : 'border-border hover:bg-muted'
                }`}>
                {t.nome} ({t.alunos_turmas.filter(at=>at.aluno.status==='ativo').length})
              </button>
            ))}
          </div>

          {/* Lista colapsável de alunos */}
          <button type="button" onClick={() => setShowAlunos(v => !v)}
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <Users className="w-3.5 h-3.5" />
            {selecionados.length}/{alunosAtivos.length} alunos selecionados
            {showAlunos ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAlunos && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {alunosAtivos.map(a => {
                const sel = !excluidos.has(a.id)
                return (
                  <button key={a.id} type="button" onClick={() => toggleAluno(a.id)}
                    className={`flex items-center gap-2 p-2 rounded-md border text-sm transition-colors ${
                      sel ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'
                    }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${sel ? 'bg-primary text-white' : 'bg-muted'}`}>
                      {sel ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[9px]">{a.nome[0]}</span>}
                    </div>
                    <span className="truncate text-xs font-medium">{a.nome.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Tipo de registro */}
        <div className="bg-white rounded-lg shadow-soft p-5 space-y-3">
          <Label className="text-base font-bold">2. Tipo de registro</Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {TIPOS.map(t => {
              const Icon = t.icon
              return (
                <button key={t.key} type="button" onClick={() => { setTipo(t.key); setTitulo(''); setDescricao('') }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                    tipo === t.key ? `${t.color} border-current` : 'border-border hover:border-primary/30'
                  }`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold">{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="bg-white rounded-lg shadow-soft p-5 space-y-4">
          <Label className="text-base font-bold">3. Conteúdo do registro</Label>

          {/* Presets */}
          {presets.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Opções rápidas:</p>
              <div className="flex flex-wrap gap-1.5">
                {presets.map(p => (
                  <button key={p} type="button" onClick={() => usarPreset(p)}
                    className="text-xs px-3 py-1.5 bg-muted rounded-full hover:bg-primary/10 hover:text-primary transition-colors font-medium">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tipoConfig.fields.includes('titulo') && (
            <div className="space-y-1.5">
              <Label>{tipo === 'refeicao' ? 'Cardápio' : tipo === 'fralda' ? 'Tipo (Xixi/Cocô)' : 'Título'} *</Label>
              <input
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder={tipo === 'refeicao' ? 'Ex: Sopa de legumes com frango' : tipo === 'fralda' ? 'Troca - Xixi' : 'Título da atividade...'}
                className="flex h-12 w-full rounded border border-primary/20 bg-white px-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          )}

          {tipoConfig.fields.includes('hora') && (
            <div className="space-y-1.5">
              <Label>Horário</Label>
              <input type="time" value={hora} onChange={e => setHora(e.target.value)}
                className="flex h-12 w-48 rounded border border-primary/20 bg-white px-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
          )}

          {tipoConfig.fields.includes('descricao') && (
            <div className="space-y-1.5">
              <Label>Observação</Label>
              <textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                rows={3}
                placeholder={tipo === 'refeicao' ? 'Comeu bem? Recusou algum alimento?' : tipo === 'sono' ? 'Dormiu tranquilo? Acordou quantas vezes?' : 'Descreva a atividade...'}
                className="flex w-full rounded border border-primary/20 bg-white px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              />
            </div>
          )}
        </div>

        {sucesso && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm font-bold text-green-700">
              Registro salvo para {sucesso} aluno{sucesso > 1 ? 's' : ''}! ✅
            </p>
          </div>
        )}
        {erro && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{erro}</p>}

        <Button type="submit" className="w-full gap-2 h-14 text-base" disabled={salvando || !selecionados.length}>
          {salvando
            ? <><Loader2 className="w-5 h-5 animate-spin" />Salvando {selecionados.length} registros...</>
            : <><CheckCircle2 className="w-5 h-5" />Salvar para {selecionados.length} aluno{selecionados.length !== 1 ? 's' : ''}</>
          }
        </Button>
      </form>
    </div>
  )
}
