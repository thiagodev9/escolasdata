'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Rss, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Home',      href: '/diario',  icon: Home     },
  { label: 'Diário',    href: '/diario',  icon: BookOpen },
  { label: 'Feed',      href: '/feed-responsavel', icon: Rss  },
  { label: 'Alertas',   href: '/alertas', icon: Bell     },
  { label: 'Perfil',    href: '/perfil',  icon: User     },
]

export function MobileBottomNav({ nomeUsuario }: { nomeUsuario: string }) {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-border/60 flex items-center justify-around px-2 py-2 z-50 shadow-float">
      {NAV.map(item => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link key={item.href + item.label} href={item.href}
            className={cn('flex flex-col items-center gap-0.5 px-3 py-1 rounded-md transition-colors min-w-[52px]',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}>
            <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
            <span className={cn('text-[10px] font-semibold', isActive && 'text-primary')}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
