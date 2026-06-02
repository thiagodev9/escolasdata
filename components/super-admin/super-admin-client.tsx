'use client'

import { useState } from 'react'
import {
  Building2, Plus, Users, BookOpen, GraduationCap,
  Check, X, AlertCircle, Loader2, ExternalLink, Shield,
  UserPlus, Mail, Lock, Eye, EyeOff, CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Escola, Plano } from '@/lib/supabase/types'

interface EscolaWithStats extends Escola {
  total_alunos:   number
  total_usuarios: number
  cnpj:           string | null
  telefone:       string | null
  onboarding_completo: boolean
}

interface Props {
  escolas: EscolaWithStats[]
}

const PLANO_COLOR: Record<Plano, string> = {
  basico:        'bg-gray-100 text-gray-700',
  profissional:  'bg-blue-100 text-blue-700',
  enterprise:    'bg-purple-100 text-purple-700',
}

const PLANO_LABEL: Record<Plano, string> = {
  basico:       'Básico',
  profissional: 'Profissional',
  enterprise:   'Enterprise',
}

export function SuperAdminClient({ escolas: inicial }: Props) {
  const [escolas,     setEscolas]     = useState(inicial)
  const [showModal,   setShowModal]   = useState(false)
  const [salvando,    setSalvando]    = useState(false)
  const [erro,        setErro]        = useState('')
  const [nomeBusca,   setNomeBusca]   = useState('')

  // Form nova escola
  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [plano, setPlano] = useState<Plano>('basico')

  // Modal novo usuário
  const [escolaAlvo, setEscolaAlvo]   = useState<EscolaWithStats | null>(null)
  const [uNome, setUNome]             = useState('')
  const [uEmail, setUEmail]           = useState('')
  const [uSenha, setUSenha]           = useState('')
  const [uRole, setURole]             = useState<'diretora' | 'professora'>('diretora')
  const [showSenha, setShowSenha]     = useState(false)
  const [uSalvando, setUSalvando]     = useState(false)
  const [uErro, setUErro]             = useState('')
  const [uSucesso, setUSucesso]       = useState(false)

  function gerarSlug(nome: string) {
    return nome.toLowerCase().trim()
      .replace(/[àáâãä]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function criarEscola(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !slug.trim()) { setErro('Nome e slug são obrigatórios.'); return }
    setSalvando(true); setErro('')
    try {
      const res = await fetch('/api/escolas', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nome, slug, plano }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      window.location.reload()
    } catch (e: any) { setErro(e.message) }
    finally { setSalvando(false) }
  }

  function abrirNovoUsuario(escola: EscolaWithStats) {
    setEscolaAlvo(escola); setUNome(''); setUEmail(''); setUSenha('')
    setURole('diretora'); setUErro(''); setUSucesso(false)
  }

  async function criarUsuario(e: React.FormEvent) {
    e.preventDefault()
    if (!uNome || !uEmail || !uSenha) { setUErro('Preencha todos os campos.'); return }
    if (uSenha.length < 6) { setUErro('Senha mínima: 6 caracteres.'); return }
    setUSalvando(true); setUErro('')
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: uNome, email: uEmail, senha: uSenha, role: uRole, escola_id: escolaAlvo!.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setUSucesso(true)
      setEscolas(prev => prev.map(e => e.id === escolaAlvo!.id
        ? { ...e, total_usuarios: e.total_usuarios + 1 }
        : e
      ))
    } catch (err: any) { setUErro(err.message) }
    finally { setUSalvando(false) }
  }

  const filtradas = escolas.filter(e =>
    !nomeBusca || e.nome.toLowerCase().includes(nomeBusca.toLowerCase())
  )

  const totalAlunos   = escolas.reduce((s, e) => s + e.total_alunos, 0)
  const totalEscolas  = escolas.length
  const ativas        = escolas.filter(e => e.ativo).length
  const semOnboarding = escolas.filter(e => !e.onboarding_completo).length

  return (
    <div>
      {/* KPIs globais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Escolas',          value: totalEscolas,  icon: Building2,    color: 'text-primary'  },
          { label: 'Ativas',           value: ativas,        icon: Check,        color: 'text-green-600'},
          { label: 'Total de Alunos',  value: totalAlunos,   icon: GraduationCap,color: 'text-blue-600' },
          { label: 'Sem Onboarding',   value: semOnboarding, icon: AlertCircle,  color: 'text-amber-500'},
        ].map(k => {
          const Icon = k.icon
          return (
            <div key={k.label} className="bg-white rounded-lg shadow-soft p-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                <Icon className={`w-5 h-5 ${k.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Busca + nova escola */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <input
          value={nomeBusca}
          onChange={e => setNomeBusca(e.target.value)}
          placeholder="Buscar escola..."
          className="flex-1 h-10 rounded-lg border border-border bg-white px-4 text-sm focus:border-primary outline-none min-w-48"
        />
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Nova Escola
        </Button>
      </div>

      {/* Lista de escolas */}
      <div className="space-y-3">
        {filtradas.map(escola => (
          <div key={escola.id} className="bg-white rounded-lg border border-border shadow-soft p-5">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-10 h-10 bg-[#1B3A6B] rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base">{escola.nome}</h3>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${PLANO_COLOR[escola.plano]}`}>
                    {PLANO_LABEL[escola.plano]}
                  </span>
                  {!escola.ativo && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Inativa</span>
                  )}
                  {!escola.onboarding_completo && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Onboarding pendente</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">slug: {escola.slug} · {escola.cnpj ?? 'CNPJ não informado'}</p>

                <div className="flex items-center gap-4 mt-3">
                  <Stat icon={GraduationCap} label={`${escola.total_alunos} alunos`} />
                  <Stat icon={Users}         label={`${escola.total_usuarios} usuários`} />
                  <Stat icon={Shield}        label={escola.onboarding_completo ? 'Configurada' : 'Setup pendente'} />
                </div>
              </div>

              <div className="flex gap-2 shrink-0 flex-wrap">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8"
                  onClick={() => abrirNovoUsuario(escola)}>
                  <UserPlus className="w-3.5 h-3.5" /> Adicionar Usuário
                </Button>
                <a href={`/matricula/${escola.slug}`} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 h-8">
                  <ExternalLink className="w-3 h-3" /> Matrícula
                </a>
              </div>
            </div>

            {/* Barra de crescimento */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min((escola.total_alunos / 200) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {escola.total_alunos}/200 alunos
              </span>
            </div>
          </div>
        ))}

        {filtradas.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">Nenhuma escola encontrada</p>
          </div>
        )}
      </div>

      {/* ══ Modal Novo Usuário ══ */}
      {escolaAlvo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="font-black text-lg text-slate-800">Adicionar Usuário</h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[240px]">{escolaAlvo.nome}</p>
              </div>
              <button onClick={() => setEscolaAlvo(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {uSucesso ? (
              <div className="p-8 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Usuário criado!</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    <strong>{uEmail}</strong> pode acessar o sistema com a senha definida.
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-2">
                  <Button variant="outline" className="flex-1" onClick={() => { setUSucesso(false); setUNome(''); setUEmail(''); setUSenha('') }}>
                    Adicionar outro
                  </Button>
                  <Button className="flex-1" onClick={() => setEscolaAlvo(null)}>Fechar</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={criarUsuario} className="p-6 space-y-4">
                {/* Cargo */}
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Cargo *</Label>
                  <div className="flex gap-2">
                    {(['diretora', 'professora'] as const).map(r => (
                      <button key={r} type="button" onClick={() => setURole(r)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors
                          ${uRole === r
                            ? r === 'diretora' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                        {r === 'diretora' ? 'Diretora' : 'Professora'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nome */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Nome completo *</Label>
                  <Input placeholder="Ex: Maria Silva" value={uNome} onChange={e => setUNome(e.target.value)} autoFocus />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">E-mail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input type="email" placeholder="usuario@escola.com" value={uEmail}
                      onChange={e => setUEmail(e.target.value)} className="pl-10" />
                  </div>
                </div>

                {/* Senha */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Senha inicial *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input type={showSenha ? 'text' : 'password'} placeholder="Mínimo 6 caracteres"
                      value={uSenha} onChange={e => setUSenha(e.target.value)} className="pl-10 pr-10" />
                    <button type="button" onClick={() => setShowSenha(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">O usuário poderá trocar a senha depois.</p>
                </div>

                {uErro && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{uErro}</div>
                )}

                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setEscolaAlvo(null)}>Cancelar</Button>
                  <Button type="submit" className="flex-1 gap-2" disabled={uSalvando}>
                    {uSalvando ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando...</> : <><UserPlus className="w-4 h-4" /> Criar Usuário</>}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal nova escola */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-bold text-lg">Nova Escola</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={criarEscola} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label>Nome da escola *</Label>
                <input
                  value={nome}
                  onChange={e => { setNome(e.target.value); setSlug(gerarSlug(e.target.value)) }}
                  placeholder="Ex: Escola Girassol"
                  className="flex h-11 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug (URL) *</Label>
                <input
                  value={slug}
                  onChange={e => setSlug(gerarSlug(e.target.value))}
                  placeholder="escola-girassol"
                  className="flex h-11 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  URL de matrícula: /matricula/{slug || 'escola-slug'}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Plano</Label>
                <select value={plano} onChange={e => setPlano(e.target.value as Plano)}
                  className="flex h-11 w-full rounded border border-border bg-white px-3 text-sm focus:border-primary outline-none">
                  <option value="basico">Básico</option>
                  <option value="profissional">Profissional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              {erro && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{erro}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button type="submit" disabled={salvando} className="gap-2">
                  {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Criar Escola
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  )
}
