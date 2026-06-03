'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Calendar, CreditCard, Bell, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/portal',              icon: Home,       label: 'Início' },
  { href: '/portal/frequencia',   icon: Calendar,   label: 'Frequência' },
  { href: '/portal/mensalidades', icon: CreditCard, label: 'Mensalidades' },
  { href: '/portal/avisos',       icon: Bell,       label: 'Avisos' },
]

export function PortalNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function sair() {
    await supabase.auth.signOut()
    router.push('/portal/login')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto px-2 pb-2">
        {NAV.map(({ href, icon: Icon, label }) => {
          const ativo = href === '/portal' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-3 px-3 rounded-2xl transition-colors min-w-0 ${
                ativo ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-semibold truncate">{label}</span>
            </Link>
          )
        })}
        <button
          onClick={sair}
          className="flex flex-col items-center gap-1 py-3 px-3 rounded-2xl text-slate-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Sair</span>
        </button>
      </div>
    </nav>
  )
}
