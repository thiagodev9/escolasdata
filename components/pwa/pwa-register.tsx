'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, Download, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props { userId: string; escolaId: string }

export function PWARegister({ userId, escolaId }: Props) {
  const [swReg,       setSwReg]       = useState<ServiceWorkerRegistration | null>(null)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [showBanner,  setShowBanner]  = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const sb = createClient() as any

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').then(reg => {
      setSwReg(reg)
      if (Notification.permission === 'granted') {
        reg.pushManager.getSubscription().then(sub => setPushEnabled(!!sub))
      } else if (Notification.permission === 'default') {
        setTimeout(() => setShowBanner(true), 3000)
      }
    })

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    })
  }, [])

  async function enablePush() {
    if (!swReg) return
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) { console.warn('VAPID key not configured'); return }

    const sub = await swReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(vapidKey),
    })

    const { endpoint, keys } = sub.toJSON() as any
    await sb.from('push_subscriptions').upsert({
      usuario_id: userId,
      escola_id:  escolaId,
      endpoint,
      p256dh: keys.p256dh,
      auth:   keys.auth,
    })

    setPushEnabled(true)
    setShowBanner(false)
  }

  async function disablePush() {
    if (!swReg) return
    const sub = await swReg.pushManager.getSubscription()
    if (sub) {
      await sub.unsubscribe()
      await sb.from('push_subscriptions').delete().eq('usuario_id', userId).eq('endpoint', sub.endpoint)
    }
    setPushEnabled(false)
  }

  async function installApp() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setDeferredPrompt(null)
  }

  if (!showBanner && !deferredPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      {/* Banner de notificações */}
      {showBanner && (
        <div className="bg-navy text-white rounded-xl shadow-modal p-4 flex items-start gap-3 mb-2">
          <Bell className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold">Ativar notificações</p>
            <p className="text-xs text-white/70 mt-0.5">Receba alertas de diário, pagamentos e comunicados.</p>
            <div className="flex gap-2 mt-3">
              <button onClick={enablePush}
                className="flex-1 bg-accent text-white rounded-md py-1.5 text-xs font-semibold hover:bg-accent/90">
                Ativar
              </button>
              <button onClick={() => setShowBanner(false)}
                className="flex-1 bg-white/10 text-white rounded-md py-1.5 text-xs font-semibold hover:bg-white/20">
                Agora não
              </button>
            </div>
          </div>
          <button onClick={() => setShowBanner(false)} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Banner instalar app */}
      {deferredPrompt && (
        <div className="bg-white rounded-xl shadow-modal p-4 flex items-center gap-3 border border-border">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Instalar EduNest</p>
            <p className="text-xs text-muted-foreground">Adicione à tela inicial para acesso rápido.</p>
          </div>
          <button onClick={installApp}
            className="bg-primary text-white rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-primary/90">
            Instalar
          </button>
        </div>
      )}
    </div>
  )
}

function urlB64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from(raw, c => c.charCodeAt(0))
}
