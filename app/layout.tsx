import type { Metadata } from 'next'
import './globals.css'
import { LgpdBanner } from '@/components/lgpd/lgpd-banner'
import { SwRegister } from '@/components/pwa/sw-register'

export const metadata: Metadata = {
  title: 'KTX Academy — Portal Pré-Escolar',
  description: 'Plataforma de gestão para escolas infantis',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KTX Academy',
  },
  icons: {
    icon:  [{ url: '/icons/192', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/192', sizes: '192x192', type: 'image/png' }],
  },
  other: {
    'mobile-web-app-capable':    'yes',
    'msapplication-TileColor':   '#2563EB',
    'msapplication-TileImage':   '/icons/192',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,600;0,6..12,700;1,6..12,400&display=swap"
          rel="stylesheet"
        />
        {/* PWA iOS */}
        <meta name="apple-mobile-web-app-capable"           content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style"  content="default" />
        <meta name="apple-mobile-web-app-title"             content="KTX Academy" />
        <link rel="apple-touch-icon"                        href="/icons/192" />
        {/* PWA Android / Chrome */}
        <meta name="theme-color" content="#2563EB" />
        <link rel="mask-icon" href="/icons/192" color="#2563EB" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <LgpdBanner />
        <SwRegister />
      </body>
    </html>
  )
}
