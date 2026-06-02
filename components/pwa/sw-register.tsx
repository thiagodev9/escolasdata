'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export function SwRegister() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showBanner, setShowBanner]       = useState(false)

  useEffect(() => {
    /* Registra o service worker */
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(() => {})
    }

    /* Captura o evento beforeinstallprompt */
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      const dismissed = sessionStorage.getItem('pwa-banner-dismissed')
      if (!dismissed) setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    await installPrompt.prompt()
    setShowBanner(false)
  }

  function handleDismiss() {
    sessionStorage.setItem('pwa-banner-dismissed', '1')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-white rounded-2xl shadow-modal border border-slate-100 p-4 flex items-center gap-3">
        {/* Ícone KTX */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: '#2563EB' }}
        >
          <span className="text-white font-black text-sm" style={{ letterSpacing: '-1px' }}>KTX</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800">Instalar KTX Academy</p>
          <p className="text-xs text-slate-500">Acesso rápido, funciona offline</p>
        </div>

        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-primary/90 transition-all shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Instalar
        </button>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
