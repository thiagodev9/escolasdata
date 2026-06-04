import type { Metadata } from 'next'
import { Outfit, Fraunces, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { LgpdBanner } from '@/components/lgpd/lgpd-banner'
import { SwRegister } from '@/components/pwa/sw-register'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '600', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EduNest — Portal Pré-Escolar',
  description: 'Plataforma de gestão para escolas infantis',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EduNest',
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
    <html lang="pt-BR" className={`${outfit.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* PWA iOS */}
        <meta name="apple-mobile-web-app-capable"           content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style"  content="default" />
        <meta name="apple-mobile-web-app-title"             content="EduNest" />
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
