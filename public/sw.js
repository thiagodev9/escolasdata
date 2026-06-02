// KTX Academy Service Worker — PWA offline + notificações push
const CACHE = 'ktx-v1'
const STATIC = [
  '/',
  '/dashboard',
  '/alunos',
  '/agenda',
  '/manifest.webmanifest',
  '/icons/192',
  '/icons/512',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

// Páginas que NÃO devem ser cacheadas (auth e navegação dinâmica)
const NO_CACHE = ['/login', '/reset-senha', '/dashboard', '/alunos', '/turmas',
  '/financeiro', '/gastos', '/colaboradores', '/presenca', '/feed', '/agenda',
  '/comunicados', '/relatorios', '/matriculas', '/nfse', '/lgpd', '/super-admin',
  '/diario', '/diario-massa', '/configuracoes']

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('/api/')) return
  if (e.request.url.includes('supabase.co')) return

  const url = new URL(e.request.url)

  // Não cacheia páginas de auth e rotas dinâmicas
  if (NO_CACHE.some(p => url.pathname === p || url.pathname.startsWith(p + '/'))) {
    e.respondWith(fetch(e.request))
    return
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Não cacheia redirects (301, 302, 307, 308)
        if (res.redirected || res.status > 299) return res
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
        return res
      })
      .catch(() => caches.match(e.request))
  )
})

// Notificações push
self.addEventListener('push', e => {
  const data = e.data?.json() ?? {}
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'KTX Academy', {
      body:    data.body    ?? '',
      icon:    '/icons/192',
      badge:   '/icons/192',
      data:    data.url ? { url: data.url } : {},
      actions: data.actions ?? [],
      vibrate: [200, 100, 200],
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url ?? '/dashboard'
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      const existing = list.find(c => c.url.includes(url))
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})
