'use client'

import { useState, useTransition } from 'react'
import { Plus, Search, X, Loader2, User, Phone, Trash2, UserPlus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StudentCard } from './student-card'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Turma { id: string; nome: string }
interface Aluno {
  id: string; nome: string; dt_nascimento: string
  status: 'ativo' | 'pendente' | 'inativo'
  foto_url: string | null; escola_id: string
  turma_nome: string | null; turma_id: string | null
  responsavel_nome?: string | null; responsavel_tel?: string | null
}
interface AlunosClientProps { alunos: Aluno[]; turmas: Turma[]; escolaId: string }

interface Responsavel { nome: string; telefone: string }
const RESP_VAZIO: Responsavel = { nome: '', telefone: '' }

interface RespEdit {
  ar_id: string | null        // alunos_responsaveis.id (null = novo)
  responsavel_id: string | null
  nome: string
  telefone: string
}
type FormStatus = 'ativo' | 'pendente' | 'inativo'
interface AlunoForm { nome: string; dt_nascimento: string; status: FormStatus; turma_id: string }
const FORM_INICIAL: AlunoForm = { nome: '', dt_nascimento: '', status: 'ativo', turma_id: '' }

export function AlunosClient({ alunos, turmas, escolaId }: AlunosClientProps) {
  const [busca, setBusca]             = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [isPending, startTransition]  = useTransition()
  const [salvando, setSalvando]       = useState(false)
  const [erros, setErros]             = useState<Record<string, string>>({})
  const [erroGeral, setErroGeral]     = useState('')
  const router   = useRouter()
  const supabase = createClient()

  // Novo aluno
  const [form, setForm]   = useState(FORM_INICIAL)
  const [resps, setResps] = useState<Responsavel[]>([{ ...RESP_VAZIO }])

  // Editar aluno
  const [editAluno, setEditAluno]         = useState<Aluno | null>(null)
  const [editForm, setEditForm]           = useState(FORM_INICIAL)
  const [editErros, setEditErros]         = useState<Record<string, string>>({})
  const [editErroGeral, setEditErroGeral] = useState('')
  const [editSalvando, setEditSalvando]   = useState(false)
  const [editResps, setEditResps]         = useState<RespEdit[]>([])
  const [editRespsLoading, setEditRespsLoading] = useState(false)

  // Excluir aluno
  const [deleteAluno, setDeleteAluno] = useState<Aluno | null>(null)
  const [deletando, setDeletando]     = useState(false)
  const [deleteErro, setDeleteErro]   = useState('')

  const filtrados     = alunos.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase()))
  const totalPendente = alunos.filter(a => a.status === 'pendente').length

  // ── Novo aluno ──────────────────────────────────────────────
  function campo<K extends keyof AlunoForm>(key: K, val: string) {
    setForm(f => ({ ...f, [key]: val }))
    setErros(e => { const n = { ...e }; delete n[key]; return n })
  }
  function campoResp(idx: number, key: keyof Responsavel, val: string) {
    setResps(r => r.map((item, i) => i === idx ? { ...item, [key]: val } : item))
    setErros(e => { const n = { ...e }; delete n[`resp_${idx}_${key}`]; return n })
  }
  function adicionarResp() { setResps(r => [...r, { ...RESP_VAZIO }]) }
  function removerResp(idx: number) { setResps(r => r.filter((_, i) => i !== idx)) }

  function validar() {
    const novos: Record<string, string> = {}
    if (!form.nome.trim())         novos.nome          = 'Nome do aluno é obrigatório'
    if (!form.dt_nascimento)       novos.dt_nascimento = 'Data de nascimento é obrigatória'
    if (!form.turma_id)            novos.turma_id      = 'Turma é obrigatória'
    resps.forEach((r, i) => {
      if (!r.nome.trim())     novos[`resp_${i}_nome`]     = 'Nome do responsável é obrigatório'
      if (!r.telefone.trim()) novos[`resp_${i}_telefone`] = 'Contato é obrigatório'
    })
    setErros(novos)
    return Object.keys(novos).length === 0
  }

  function fecharModal() {
    setShowModal(false); setForm(FORM_INICIAL)
    setResps([{ ...RESP_VAZIO }]); setErros({}); setErroGeral('')
  }

  async function salvarAluno(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return
    setSalvando(true); setErroGeral('')
    try {
      const sb = supabase as any
      const { data: aluno, error: errA } = await sb
        .from('alunos')
        .insert({ nome: form.nome.trim(), dt_nascimento: form.dt_nascimento, status: form.status, escola_id: escolaId })
        .select().single()
      if (errA) throw errA

      for (let i = 0; i < resps.length; i++) {
        const r = resps[i]
        const { data: resp, error: errR } = await sb
          .from('responsaveis')
          .insert({ nome: r.nome.trim(), telefone: r.telefone.trim(), escola_id: escolaId })
          .select().single()
        if (errR) throw errR
        await sb.from('alunos_responsaveis').insert({
          aluno_id: aluno.id, responsavel_id: resp.id,
          parentesco: 'pai/mãe', principal: i === 0,
        })
      }
      await sb.from('alunos_turmas').insert({ aluno_id: aluno.id, turma_id: form.turma_id, ativo: true })

      fecharModal()
      startTransition(() => router.refresh())
    } catch (err: any) {
      setErroGeral(err.message ?? 'Erro ao salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  // ── Editar aluno ─────────────────────────────────────────────
  async function abrirEdicao(aluno: Aluno) {
    setEditAluno(aluno)
    setEditForm({
      nome:          aluno.nome,
      dt_nascimento: aluno.dt_nascimento ?? '',
      status:        aluno.status,
      turma_id:      aluno.turma_id ?? '',
    })
    setEditErros({}); setEditErroGeral('')
    setEditResps([]); setEditRespsLoading(true)

    // Busca responsáveis vinculados (junction table sem id próprio)
    const sb = supabase as any
    const { data, error } = await sb
      .from('alunos_responsaveis')
      .select('responsavel_id, principal, responsaveis(id, nome, telefone)')
      .eq('aluno_id', aluno.id)
      .order('principal', { ascending: false })

    if (!error && data && data.length > 0) {
      setEditResps(data.map((ar: any) => ({
        ar_id:          null,
        responsavel_id: ar.responsavel_id,
        nome:           ar.responsaveis?.nome ?? '',
        telefone:       ar.responsaveis?.telefone ?? '',
      })))
    } else {
      // Nenhum responsável vinculado — inicia com um campo vazio
      setEditResps([{ ar_id: null, responsavel_id: null, nome: '', telefone: '' }])
    }
    setEditRespsLoading(false)
  }

  function fecharEdicao() {
    setEditAluno(null); setEditForm(FORM_INICIAL)
    setEditErros({}); setEditErroGeral('')
    setEditResps([]); setEditRespsLoading(false)
  }

  function campoEdit<K extends keyof AlunoForm>(key: K, val: string) {
    setEditForm(f => ({ ...f, [key]: val }))
    setEditErros(e => { const n = { ...e }; delete n[key]; return n })
  }

  function campoEditResp(idx: number, key: 'nome' | 'telefone', val: string) {
    setEditResps(r => r.map((item, i) => i === idx ? { ...item, [key]: val } : item))
    setEditErros(e => { const n = { ...e }; delete n[`er_${idx}_${key}`]; return n })
  }

  function adicionarEditResp() {
    setEditResps(r => [...r, { ar_id: null, responsavel_id: null, nome: '', telefone: '' }])
  }

  function removerEditResp(idx: number) {
    setEditResps(r => r.filter((_, i) => i !== idx))
  }

  function validarEdit() {
    const novos: Record<string, string> = {}
    if (!editForm.nome.trim())   novos.nome          = 'Nome do aluno é obrigatório'
    if (!editForm.dt_nascimento) novos.dt_nascimento = 'Data de nascimento é obrigatória'
    if (!editForm.turma_id)      novos.turma_id      = 'Turma é obrigatória'
    editResps.forEach((r, i) => {
      if (!r.nome.trim())     novos[`er_${i}_nome`]     = 'Nome é obrigatório'
      if (!r.telefone.trim()) novos[`er_${i}_telefone`] = 'Contato é obrigatório'
    })
    setEditErros(novos)
    return Object.keys(novos).length === 0
  }

  async function salvarEdicao(e: React.FormEvent) {
    e.preventDefault()
    if (!editAluno || !validarEdit()) return
    setEditSalvando(true); setEditErroGeral('')
    try {
      const sb = supabase as any

      // 1. Atualiza dados do aluno
      const { error: errA } = await sb
        .from('alunos')
        .update({ nome: editForm.nome.trim(), dt_nascimento: editForm.dt_nascimento, status: editForm.status })
        .eq('id', editAluno.id)
      if (errA) throw errA

      // 2. Atualiza turma se mudou
      if (editForm.turma_id !== (editAluno.turma_id ?? '')) {
        await sb.from('alunos_turmas').delete().eq('aluno_id', editAluno.id)
        if (editForm.turma_id) {
          await sb.from('alunos_turmas').insert({ aluno_id: editAluno.id, turma_id: editForm.turma_id, ativo: true })
        }
      }

      // 3. Atualiza responsáveis
      // Remove todos os vínculos e recria (mais simples e seguro)
      await sb.from('alunos_responsaveis').delete().eq('aluno_id', editAluno.id)

      for (let i = 0; i < editResps.length; i++) {
        const r = editResps[i]
        let respId = r.responsavel_id

        if (respId) {
          // Atualiza responsável existente
          await sb.from('responsaveis')
            .update({ nome: r.nome.trim(), telefone: r.telefone.trim() })
            .eq('id', respId)
        } else {
          // Cria novo responsável
          const { data: novo, error: errR } = await sb
            .from('responsaveis')
            .insert({ nome: r.nome.trim(), telefone: r.telefone.trim(), escola_id: escolaId })
            .select().single()
          if (errR) throw errR
          respId = novo.id
        }

        await sb.from('alunos_responsaveis').insert({
          aluno_id: editAluno.id, responsavel_id: respId,
          parentesco: 'pai/mãe', principal: i === 0,
        })
      }

      fecharEdicao()
      startTransition(() => router.refresh())
    } catch (err: any) {
      setEditErroGeral(err.message ?? 'Erro ao salvar. Tente novamente.')
    } finally {
      setEditSalvando(false)
    }
  }

  // ── Excluir aluno ─────────────────────────────────────────────
  async function confirmarExclusao() {
    if (!deleteAluno) return
    setDeletando(true); setDeleteErro('')
    try {
      const sb = supabase as any
      await sb.from('alunos_turmas').delete().eq('aluno_id', deleteAluno.id)
      await sb.from('alunos_responsaveis').delete().eq('aluno_id', deleteAluno.id)
      const { error } = await sb.from('alunos').delete().eq('id', deleteAluno.id)
      if (error) throw error
      setDeleteAluno(null)
      startTransition(() => router.refresh())
    } catch (err: any) {
      setDeleteErro(err.message ?? 'Erro ao excluir. Tente novamente.')
    } finally {
      setDeletando(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Lista de Alunos</h1>
        <p className="text-muted-foreground mt-1">Gerencie as matrículas e informações dos estudantes.</p>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="bg-white rounded-lg shadow-soft px-5 py-4 min-w-[130px]">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total de Alunos</p>
          <p className="text-3xl font-bold mt-1">{alunos.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft px-5 py-4 min-w-[130px]">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pendente</p>
          <p className="text-3xl font-bold mt-1">{totalPendente}</p>
        </div>
        <div className="flex-1 min-w-[200px] bg-primary/5 border border-primary/20 rounded-lg shadow-soft px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-primary">Período de Matrículas</p>
            <p className="text-xs text-primary/70 mt-0.5">O período para 2026 está aberto.</p>
          </div>
          <Plus className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar aluno..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10 h-10 min-h-0" />
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Novo Aluno
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-soft">
        <div className="grid grid-cols-[1fr_48px] md:grid-cols-[2fr_1fr_100px_48px] lg:grid-cols-[2fr_1fr_1.5fr_100px_48px] gap-4 px-4 py-3 border-b border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aluno</p>
          <p className="hidden md:block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Turma</p>
          <p className="hidden lg:block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Responsável</p>
          <p className="hidden md:block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</p>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Ações</p>
        </div>
        <div className="divide-y divide-border/30 px-4">
          {filtrados.length === 0
            ? <p className="py-16 text-center text-muted-foreground text-sm">
                {busca ? `Nenhum resultado para &ldquo;${busca}&rdquo;` : 'Nenhum aluno cadastrado.'}
              </p>
            : filtrados.map(aluno => (
                <StudentCard
                  key={aluno.id}
                  aluno={aluno as any}
                  onEdit={a => abrirEdicao(a as unknown as Aluno)}
                  onDelete={a => { setDeleteErro(''); setDeleteAluno(a as unknown as Aluno) }}
                />
              ))
          }
        </div>
        {filtrados.length > 0 && (
          <div className="px-6 py-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">Exibindo {filtrados.length} de {alunos.length} alunos</p>
          </div>
        )}
      </div>

      {/* ══ Modal Novo Aluno ══════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={fecharModal} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md z-10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-black text-slate-800">Novo Aluno</h2>
                <p className="text-xs text-slate-400 mt-0.5">Campos com * são obrigatórios</p>
              </div>
              <button onClick={fecharModal} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={salvarAluno} className="overflow-y-auto">
              <div className="px-6 py-5 space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Dados do Aluno</p>

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Nome completo *</Label>
                  <Input placeholder="Ex: Ana Oliveira" value={form.nome} onChange={e => campo('nome', e.target.value)}
                    className={erros.nome ? 'border-red-400' : ''} />
                  {erros.nome && <p className="text-xs text-red-500">{erros.nome}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Data de nascimento *</Label>
                  <Input type="date" value={form.dt_nascimento} onChange={e => campo('dt_nascimento', e.target.value)}
                    className={erros.dt_nascimento ? 'border-red-400' : ''} />
                  {erros.dt_nascimento && <p className="text-xs text-red-500">{erros.dt_nascimento}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Turma *</Label>
                  <select value={form.turma_id} onChange={e => campo('turma_id', e.target.value)}
                    className={`flex h-12 w-full rounded-xl border bg-white px-4 text-base outline-none transition-all focus:ring-2 focus:ring-primary/20
                      ${erros.turma_id ? 'border-red-400' : 'border-slate-200 focus:border-primary'}`}>
                    <option value="">Selecione uma turma</option>
                    {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                  </select>
                  {erros.turma_id && <p className="text-xs text-red-500">{erros.turma_id}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Status</Label>
                  <div className="flex gap-2">
                    {(['ativo','pendente','inativo'] as const).map(s => (
                      <button key={s} type="button" onClick={() => campo('status', s)}
                        className={`flex-1 py-2 rounded-full text-sm font-bold border transition-colors
                          ${form.status === s
                            ? s === 'ativo'    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : s === 'pendente' ? 'bg-amber-100 text-amber-700 border-amber-200'
                            :                   'bg-slate-100 text-slate-600 border-slate-200'
                            : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Responsáveis</p>
                    <span className="text-xs text-slate-400">{resps.length} adicionado{resps.length !== 1 ? 's' : ''}</span>
                  </div>

                  {resps.map((r, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-2xl p-4 space-y-3 relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-500">
                          {idx === 0 ? '👤 Principal' : `👤 Responsável ${idx + 1}`}
                        </span>
                        {idx > 0 && (
                          <button type="button" onClick={() => removerResp(idx)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="font-bold text-slate-700 text-sm">Nome *</Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input placeholder="Ex: Carlos Oliveira" value={r.nome}
                            onChange={e => campoResp(idx, 'nome', e.target.value)}
                            className={`pl-10 ${erros[`resp_${idx}_nome`] ? 'border-red-400' : ''}`} />
                        </div>
                        {erros[`resp_${idx}_nome`] && <p className="text-xs text-red-500">{erros[`resp_${idx}_nome`]}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label className="font-bold text-slate-700 text-sm">Contato *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input type="tel" placeholder="(11) 99999-9999" value={r.telefone}
                            onChange={e => campoResp(idx, 'telefone', e.target.value)}
                            className={`pl-10 ${erros[`resp_${idx}_telefone`] ? 'border-red-400' : ''}`} />
                        </div>
                        {erros[`resp_${idx}_telefone`] && <p className="text-xs text-red-500">{erros[`resp_${idx}_telefone`]}</p>}
                      </div>
                    </div>
                  ))}

                  <button type="button" onClick={adicionarResp}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-400 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all">
                    <UserPlus className="w-4 h-4" />
                    Adicionar outro responsável
                  </button>
                </div>

                {erroGeral && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{erroGeral}</div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
                <Button type="button" variant="outline" className="flex-1" onClick={fecharModal}>Cancelar</Button>
                <Button type="submit" className="flex-1" disabled={salvando}>
                  {salvando ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Aluno'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Modal Editar Aluno ════════════════════════════════════ */}
      {editAluno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={fecharEdicao} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md z-10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-black text-slate-800">Editar Aluno</h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">{editAluno.nome}</p>
              </div>
              <button onClick={fecharEdicao} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={salvarEdicao} className="overflow-y-auto">
              <div className="px-6 py-5 space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Dados do Aluno</p>

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Nome completo *</Label>
                  <Input placeholder="Ex: Ana Oliveira" value={editForm.nome} onChange={e => campoEdit('nome', e.target.value)}
                    className={editErros.nome ? 'border-red-400' : ''} />
                  {editErros.nome && <p className="text-xs text-red-500">{editErros.nome}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Data de nascimento *</Label>
                  <Input type="date" value={editForm.dt_nascimento} onChange={e => campoEdit('dt_nascimento', e.target.value)}
                    className={editErros.dt_nascimento ? 'border-red-400' : ''} />
                  {editErros.dt_nascimento && <p className="text-xs text-red-500">{editErros.dt_nascimento}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Turma *</Label>
                  <select value={editForm.turma_id} onChange={e => campoEdit('turma_id', e.target.value)}
                    className={`flex h-12 w-full rounded-xl border bg-white px-4 text-base outline-none transition-all focus:ring-2 focus:ring-primary/20
                      ${editErros.turma_id ? 'border-red-400' : 'border-slate-200 focus:border-primary'}`}>
                    <option value="">Selecione uma turma</option>
                    {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                  </select>
                  {editErros.turma_id && <p className="text-xs text-red-500">{editErros.turma_id}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Status</Label>
                  <div className="flex gap-2">
                    {(['ativo','pendente','inativo'] as const).map(s => (
                      <button key={s} type="button" onClick={() => campoEdit('status', s)}
                        className={`flex-1 py-2 rounded-full text-sm font-bold border transition-colors
                          ${editForm.status === s
                            ? s === 'ativo'    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : s === 'pendente' ? 'bg-amber-100 text-amber-700 border-amber-200'
                            :                   'bg-slate-100 text-slate-600 border-slate-200'
                            : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Responsáveis ── */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Responsáveis</p>
                    {editRespsLoading
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                      : <span className="text-xs text-slate-400">{editResps.length} vinculado{editResps.length !== 1 ? 's' : ''}</span>
                    }
                  </div>

                  {editRespsLoading ? (
                    <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Carregando responsáveis...</span>
                    </div>
                  ) : (
                    <>
                      {editResps.map((r, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-500">
                              {idx === 0 ? '👤 Principal' : `👤 Responsável ${idx + 1}`}
                            </span>
                            {idx > 0 && (
                              <button type="button" onClick={() => removerEditResp(idx)}
                                className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Label className="font-bold text-slate-700 text-sm">Nome *</Label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input placeholder="Ex: Carlos Oliveira" value={r.nome}
                                onChange={e => campoEditResp(idx, 'nome', e.target.value)}
                                className={`pl-10 ${editErros[`er_${idx}_nome`] ? 'border-red-400' : ''}`} />
                            </div>
                            {editErros[`er_${idx}_nome`] && <p className="text-xs text-red-500">{editErros[`er_${idx}_nome`]}</p>}
                          </div>
                          <div className="space-y-1">
                            <Label className="font-bold text-slate-700 text-sm">Contato *</Label>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input type="tel" placeholder="(11) 99999-9999" value={r.telefone}
                                onChange={e => campoEditResp(idx, 'telefone', e.target.value)}
                                className={`pl-10 ${editErros[`er_${idx}_telefone`] ? 'border-red-400' : ''}`} />
                            </div>
                            {editErros[`er_${idx}_telefone`] && <p className="text-xs text-red-500">{editErros[`er_${idx}_telefone`]}</p>}
                          </div>
                        </div>
                      ))}

                      <button type="button" onClick={adicionarEditResp}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-400 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all">
                        <UserPlus className="w-4 h-4" />
                        Adicionar outro responsável
                      </button>
                    </>
                  )}
                </div>

                {editErroGeral && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{editErroGeral}</div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
                <Button type="button" variant="outline" className="flex-1" onClick={fecharEdicao}>Cancelar</Button>
                <Button type="submit" className="flex-1" disabled={editSalvando || editRespsLoading}>
                  {editSalvando ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Modal Confirmar Exclusão ══════════════════════════════ */}
      {deleteAluno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deletando && setDeleteAluno(null)} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-sm z-10 p-6 animate-fade-in">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Excluir Aluno</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Tem certeza que deseja excluir <span className="font-bold text-slate-700">{deleteAluno.nome}</span>?
                  Esta ação não pode ser desfeita.
                </p>
              </div>
              {deleteErro && (
                <div className="w-full bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{deleteErro}</div>
              )}
              <div className="flex gap-3 w-full mt-1">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteAluno(null)} disabled={deletando}>
                  Cancelar
                </Button>
                <Button variant="destructive" className="flex-1" onClick={confirmarExclusao} disabled={deletando}>
                  {deletando ? <><Loader2 className="w-4 h-4 animate-spin" /> Excluindo...</> : 'Sim, Excluir'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
