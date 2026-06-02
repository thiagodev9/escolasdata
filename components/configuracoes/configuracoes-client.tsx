'use client'

import { useState } from 'react'
import { Save, Plus, Trash2, Shield, User, School, Zap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ROLE_LABEL: Record<string, string> = {
  diretora: 'Diretora', professora: 'Professora',
  responsavel: 'Responsável', super_admin: 'Super Admin',
}
const ROLE_COLORS: Record<string, string> = {
  diretora: 'bg-primary/10 text-primary',
  professora: 'bg-purple-100 text-purple-700',
  responsavel: 'bg-green-100 text-green-700',
  super_admin: 'bg-red-100 text-red-600',
}

const ABAS = [
  { id: 'escola',    label: 'Escola',       icon: School  },
  { id: 'usuarios',  label: 'Usuários',     icon: User    },
  { id: 'plano',     label: 'Plano',        icon: Shield  },
  { id: 'integracoes',label: 'Integrações', icon: Zap     },
]

interface Props {
  escola: any
  usuarios: any[]
  escolaId: string
}

export function ConfiguracoesClient({ escola, usuarios, escolaId }: Props) {
  const [aba, setAba]     = useState('escola')
  const [nome, setNome]   = useState(escola?.nome ?? '')
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg]     = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function salvarEscola(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true); setMsg('')
    const { error } = await (supabase as any).from('escolas').update({ nome }).eq('id', escolaId)
    setSalvando(false)
    setMsg(error ? 'Erro ao salvar.' : 'Salvo com sucesso!')
    if (!error) router.refresh()
  }

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      {/* Sidebar abas */}
      <nav className="lg:w-48 flex lg:flex-col gap-1 flex-row flex-wrap">
        {ABAS.map(a => {
          const Icon = a.icon
          return (
            <button key={a.id} onClick={() => setAba(a.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors text-left w-full
                ${aba === a.id ? 'bg-primary text-white' : 'text-foreground hover:bg-muted'}`}>
              <Icon className="w-4 h-4 shrink-0" />
              {a.label}
            </button>
          )
        })}
      </nav>

      {/* Conteúdo */}
      <div className="flex-1">

        {/* Aba Escola */}
        {aba === 'escola' && (
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-lg font-bold mb-6">Dados da Escola</h2>
            <form onSubmit={salvarEscola} className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <Label>Nome da escola</Label>
                <Input value={nome} onChange={e => setNome(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Slug (URL)</Label>
                <Input value={escola?.slug ?? ''} disabled className="opacity-60 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">O slug não pode ser alterado após a criação.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Plano atual</Label>
                <div className="flex items-center gap-2 h-12 px-4 border border-primary/20 rounded bg-muted/50">
                  <span className="font-semibold capitalize">{escola?.plano ?? 'basico'}</span>
                  <span className="ml-auto text-xs text-primary font-semibold cursor-pointer hover:underline">Fazer upgrade →</span>
                </div>
              </div>
              {msg && <p className={`text-sm px-3 py-2 rounded ${msg.includes('Erro') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>{msg}</p>}
              <Button type="submit" disabled={salvando} className="gap-2">
                {salvando ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : <><Save className="w-4 h-4" />Salvar</>}
              </Button>
            </form>
          </div>
        )}

        {/* Aba Usuários */}
        {aba === 'usuarios' && (
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Usuários</h2>
              <button className="flex items-center gap-2 bg-primary text-white rounded-md px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors min-h-[40px]">
                <Plus className="w-4 h-4" /> Convidar
              </button>
            </div>
            <div className="space-y-2">
              {usuarios.map(u => (
                <div key={u.id} className="flex items-center gap-4 p-3 rounded-md border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {u.nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{u.nome}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                    {ROLE_LABEL[u.role] ?? u.role}
                  </span>
                  <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aba Plano */}
        {aba === 'plano' && (
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-lg font-bold mb-6">Plano e Faturamento</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { id: 'basico',       nome: 'Básico',       preco: 'R$ 97/mês',  features: ['Até 50 alunos','1 escola','Suporte por email'] },
                { id: 'profissional', nome: 'Profissional', preco: 'R$ 197/mês', features: ['Até 300 alunos','Feed de turma','WhatsApp','Financeiro'] },
                { id: 'enterprise',   nome: 'Enterprise',   preco: 'Sob consulta',features: ['Alunos ilimitados','Multi-unidades','API','SLA dedicado'] },
              ].map(p => (
                <div key={p.id} className={`rounded-lg p-5 border-2 transition-all ${
                  escola?.plano === p.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                }`}>
                  <p className="font-bold text-lg">{p.nome}</p>
                  <p className="text-primary font-bold mt-1">{p.preco}</p>
                  <ul className="mt-3 space-y-1">
                    {p.features.map(f => <li key={f} className="text-xs text-muted-foreground flex items-center gap-1">✓ {f}</li>)}
                  </ul>
                  {escola?.plano !== p.id && (
                    <button className="mt-4 w-full py-2 rounded-md border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors">
                      Selecionar
                    </button>
                  )}
                  {escola?.plano === p.id && (
                    <p className="mt-4 text-xs text-center text-primary font-semibold">Plano atual ✓</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aba Integrações */}
        {aba === 'integracoes' && (
          <div className="bg-white rounded-lg shadow-soft p-6 space-y-6">
            <h2 className="text-lg font-bold">Integrações</h2>
            {[
              { nome: 'Asaas (Pagamentos)', desc: 'PIX, boleto e cartão de crédito. Configure sua chave API do Asaas.', env: 'ASAAS_API_KEY', placeholder: '$aact_...' },
              { nome: 'Evolution API (WhatsApp)', desc: 'Envio de mensagens automáticas via WhatsApp Business.', env: 'EVOLUTION_API_KEY', placeholder: 'sua-api-key' },
            ].map(int => (
              <div key={int.nome} className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-bold text-sm">{int.nome}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{int.desc}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold shrink-0">
                    Não configurado
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input placeholder={int.placeholder} className="text-sm h-9 min-h-0 flex-1" type="password" />
                  <Button size="sm" className="min-h-0 h-9 px-4 text-xs">Salvar</Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Configure no <code className="bg-muted px-1 rounded">.env.local</code>: <code className="bg-muted px-1 rounded">{int.env}</code>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
