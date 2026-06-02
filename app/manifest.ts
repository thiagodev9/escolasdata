import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KTX Academy — Portal Pré-Escolar',
    short_name: 'KTX Academy',
    description: 'Plataforma de gestão para escolas infantis',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F2F6FF',
    theme_color: '#2563EB',
    orientation: 'portrait',
    icons: [
      { src: '/icons/192', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/512', sizes: '512x512', type: 'image/png', purpose: 'any'      },
    ],
    categories: ['education', 'business'],
    lang: 'pt-BR',
    shortcuts: [
      { name: 'Alunos',    url: '/alunos',     icons: [{ src: '/icons/192', sizes: '96x96' }] },
      { name: 'Feed',      url: '/feed',        icons: [{ src: '/icons/192', sizes: '96x96' }] },
      { name: 'Agenda',    url: '/agenda',      icons: [{ src: '/icons/192', sizes: '96x96' }] },
      { name: 'Financeiro',url: '/financeiro',  icons: [{ src: '/icons/192', sizes: '96x96' }] },
    ],
  }
}
