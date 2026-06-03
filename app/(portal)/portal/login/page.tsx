'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Mail, Footprints, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSearchParams } from 'next/navigation'

export default function PortalLoginPage() {
  const searchParams = useSearchParams()
  const erroParam = searchParams.get('erro')

  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)

    const res = await fetch('/api/portal/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setEnviando(false)

    if (!res.ok) {
      const data = await res.json()
      setErro(data.error ?? 'Erro ao enviar link. Tente novamente.')
      return
    }

    setEnviado(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-slate-100">

        <div className="flex flex-col items-center mb-8">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Footprints className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-orange-400 border-2 border-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Portal da Família</h1>
          <p className="text-sm text-slate-500 mt-1">Acompanhe seu filho na escola</p>
        </div>

        {enviado ? (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Link enviado!</h2>
              <p className="text-sm text-slate-500 mt-2">
                Verifique o e-mail <strong>{email}</strong> e clique no link para acessar.
              </p>
              <p className="text-xs text-slate-400 mt-3">Verifique também a pasta de spam.</p>
            </div>
            <button
              onClick={() => { setEnviado(false); setEmail('') }}
              className="text-xs text-blue-500 underline mt-2"
            >
              Usar outro e-mail
            </button>
          </div>
        ) : (
          <>
            {erroParam === 'nao-cadastrado' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 mb-4">
                Este e-mail não está cadastrado como responsável. Entre em contato com a escola.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-sm">Seu e-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="nome@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {erro && (
                <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                  {erro}
                </div>
              )}

              <Button type="submit" className="w-full gap-2" disabled={enviando}>
                {enviando
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                  : 'Enviar link de acesso'}
              </Button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-6">
              Acesso exclusivo para responsáveis cadastrados pela escola
            </p>
          </>
        )}
      </div>
    </div>
  )
}
