'use client'

import { useState, useTransition } from 'react'
import {
  Plus, Search, X, Loader2, Mail, User, Phone, MapPin,
  Pencil, ToggleLeft, ToggleRight, CreditCard, Calendar,
  Banknote, FileText, AlertTriangle, Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export interface Colaborador {
  id: string; escola_id: string; nome: string; email: string | null
  telefone: string | null; cpf: string | null; cargo: string
  cep: string | null; rua: string | null; numero: string | null
  complemento: string | null; bairro: string | null; cidade: string | null; estado: string | null
  dt_admissao: string | null; dt_venc_ferias: string | null
  salario: number | null; observacoes: string | null
  ativo: boolean; criado_em: string
}

interface Props { colaboradores: Colaborador[]; escolaId: string }

const CARGOS: { value: string; label: string; color: string }[] = [
  { value: 'diretora',          label: 'Diretora',                  color: 'bg-blue-100 text-blue-700' },
  { value: 'coordenadora',      label: 'Coordenadora Pedagógica',   color: 'bg-violet-100 text-violet-700' },
  { value: 'professora',        label: 'Professora',                color: 'bg-emerald-100 text-emerald-700' },
  { value: 'auxiliar_classe',   label: 'Auxiliar de Classe',        color: 'bg-teal-100 text-teal-700' },
  { value: 'monitora',          label: 'Monitora',                  color: 'bg-cyan-100 text-cyan-700' },
  { value: 'auxiliar_admin',    label: 'Auxiliar Administrativo',   color: 'bg-sky-100 text-sky-700' },
  { value: 'cozinheira',        label: 'Cozinheira',                color: 'bg-orange-100 text-orange-700' },
  { value: 'faxineira',         label: 'Serviços Gerais',           color: 'bg-amber-100 text-amber-700' },
  { value: 'porteiro',          label: 'Porteiro/a',                color: 'bg-slate-100 text-slate-600' },
  { value: 'psicologa',         label: 'Psicóloga',                 color: 'bg-pink-100 text-pink-700' },
  { value: 'fonoaudiologa',     label: 'Fonoaudióloga',             color: 'bg-rose-100 text-rose-700' },
  { value: 'outro',             label: 'Outro',                     color: 'bg-slate-100 text-slate-500' },
]

function cargoInfo(v: string) { return CARGOS.find(c => c.value === v) ?? { label: v, color: 'bg-slate-100 text-slate-600' } }

const FORM_VAZIO = {
  nome: '', email: '', telefone: '', cpf: '', cargo: 'professora',
  cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
  dt_admissao: '', salario: '', observacoes: '',
}

type Section = 'pessoal' | 'endereco' | 'contrato'

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'pessoal',  label: 'Dados Pessoais' },
  { id: 'endereco', label: 'Endereço'        },
  { id: 'contrato', label: 'Contrato'        },
]

function formatDate(d: string | null) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

/**
 * CLT: a cada 12 meses aquisitivos + 12 meses concessivos.
 * Retorna a data limite para concessão das férias do período atual.
 */
function calcVencFerias(dtAdmissao: string | null): string | null {
  if (!dtAdmissao) return null
  const D     = new Date(dtAdmissao + 'T00:00:00')
  const hoje  = new Date()
  const meses = (hoje.getFullYear() - D.getFullYear()) * 12
              + (hoje.getMonth() - D.getMonth())
  // Quantos períodos aquisitivos completos (mínimo 1 para projeção futura)
  const periodos = Math.max(1, Math.floor(meses / 12))
  const venc = new Date(D)
  venc.setFullYear(venc.getFullYear() + periodos + 1)
  return venc.toISOString().slice(0, 10)
}

function diasParaVencer(dt: string | null) {
  if (!dt) return null
  const diff = Math.ceil((new Date(dt + 'T00:00:00').getTime() - Date.now()) / 86400000)
  return diff
}

