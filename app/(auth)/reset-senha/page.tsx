'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, CheckCircle2, Loader2, Footprints } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function ResetSenhaPage() {
  const router  = useRouter()
  const supabase = createClient()

  const [novaSenha, setNovaSenha]         = useState('')
  const [confirmar, setConfirmar]         = useState('')
  const [showNova, setShowNova]           = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [salvando, setSalvando]           = useState(false)
  const [erro, setErro]                   = useState('')
  const [sucesso, setSucesso]             = useState(false)
  const [sessaoOk, setSessaoOk]           = useState(false)

  // Supabase envia o token via hash fragment — detecta quando a sessão é restaurada
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessaoOk(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (novaSenha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }

    setSalvando(true)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setSalvando(false)

    if (error) {
      setErro('Não foi possível redefinir a senha. O link pode ter expirado.')
      return
    }

    setSucesso(true)
    setTimeout(() => router.push('/login'), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-modal p-8 w-full max-w-md border border-slate-100">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-float" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Footprints className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-orange-400 border-2 border-white shadow-sm" />
          </div>
        </div>

        {sucesso ? (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Senha redefinida!</h2>
              <p className="text-sm text-slate-500 mt-2">
                Sua senha foi atualizada com sucesso.<br />
                Redirecionando para o login...
              </p>
            </div>
            <div className="w-8 h-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
          </div>
        ) : !sessaoOk ? (
          <div className="flex flex-col items-center text-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div>
              <h2 className="text-lg font-black text-slate-800">Verificando link...</h2>
              <p className="text-sm text-slate-500 mt-1">
                Aguarde enquanto validamos seu link de recuperação.
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Se demorar, o link pode ter expirado.{' '}
              <button onClick={() => router.push('/login')} className="text-primary underline">
                Voltar ao login
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-slate-800">Nova senha</h2>
              <p className="text-sm text-slate-500 mt-1">Escolha uma senha segura para sua conta.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-sm">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input type={showNova ? 'text' : 'password'} placeholder="Mínimo 6 caracteres"
                    value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                    className="pl-10 pr-10" required autoFocus />
                  <button type="button" onClick={() => setShowNova(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                    {showNova ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-sm">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input type={showConfirmar ? 'text' : 'password'} placeholder="Repita a nova senha"
                    value={confirmar} onChange={e => setConfirmar(e.target.value)}
                    className={`pl-10 pr-10 ${confirmar && confirmar !== novaSenha ? 'border-red-400' : ''}`} required />
                  <button type="button" onClick={() => setShowConfirmar(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                    {showConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmar && confirmar !== novaSenha && (
                  <p className="text-xs text-red-500">As senhas não coincidem</p>
                )}
              </div>

              {/* Indicador de força */}
              {novaSenha && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(n => (
                      <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${
                        novaSenha.length >= n * 3
                          ? n <= 1 ? 'bg-red-400' : n <= 2 ? 'bg-amber-400' : n <= 3 ? 'bg-blue-400' : 'bg-emerald-500'
                          : 'bg-slate-100'
                      }`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    {novaSenha.length < 4 ? 'Muito fraca' : novaSenha.length < 7 ? 'Fraca' : novaSenha.length < 10 ? 'Boa' : 'Forte'}
                  </p>
                </div>
              )}

              {erro && (
                <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">{erro}</div>
              )}

              <Button type="submit" className="w-full gap-2 mt-2" disabled={salvando}>
                {salvando ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Redefinir senha'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
