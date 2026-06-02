'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shield, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Suspense } from 'react'

function SolicitarForm() {
  const params  = useSearchParams()
  const escola  = params.get('escola') ?? ''

  const [nome,    setNome]    = useState('')
  const [email,   setEmail]   = useState('')
  const [tipo,    setTipo]    = useState<'exportacao' | 'exclusao' | 'correcao' | 'portabilidade'>('exportacao')
  const [obs,     setObs]     = useState('')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso]  = useState(false)
  const [erro,    setErro]    = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setErro('Informe seu e-mail.'); return }
    if (!escola)       { setErro('Escola não identificada.'); return }

    setSalvando(true); setErro('')
    try {
      // Buscar escola_id pelo slug
      const res = await fetch(`/api/escolas/por-slug?slug=${escola}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Escola não encontrada.')

      const reqRes = await fetch('/api/lgpd/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escola_id:          json.id,
          responsavel_email:  email.trim(),
          responsavel_nome:   nome.trim() || null,
          tipo,
          observacoes:        obs.trim() || null,
        }),
      })
      const reqJson = await reqRes.json()
      if (!reqRes.ok) throw new Error(reqJson.error)
      setSucesso(true)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  if (sucesso) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#1B3A6B] mb-2">Solicitação enviada!</h2>
        <p className="text-gray-600">A escola responderá em até 15 dias úteis.</p>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome (opcional)</Label>
        <input id="nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome"
          className="flex h-12 w-full rounded-lg border border-[#e8e1dc] bg-white px-4 text-sm focus:border-[#004ac6] outline-none" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail *</Label>
        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com"
          className="flex h-12 w-full rounded-lg border border-[#e8e1dc] bg-white px-4 text-sm focus:border-[#004ac6] outline-none" />
      </div>
      <div className="space-y-1.5">
        <Label>Tipo de solicitação</Label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: 'exportacao',    label: 'Exportação de dados' },
            { value: 'exclusao',      label: 'Exclusão de dados' },
            { value: 'correcao',      label: 'Correção de dados' },
            { value: 'portabilidade', label: 'Portabilidade' },
          ] as const).map(t => (
            <button key={t.value} type="button" onClick={() => setTipo(t.value)}
              className={`p-3 rounded-lg border-2 text-sm font-semibold text-left transition-all ${
                tipo === t.value ? 'border-[#004ac6] bg-blue-50 text-[#004ac6]' : 'border-[#e8e1dc] hover:border-[#004ac6]/30'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="obs">Observações</Label>
        <textarea id="obs" value={obs} onChange={e => setObs(e.target.value)} rows={3}
          placeholder="Descreva o que você gostaria..."
          className="w-full rounded-lg border border-[#e8e1dc] bg-white px-4 py-3 text-sm focus:border-[#004ac6] outline-none resize-none" />
      </div>
      {erro && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{erro}</p>}
      <Button type="submit" className="w-full h-12 gap-2" disabled={salvando}>
        {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
        {salvando ? 'Enviando...' : 'Enviar Solicitação'}
      </Button>
    </form>
  )
}

export default function SolicitarLgpdPage() {
  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col">
      <header className="bg-[#1B3A6B] text-white px-6 py-5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Shield className="w-7 h-7 text-[#b54e00]" />
          <p className="text-base font-bold">Solicitação LGPD</p>
        </div>
      </header>
      <div className="flex-1 flex items-start justify-center px-6 py-8">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-xl border border-[#e8e1dc] p-6">
            <h1 className="text-xl font-bold text-[#1B3A6B] mb-1">Exercer meus direitos (LGPD)</h1>
            <p className="text-sm text-gray-500 mb-6">
              Conforme a Lei 13.709/2018, você pode solicitar acesso, correção, exclusão ou exportação dos seus dados pessoais.
            </p>
            <Suspense>
              <SolicitarForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
