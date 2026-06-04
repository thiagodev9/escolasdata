'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Eye, EyeOff, Mail, Lock, Footprints, ArrowRight,
  CheckCircle2, ChevronLeft, Loader2, User, Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

type Modo = 'login' | 'cadastro' | 'recuperar'

export function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirectTo') ?? '/dashboard'

  const modoInicial = searchParams.get('modo') === 'cadastro' ? 'cadastro' : 'login'
  const [modo, setModo] = useState<Modo>(modoInicial)

  // Login
  const [email,     setEmail]     = useState('')
  const [senha,     setSenha]     = useState('')
  const [lembrar,   setLembrar]   = useState(false)
  const [showSenha, setShowSenha] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [erro,      setErro]      = useState('')

  // Cadastro
  const [cNome,      setCNome]      = useState('')
  const [cEscola,    setCEscola]    = useState('')
  const [cEmail,     setCEmail]     = useState('')
  const [cSenha,     setCSenha]     = useState('')
  const [cConfirmar, setCConfirmar] = useState('')
  const [cShowSenha, setCShowSenha] = useState(false)
  const [cLoading,   setCLoading]   = useState(false)
  const [cErro,      setCErro]      = useState('')

  // Recuperação
  const [emailRecuperar, setEmailRecuperar] = useState('')
  const [enviando,       setEnviando]       = useState(false)
  const [enviado,        setEnviado]        = useState(false)
  const [erroRecuperar,  setErroRecuperar]  = useState('')

  const supabase = createClient()

  function trocarModo(m: Modo) {
    setErro(''); setCErro(''); setErroRecuperar('')
    setModo(m)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) { setErro('E-mail ou senha inválidos. Tente novamente.'); setLoading(false); return }
    router.push(redirectTo); router.refresh()
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setCErro('')
    if (cSenha !== cConfirmar) { setCErro('As senhas não coincidem.'); return }
    if (cSenha.length < 6)     { setCErro('A senha deve ter pelo menos 6 caracteres.'); return }

    setCLoading(true)
    const res  = await fetch('/api/auth/cadastrar', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ nome: cNome, nomeEscola: cEscola, email: cEmail, senha: cSenha }),
    })
    const data = await res.json()
    if (!res.ok) { setCErro(data.error ?? 'Erro ao criar conta. Tente novamente.'); setCLoading(false); return }

    // Faz login automático após cadastro
    const { error: loginErr } = await supabase.auth.signInWithPassword({ email: cEmail, password: cSenha })
    if (loginErr) { setCErro('Conta criada! Faça login para continuar.'); setCLoading(false); trocarModo('login'); return }

    router.push('/onboarding'); router.refresh()
  }

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault()
    if (!emailRecuperar.trim()) { setErroRecuperar('Informe o e-mail.'); return }
    setEnviando(true); setErroRecuperar('')
    const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperar.trim(), {
      redirectTo: `${window.location.origin}/reset-senha`,
    })
    setEnviando(false)
    if (error) { setErroRecuperar(error.message); return }
    setEnviado(true)
  }

  const logo = (
    <div className="flex flex-col items-center mb-8">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-float" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Footprints className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-orange-400 border-2 border-white shadow-sm" />
      </div>
    </div>
  )

  /* ── Recuperar senha ── */
  if (modo === 'recuperar') {
    return (
      <div className="bg-white rounded-3xl shadow-modal p-8 w-full border border-slate-100">
        {logo}
        {enviado ? (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">E-mail enviado!</h2>
              <p className="text-sm text-slate-500 mt-2">
                Enviamos um link para <strong>{emailRecuperar}</strong>.<br />
                Verifique sua caixa de entrada.
              </p>
            </div>
            <Button variant="outline" className="w-full gap-2 mt-2"
              onClick={() => { trocarModo('login'); setEnviado(false); setEmailRecuperar('') }}>
              <ChevronLeft className="w-4 h-4" /> Voltar ao login
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-xl font-black text-slate-800">Recuperar senha</h2>
              <p className="text-sm text-slate-500 mt-1">Informe seu e-mail para receber o link de redefinição.</p>
            </div>
            <form onSubmit={handleRecuperar} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-sm">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input type="email" placeholder="nome@escola.com" value={emailRecuperar}
                    onChange={e => setEmailRecuperar(e.target.value)} className="pl-10" required autoFocus />
                </div>
              </div>
              {erroRecuperar && (
                <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">{erroRecuperar}</div>
              )}
              <Button type="submit" className="w-full gap-2" disabled={enviando}>
                {enviando ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <>Enviar link <ArrowRight className="w-4 h-4" /></>}
              </Button>
              <button type="button" onClick={() => trocarModo('login')}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mt-1">
                <ChevronLeft className="w-3.5 h-3.5" /> Voltar ao login
              </button>
            </form>
          </>
        )}
      </div>
    )
  }

  /* ── Cadastro ── */
  if (modo === 'cadastro') {
    return (
      <div className="bg-white rounded-3xl shadow-modal p-8 w-full border border-slate-100">
        {logo}
        <div className="flex flex-col items-center mb-8 -mt-4">
          <h1 className="text-2xl font-black text-slate-800">Criar conta no EduNest</h1>
          <p className="text-sm text-slate-500 mt-1 text-center">Preencha os dados para começar</p>
        </div>

        <form onSubmit={handleCadastro} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">Seu nome</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input type="text" placeholder="Nome completo" value={cNome}
                onChange={e => setCNome(e.target.value)} className="pl-10" required autoFocus />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">Nome da escola</Label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input type="text" placeholder="Ex: Escola Girassol" value={cEscola}
                onChange={e => setCEscola(e.target.value)} className="pl-10" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input type="email" placeholder="nome@escola.com" value={cEmail}
                onChange={e => setCEmail(e.target.value)} className="pl-10" required autoComplete="email" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input type={cShowSenha ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={cSenha}
                onChange={e => setCSenha(e.target.value)} className="pl-10 pr-10" required />
              <button type="button" onClick={() => setCShowSenha(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                {cShowSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">Confirmar senha</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input type="password" placeholder="Repita a senha" value={cConfirmar}
                onChange={e => setCConfirmar(e.target.value)} className="pl-10" required />
            </div>
          </div>

          {cErro && (
            <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100 font-medium">{cErro}</div>
          )}

          <Button type="submit" className="w-full gap-2" disabled={cLoading}>
            {cLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando conta...</>
              : <>Criar conta <ArrowRight className="w-4 h-4" /></>}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Já tem conta?{' '}
          <button type="button" onClick={() => trocarModo('login')}
            className="text-primary font-bold hover:underline">
            Entrar
          </button>
        </p>
      </div>
    )
  }

  /* ── Login ── */
  return (
    <div className="bg-white rounded-3xl shadow-modal p-8 w-full border border-slate-100">
      {logo}
      <div className="flex flex-col items-center mb-8 -mt-4">
        <h1 className="text-2xl font-black text-slate-800">Bem-vindo ao EduNest</h1>
        <p className="text-sm text-slate-500 mt-1 text-center">Acesse sua conta para gerenciar sua escola</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 font-bold text-sm">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input id="email" type="email" placeholder="nome@escola.com" value={email}
              onChange={e => setEmail(e.target.value)} className="pl-10" required autoComplete="email" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="senha" className="text-slate-700 font-bold text-sm">Senha</Label>
            <button type="button" onClick={() => { trocarModo('recuperar'); setEmailRecuperar(email) }}
              className="text-xs text-primary hover:underline font-semibold">
              Esqueci a senha
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input id="senha" type={showSenha ? 'text' : 'password'} placeholder="••••••••" value={senha}
              onChange={e => setSenha(e.target.value)} className="pl-10 pr-10" required autoComplete="current-password" />
            <button type="button" onClick={() => setShowSenha(v => !v)}
              aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
              {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input id="lembrar" type="checkbox" checked={lembrar} onChange={e => setLembrar(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary" />
          <Label htmlFor="lembrar" className="text-sm font-medium text-slate-600 cursor-pointer">Lembrar de mim</Label>
        </div>

        {erro && (
          <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100 font-medium">{erro}</div>
        )}

        <Button type="submit" className="w-full gap-2" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Ainda não tem conta?{' '}
        <button type="button" onClick={() => trocarModo('cadastro')}
          className="text-primary font-bold hover:underline">
          Criar conta grátis
        </button>
      </p>
    </div>
  )
}