export function ColaboradoresClient({ colaboradores, escolaId }: Props) {
  const [busca, setBusca]             = useState('')
  const [filtroCargo, setFiltroCargo] = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [editColab, setEditColab]     = useState<Colaborador | null>(null)
  const [deleteColab, setDeleteColab] = useState<Colaborador | null>(null)
  const [section, setSection]         = useState<Section>('pessoal')
  const [form, setForm]               = useState(FORM_VAZIO)
  const [erros, setErros]             = useState<Record<string, string>>({})
  const [erroGeral, setErroGeral]     = useState('')
  const [salvando, setSalvando]       = useState(false)
  const [deletando, setDeletando]     = useState(false)
  const [, startTransition]           = useTransition()
  const router   = useRouter()
  const supabase = createClient()

  const filtrados = colaboradores.filter(c => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (c.email ?? '').toLowerCase().includes(busca.toLowerCase())
    const matchCargo = !filtroCargo || c.cargo === filtroCargo
    return matchBusca && matchCargo
  })

  const totalAtivos = colaboradores.filter(c => c.ativo).length

  // Férias a vencer em até 30 dias (calculado automaticamente)
  const feriasAlert = colaboradores.filter(c => {
    const d = diasParaVencer(calcVencFerias(c.dt_admissao))
    return d !== null && d >= 0 && d <= 30
  })

  function campo(key: keyof typeof FORM_VAZIO, val: string) {
    setForm(f => ({ ...f, [key]: val }))
    setErros(e => { const n = { ...e }; delete n[key]; return n })
  }

  function validar() {
    const novos: Record<string, string> = {}
    if (!form.nome.trim()) novos.nome = 'Nome é obrigatório'
    setErros(novos)
    return Object.keys(novos).length === 0
  }

  function abrirNovo() {
    setEditColab(null); setForm(FORM_VAZIO)
    setSection('pessoal'); setErros({}); setErroGeral('')
    setShowModal(true)
  }

  function abrirEdicao(c: Colaborador) {
    setEditColab(c)
    setForm({
      nome:        c.nome,
      email:       c.email ?? '',
      telefone:    c.telefone ?? '',
      cpf:         c.cpf ?? '',
      cargo:       c.cargo,
      cep:         c.cep ?? '',
      rua:         c.rua ?? '',
      numero:      c.numero ?? '',
      complemento: c.complemento ?? '',
      bairro:      c.bairro ?? '',
      cidade:      c.cidade ?? '',
      estado:      c.estado ?? '',
      dt_admissao: c.dt_admissao ?? '',
      salario:     c.salario != null ? String(c.salario) : '',
      observacoes: c.observacoes ?? '',
    })
    setSection('pessoal'); setErros({}); setErroGeral('')
    setShowModal(true)
  }

  function fecharModal() {
    setShowModal(false); setEditColab(null)
    setForm(FORM_VAZIO); setErros({}); setErroGeral('')
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) { setSection('pessoal'); return }
    setSalvando(true); setErroGeral('')

    const payload = {
      nome:        form.nome.trim(),
      email:       form.email.trim() || null,
      telefone:    form.telefone.trim() || null,
      cpf:         form.cpf.trim() || null,
      cargo:       form.cargo,
      cep:         form.cep.trim() || null,
      rua:         form.rua.trim() || null,
      numero:      form.numero.trim() || null,
      complemento: form.complemento.trim() || null,
      bairro:      form.bairro.trim() || null,
      cidade:      form.cidade.trim() || null,
      estado:      form.estado.trim() || null,
      dt_admissao: form.dt_admissao || null,
      salario:     form.salario ? parseFloat(form.salario.replace(',', '.')) : null,
      observacoes: form.observacoes.trim() || null,
    }

    try {
      const sb = supabase as any
      if (editColab) {
        const { error } = await sb.from('colaboradores').update(payload).eq('id', editColab.id)
        if (error) throw error
      } else {
        const { error } = await sb.from('colaboradores').insert({ ...payload, escola_id: escolaId, ativo: true })
        if (error) throw error
      }
      fecharModal()
      startTransition(() => router.refresh())
    } catch (err: any) {
      setErroGeral(err.message ?? 'Erro ao salvar.')
    } finally {
      setSalvando(false)
    }
  }

  async function toggleAtivo(c: Colaborador) {
    await (supabase as any).from('colaboradores').update({ ativo: !c.ativo }).eq('id', c.id)
    startTransition(() => router.refresh())
  }

  async function confirmarDelete() {
    if (!deleteColab) return
    setDeletando(true)
    await (supabase as any).from('colaboradores').delete().eq('id', deleteColab.id)
    setDeleteColab(null); setDeletando(false)
    startTransition(() => router.refresh())
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Colaboradores</h1>
        <p className="text-muted-foreground mt-1">Gerencie a equipe da escola — professoras, auxiliares e apoio.</p>
      </div>

      {/* KPIs */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="bg-white rounded-lg shadow-soft px-5 py-4 min-w-[120px]">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</p>
          <p className="text-3xl font-bold mt-1">{colaboradores.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft px-5 py-4 min-w-[120px]">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ativos</p>
          <p className="text-3xl font-bold mt-1 text-emerald-600">{totalAtivos}</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft px-5 py-4 min-w-[120px]">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Inativos</p>
          <p className="text-3xl font-bold mt-1 text-slate-400">{colaboradores.length - totalAtivos}</p>
        </div>
        {feriasAlert.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-soft px-5 py-4 min-w-[160px] flex items-center gap-3">
            <Calendar className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Férias a vencer</p>
              <p className="text-2xl font-bold text-amber-600 mt-0.5">{feriasAlert.length} colaborador{feriasAlert.length > 1 ? 'es' : ''}</p>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10 h-10 min-h-0" />
        </div>
        <select value={filtroCargo} onChange={e => setFiltroCargo(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">Todos os cargos</option>
          {CARGOS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <Button onClick={abrirNovo} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Novo Colaborador
        </Button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <div className="hidden lg:grid grid-cols-[2fr_1.2fr_1fr_1fr_80px_80px] gap-4 px-6 py-3 border-b border-border/50">
          {['Colaborador','Cargo','Admissão','Férias vencem','Status','Ações'].map(h => (
            <p key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</p>
          ))}
        </div>

        <div className="divide-y divide-border/30">
          {filtrados.length === 0
            ? <p className="py-16 text-center text-muted-foreground text-sm">Nenhum colaborador encontrado.</p>
            : filtrados.map(c => {
                const info        = cargoInfo(c.cargo)
                const initials    = c.nome.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()
                const vencFerias  = calcVencFerias(c.dt_admissao)
                const diasFerias  = diasParaVencer(vencFerias)
                const feriasVencida  = diasFerias !== null && diasFerias < 0
                const feriasUrgente  = diasFerias !== null && diasFerias >= 0 && diasFerias <= 30

                return (
                  <div key={c.id} className="grid grid-cols-[1fr_auto] lg:grid-cols-[2fr_1.2fr_1fr_1fr_80px_80px] gap-4 items-center px-6 py-4 hover:bg-muted/30 transition-colors">
                    {/* Nome */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">{initials}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{c.nome}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.email ?? c.telefone ?? '—'}</p>
                      </div>
                    </div>

                    {/* Cargo */}
                    <span className={`hidden lg:inline-flex text-xs font-bold px-2.5 py-1 rounded-full w-fit ${info.color}`}>
                      {info.label}
                    </span>

                    {/* Admissão */}
                    <p className="hidden lg:block text-sm text-foreground">{formatDate(c.dt_admissao)}</p>

                    {/* Férias — calculado automaticamente da admissão */}
                    <div className="hidden lg:block">
                      {vencFerias
                        ? <div>
                            <span className={`text-sm font-semibold ${feriasVencida ? 'text-red-600' : feriasUrgente ? 'text-amber-600' : 'text-foreground'}`}>
                              {formatDate(vencFerias)}
                            </span>
                            {feriasVencida && (
                              <span className="ml-1.5 text-xs font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">VENCIDA</span>
                            )}
                            {feriasUrgente && (
                              <span className="ml-1.5 text-xs font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">⚠ {diasFerias}d</span>
                            )}
                          </div>
                        : <span className="text-sm text-muted-foreground">Sem admissão</span>
                      }
                    </div>

                    {/* Status toggle */}
                    <button onClick={() => toggleAtivo(c)} title={c.ativo ? 'Desativar' : 'Ativar'}
                      className="hidden lg:flex items-center gap-1 text-xs font-semibold transition-colors">
                      {c.ativo
                        ? <><ToggleRight className="w-5 h-5 text-emerald-500" /><span className="text-emerald-600">Ativo</span></>
                        : <><ToggleLeft  className="w-5 h-5 text-slate-400"   /><span className="text-slate-400">Inativo</span></>
                      }
                    </button>

                    {/* Ações */}
                    <div className="flex items-center gap-1">
                      <button onClick={() => abrirEdicao(c)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteColab(c)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
          }
        </div>

        {filtrados.length > 0 && (
          <div className="px-6 py-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">Exibindo {filtrados.length} de {colaboradores.length}</p>
          </div>
        )}
      </div>

      {/* ══ Modal Novo / Editar ══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={fecharModal} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-lg z-10 flex flex-col max-h-[92vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-black text-slate-800">
                  {editColab ? 'Editar Colaborador' : 'Novo Colaborador'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Campos com * são obrigatórios</p>
              </div>
              <button onClick={fecharModal} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Tabs de seção */}
            <div className="flex border-b border-slate-100 shrink-0 px-6">
              {SECTIONS.map(s => (
                <button key={s.id} type="button" onClick={() => setSection(s.id)}
                  className={`py-3 px-1 mr-5 text-sm font-bold border-b-2 transition-colors
                    ${section === s.id ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  {s.label}
                </button>
              ))}
            </div>

            <form onSubmit={salvar} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto flex-1 px-6 py-5">

                {/* ── Dados Pessoais ── */}
                {section === 'pessoal' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-700">Nome completo *</Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input placeholder="Ex: Maria Silva" value={form.nome} onChange={e => campo('nome', e.target.value)}
                          className={`pl-10 ${erros.nome ? 'border-red-400' : ''}`} />
                      </div>
                      {erros.nome && <p className="text-xs text-red-500">{erros.nome}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="font-bold text-slate-700">E-mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input type="email" placeholder="email@exemplo.com" value={form.email}
                            onChange={e => campo('email', e.target.value)} className="pl-10" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-bold text-slate-700">Telefone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input type="tel" placeholder="(11) 99999-9999" value={form.telefone}
                            onChange={e => campo('telefone', e.target.value)} className="pl-10" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-700">CPF</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input placeholder="000.000.000-00" value={form.cpf}
                          onChange={e => campo('cpf', e.target.value)} className="pl-10" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Cargo *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {CARGOS.map(c => (
                          <button key={c.value} type="button" onClick={() => campo('cargo', c.value)}
                            className={`py-2 px-3 rounded-xl text-sm font-bold border text-left transition-all
                              ${form.cargo === c.value
                                ? `${c.color} border-current/20 ring-2 ring-current/20`
                                : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Endereço ── */}
                {section === 'endereco' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5 col-span-1">
                        <Label className="font-bold text-slate-700">CEP</Label>
                        <Input placeholder="00000-000" value={form.cep} onChange={e => campo('cep', e.target.value)} />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <Label className="font-bold text-slate-700">Rua / Avenida</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input placeholder="Ex: Rua das Flores" value={form.rua}
                            onChange={e => campo('rua', e.target.value)} className="pl-10" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="font-bold text-slate-700">Número</Label>
                        <Input placeholder="Ex: 123" value={form.numero} onChange={e => campo('numero', e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-bold text-slate-700">Complemento</Label>
                        <Input placeholder="Apto, bloco..." value={form.complemento} onChange={e => campo('complemento', e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-700">Bairro</Label>
                      <Input placeholder="Ex: Centro" value={form.bairro} onChange={e => campo('bairro', e.target.value)} />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5 col-span-2">
                        <Label className="font-bold text-slate-700">Cidade</Label>
                        <Input placeholder="Ex: São Paulo" value={form.cidade} onChange={e => campo('cidade', e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-bold text-slate-700">Estado</Label>
                        <select value={form.estado} onChange={e => campo('estado', e.target.value)}
                          className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-none focus:ring-2 focus:ring-primary/20">
                          <option value="">UF</option>
                          {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf =>
                            <option key={uf} value={uf}>{uf}</option>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Contrato ── */}
                {section === 'contrato' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-700">Data de Admissão</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input type="date" value={form.dt_admissao}
                          onChange={e => campo('dt_admissao', e.target.value)} className="pl-10" />
                      </div>
                      {form.dt_admissao && (
                        <p className="text-xs text-primary font-semibold mt-1">
                          📅 Férias vencem automaticamente em: <strong>{formatDate(calcVencFerias(form.dt_admissao))}</strong>
                          <span className="ml-1 text-slate-400 font-normal">(CLT: 12m aquisitivo + 12m concessivo)</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-700">Salário (R$)</Label>
                      <div className="relative">
                        <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input type="number" step="0.01" placeholder="0,00" value={form.salario}
                          onChange={e => campo('salario', e.target.value)} className="pl-10" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-700">Observações</Label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <textarea value={form.observacoes} onChange={e => campo('observacoes', e.target.value)}
                          rows={4} placeholder="Informações adicionais, documentos pendentes..."
                          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-base outline-none resize-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                      </div>
                    </div>
                  </div>
                )}

                {erroGeral && (
                  <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{erroGeral}</div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
                {section !== 'pessoal'
                  ? <Button type="button" variant="outline" className="flex-1"
                      onClick={() => setSection(section === 'contrato' ? 'endereco' : 'pessoal')}>
                      ← Anterior
                    </Button>
                  : <Button type="button" variant="outline" className="flex-1" onClick={fecharModal}>Cancelar</Button>
                }
                {section !== 'contrato'
                  ? <Button type="button" className="flex-1"
                      onClick={() => setSection(section === 'pessoal' ? 'endereco' : 'contrato')}>
                      Próximo →
                    </Button>
                  : <Button type="submit" className="flex-1" disabled={salvando}>
                      {salvando ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : editColab ? 'Salvar Alterações' : 'Adicionar'}
                    </Button>
                }
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Modal Confirmar Exclusão ══ */}
      {deleteColab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deletando && setDeleteColab(null)} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-sm z-10 p-6 animate-fade-in">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Excluir Colaborador</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Tem certeza que deseja excluir <span className="font-bold text-slate-700">{deleteColab.nome}</span>?
                </p>
              </div>
              <div className="flex gap-3 w-full mt-1">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteColab(null)} disabled={deletando}>Cancelar</Button>
                <Button variant="destructive" className="flex-1" onClick={confirmarDelete} disabled={deletando}>
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
