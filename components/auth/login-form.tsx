'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Footprints, ArrowRight, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/alunos'

  const [email, setEmail]         = useState('')
  const [senha, setSenha]         = useState('')
  const [lembrar, setLembrar]     = useState(false)
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [erro, setErro]           = useState('')

  // Recuperação de senha
  const [telaRecuperar, setTelaRecuperar] = useState(false)
  const [emailRecuperar, setEmailRecuperar] = useState('')
  const [enviando, setEnviando]           = useState(false)
  const [enviado, setEnviado]             = useState(false)
  const [erroRecuperar, setErroRecuperar] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) { setErro('E-mail ou senha inválidos. Tente novamente.'); setLoading(false); return }
    router.push(redirectTo); router.refresh()
  }

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault()
    if (!emailRecuperar.trim()) { setErroRecuperar('Informe o e-mail.'); return }
    setEnviando(true); setErroRecuperar('')
    const redirectUrl = `${window.location.origin}/reset-senha`
    const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperar.trim(), { redirectTo: redirectUrl })
    setEnviando(false)
    if (error) {
      console.error('Reset password error:', error)
      setErroRecuperar(`Erro: ${error.message}`)
      return
    }
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

  /* ── Tela: Recuperar senha ── */
  if (telaRecuperar) {
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
                Verifique sua caixa de entrada e siga as instruções.
              </p>
            </div>
            <Button variant="outline" className="w-full gap-2 mt-2" onClick={() => { setTelaRecuperar(false); setEnviado(false); setEmailRecuperar('') }}>
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

              <button type="button" onClick={() => setTelaRecuperar(false)}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mt-1">
                <ChevronLeft className="w-3.5 h-3.5" /> Voltar ao login
              </button>
            </form>
          </>
        )}
      </div>
    )
  }

  /* ── Tela: Login ── */
  return (
    <div className="bg-white rounded-3xl shadow-modal p-8 w-full border border-slate-100">
      {logo}
      <div className="flex flex-col items-center mb-8 -mt-4">
        <h1 className="text-2xl font-black text-slate-800">Bem-vindo ao EduNest</h1>
        <p className="text-sm text-slate-500 mt-1 text-center">Acesse sua conta para gerenciar sua escola</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 font-bold text-sm">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input id="email" type="email" placeholder="nome@escola.com" value={email}
              onChange={(e) => setEmail(e.target.value)} className="pl-10" required autoComplete="email" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="senha" className="text-slate-700 font-bold text-sm">Senha</Label>
            <button type="button" onClick={() => { setTelaRecuperar(true); setEmailRecuperar(email) }}
              className="text-xs text-primary hover:underline font-semibold">
              Esqueci a senha
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input id="senha" type={showSenha ? 'text' : 'password'} placeholder="••••••••" value={senha}
              onChange={(e) => setSenha(e.target.value)} className="pl-10 pr-10" required autoComplete="current-password" />
            <button type="button" onClick={() => setShowSenha(v => !v)}
              aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
              {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input id="lembrar" type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)}
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

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-xs text-slate-400 font-medium">ou</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      <div className="text-center">
        <p className="text-sm text-slate-500 mb-3">Ainda não tem o EduNest na sua escola?</p>
        <a href="#" className="inline-flex items-center gap-2 border-2 border-primary/20 text-primary text-sm font-bold px-6 py-2.5 rounded-full hover:bg-primary/5 hover:border-primary/40 transition-all">
          Solicitar Demonstração <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}
