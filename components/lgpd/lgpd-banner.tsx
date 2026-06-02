'use client'

import { useEffect, useState } from 'react'
import { Shield, X, Check } from 'lucide-react'
import Link from 'next/link'

const KEY = 'educare_lgpd_consent'

export function LgpdBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(KEY)
    if (!consent) setShow(true)
  }, [])

  function aceitar() {
    localStorage.setItem(KEY, JSON.stringify({ aceito: true, data: new Date().toISOString() }))
    setShow(false)
  }

  function recusar() {
    localStorage.setItem(KEY, JSON.stringify({ aceito: false, data: new Date().toISOString() }))
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#1B3A6B] text-white shadow-2xl">
      <div className="max-w-4xl mx-auto flex items-start gap-4">
        <Shield className="w-5 h-5 text-[#b54e00] shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold mb-1">Sua privacidade é importante</p>
          <p className="text-xs text-white/70 leading-relaxed">
            Utilizamos cookies e coletamos dados pessoais para operação do serviço, comunicações e segurança,
            conforme nossa{' '}
            <Link href="/privacidade" target="_blank" className="underline font-semibold text-white/90 hover:text-white">
              Política de Privacidade
            </Link>
            {' '}em conformidade com a LGPD (Lei 13.709/2018).
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={recusar}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Recusar
          </button>
          <button
            onClick={aceitar}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-md bg-[#004ac6] hover:bg-[#004ac6]/80 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
