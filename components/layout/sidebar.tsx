'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, BookOpen, CalendarDays, DollarSign,
  Settings, Rss, LogOut, ScanLine, MessageSquareDot,
  ClipboardList, BarChart3, FileText, Shield, Building2,
  ChevronLeft, ChevronRight, ChevronDown, UserCog, Receipt, ArrowLeftRight,
  UtensilsCrossed, Banknote,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { Role, Usuario } from '@/lib/supabase/types'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles: Role[]
  color: string
  bgActive: string
}

interface NavGroup {
  label: string
  key: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Principal',
    key: 'principal',
    items: [
      { label: 'Dashboard',   href: '/dashboard',   icon: LayoutDashboard, roles: ['super_admin','diretora','professora'],                       color: 'text-blue-600',    bgActive: 'bg-blue-100' },
      { label: 'Alunos',      href: '/alunos',       icon: Users,           roles: ['super_admin','diretora','professora','responsavel'],         color: 'text-emerald-600', bgActive: 'bg-emerald-100' },
      { label: 'Feed',        href: '/feed',         icon: Rss,             roles: ['super_admin','diretora','professora','responsavel'],         color: 'text-pink-500',    bgActive: 'bg-pink-100' },
      { label: 'Agenda',      href: '/agenda',       icon: CalendarDays,    roles: ['super_admin','diretora','professora','responsavel'],         color: 'text-amber-500',   bgActive: 'bg-amber-100' },
    ],
  },
  {
    label: 'Pedagógico',
    key: 'pedagogico',
    items: [
      { label: 'Turmas',      href: '/turmas',       icon: BookOpen,        roles: ['super_admin','diretora','professora'],                       color: 'text-violet-600',  bgActive: 'bg-violet-100' },
      { label: 'Presença',    href: '/presenca',     icon: ScanLine,        roles: ['super_admin','diretora','professora'],                       color: 'text-teal-600',    bgActive: 'bg-teal-100' },
      { label: 'Diário',      href: '/diario-massa', icon: BookOpen,        roles: ['super_admin','diretora','professora'],                       color: 'text-cyan-600',    bgActive: 'bg-cyan-100' },
      { label: 'Comunicados', href: '/comunicados',  icon: MessageSquareDot,roles: ['super_admin','diretora'],                                    color: 'text-indigo-600',  bgActive: 'bg-indigo-100' },
    ],
  },
  {
    label: 'Administrativo',
    key: 'administrativo',
    items: [
      { label: 'Colaboradores',    href: '/colaboradores', icon: UserCog,           roles: ['super_admin','diretora'],                color: 'text-sky-600',     bgActive: 'bg-sky-100' },
      { label: 'Mensalidades',     href: '/mensalidades',  icon: Banknote,          roles: ['super_admin','diretora'],                color: 'text-green-600',   bgActive: 'bg-green-100' },
      { label: 'Gastos',           href: '/gastos',        icon: Receipt,           roles: ['super_admin','diretora'],                color: 'text-red-500',     bgActive: 'bg-red-50' },
      { label: 'Cardápio',         href: '/cardapio',      icon: UtensilsCrossed,   roles: ['super_admin','diretora','professora'],    color: 'text-orange-500',  bgActive: 'bg-orange-50' },
      { label: 'Importar/Exportar',href: '/importar',      icon: ArrowLeftRight,    roles: ['super_admin','diretora'],                color: 'text-indigo-500',  bgActive: 'bg-indigo-50' },
      { label: 'Matrículas',       href: '/matriculas',    icon: ClipboardList,     roles: ['super_admin','diretora'],                color: 'text-amber-600',   bgActive: 'bg-amber-100' },
      { label: 'Relatórios',       href: '/relatorios',    icon: BarChart3,         roles: ['super_admin','diretora','professora'],    color: 'text-blue-500',    bgActive: 'bg-blue-50' },
      { label: 'NFS-e',            href: '/nfse',          icon: FileText,          roles: ['super_admin','diretora'],                color: 'text-slate-500',   bgActive: 'bg-slate-100' },
    ],
  },
  {
    label: 'Sistema',
    key: 'sistema',
    items: [
      { label: 'LGPD',          href: '/lgpd',         icon: Shield,    roles: ['super_admin','diretora'],                                      color: 'text-red-400',    bgActive: 'bg-red-50' },
      { label: 'Multi-unid.',   href: '/super-admin',  icon: Building2,    roles: ['super_admin'], color: 'text-purple-600', bgActive: 'bg-purple-100' },
      { label: 'Assinaturas',   href: '/assinaturas',  icon: DollarSign,   roles: ['super_admin'], color: 'text-emerald-600', bgActive: 'bg-emerald-100' },
      { label: 'Configurações', href: '/configuracoes',icon: Settings,  roles: ['super_admin','diretora'],                                      color: 'text-slate-400',  bgActive: 'bg-slate-100' },
    ],
  },
]

const ROLE_LABEL: Record<Role, string> = {
  super_admin: 'Super Admin',
  diretora:    'Diretora',
  professora:  'Professora',
  responsavel: 'Responsável',
}

const ROLE_BADGE: Record<Role, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  diretora:    'bg-blue-100 text-blue-700',
  professora:  'bg-emerald-100 text-emerald-700',
  responsavel: 'bg-orange-100 text-orange-700',
}

interface SidebarProps {
  role: Role
  escolaNome: string
  logoUrl: string | null
  corPrimaria: string
  usuario: Usuario
}

export function Sidebar({ role, escolaNome, logoUrl, corPrimaria, usuario }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const [collapsed, setCollapsed]         = useState(false)
  const [openGroups, setOpenGroups]       = useState<Record<string, boolean>>({})
  const [tooltip, setTooltip]             = useState<string | null>(null)
  const [groupTooltip, setGroupTooltip]   = useState<string | null>(null)

  /* carrega preferências salvas */
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed')
    if (savedCollapsed === 'true') setCollapsed(true)

    const savedGroups = localStorage.getItem('sidebar-groups')
    if (savedGroups) {
      try { setOpenGroups(JSON.parse(savedGroups)) } catch {}
    }
  }, [])

  function toggleCollapsed() {
    setCollapsed(v => {
      localStorage.setItem('sidebar-collapsed', String(!v))
      return !v
    })
  }

  function toggleGroup(key: string) {
    setOpenGroups(prev => {
      const next = { ...prev, [key]: prev[key] === false ? true : false }
      localStorage.setItem('sidebar-groups', JSON.stringify(next))
      return next
    })
  }

  /* grupo fechado apenas se explicitamente false */
  function isGroupOpen(key: string) {
    return openGroups[key] !== false
  }

  const initials = usuario.nome
    .split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const visibleGroups = NAV_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => i.roles.includes(role)) }))
    .filter(g => g.items.length > 0)

  return (
    <aside
      className={cn(
        'relative min-h-screen flex flex-col bg-white border-r border-slate-100 shrink-0 transition-all duration-300',
        'shadow-[2px_0_16px_rgba(37,99,235,0.06)]',
        collapsed ? 'w-[72px]' : 'w-[256px]'
      )}
    >
      {/* ── Logo da escola ── */}
      <div className={cn(
        'flex items-center border-b border-slate-100 shrink-0',
        collapsed ? 'px-3 py-4 justify-center' : 'px-4 py-4 gap-3'
      )}>
        <div className="relative w-10 h-10 shrink-0 rounded-xl overflow-hidden" style={{ background: corPrimaria }}>
          {logoUrl ? (
            <img src={logoUrl} alt={escolaNome} className="w-full h-full object-cover" />
          ) : (
            <>
              <span
                className="absolute inset-0 flex items-center justify-center font-black text-white tracking-tight leading-none"
                style={{ fontSize: '13px', letterSpacing: '-0.5px' }}
              >
                {escolaNome ? escolaNome.slice(0, 2).toUpperCase() : 'EB'}
              </span>
              <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-orange-400" />
            </>
          )}
        </div>

        {!collapsed && (
          <div className="min-w-0 overflow-hidden">
            <p className="text-base font-black text-slate-800 leading-tight truncate">
              {escolaNome || 'Minha Escola'}
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Portal Pré-Escolar
            </p>
          </div>
        )}
      </div>

      {/* ── Navegação ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
        {visibleGroups.map((group, gi) => {
          const open         = isGroupOpen(group.key)
          const hasActive    = group.items.some(i => pathname === i.href || pathname.startsWith(i.href + '/'))

          return (
            <div key={group.key} className={cn(gi > 0 && 'mt-1')}>

              {/* ── header da seção ── */}
              {!collapsed ? (
                <button
                  onClick={() => toggleGroup(group.key)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-1.5 rounded-lg mb-0.5',
                    'transition-colors group',
                    open
                      ? 'hover:bg-slate-50'
                      : 'hover:bg-slate-50',
                  )}
                >
                  <span className={cn(
                    'text-xs font-black uppercase tracking-widest transition-colors',
                    hasActive && !open ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-600'
                  )}>
                    {group.label}
                  </span>
                  <ChevronDown className={cn(
                    'w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-transform duration-200',
                    !open && '-rotate-90'
                  )} />
                </button>
              ) : (
                /* modo colapsado: separador entre grupos */
                gi > 0 && <div className="mx-auto w-6 h-px bg-slate-100 my-2" />
              )}

              {/* ── itens (com animação) ── */}
              <div className={cn(
                'space-y-0.5 overflow-hidden transition-all duration-200',
                !collapsed && !open ? 'max-h-0 opacity-0' : 'max-h-[999px] opacity-100'
              )}>
                {group.items.map(item => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  const Icon     = item.icon

                  return (
                    <div
                      key={item.href}
                      className="relative"
                      onMouseEnter={() => collapsed ? setTooltip(item.label) : null}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-xl text-sm font-semibold transition-all group relative',
                          collapsed ? 'px-0 py-2 justify-center' : 'px-3 py-2.5',
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        )}
                      >
                        {isActive && !collapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r-full" />
                        )}

                        <span className={cn(
                          'flex items-center justify-center shrink-0 rounded-lg transition-all',
                          collapsed ? 'w-9 h-9' : 'w-7 h-7',
                          isActive ? item.bgActive : 'group-hover:bg-slate-100'
                        )}>
                          <Icon className={cn(
                            'w-4 h-4 transition-colors',
                            isActive ? item.color : 'text-slate-400 group-hover:text-slate-600'
                          )} />
                        </span>

                        {!collapsed && <span className="flex-1 truncate text-[15px]">{item.label}</span>}

                        {isActive && !collapsed && (
                          <ChevronRight className="w-3 h-3 text-blue-300 shrink-0" />
                        )}
                      </Link>

                      {/* tooltip modo colapsado */}
                      {collapsed && tooltip === item.label && (
                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                          <div className="bg-slate-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-float">
                            {item.label}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* ── Rodapé usuário ── */}
      <div className="border-t border-slate-100 p-3 shrink-0">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Avatar className="w-9 h-9 ring-2 ring-blue-100">
              <AvatarImage src={(usuario as any).avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleLogout}
              title="Sair"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-1 py-1 rounded-xl hover:bg-slate-50 transition-colors">
            <Avatar className="w-8 h-8 shrink-0 ring-2 ring-blue-100">
              <AvatarImage src={(usuario as any).avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-[11px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate leading-tight">{usuario.nome}</p>
              <span className={cn('inline-block text-xs font-bold px-1.5 py-0.5 rounded-full', ROLE_BADGE[role])}>
                {ROLE_LABEL[role]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Botão colapsar ── */}
      <button
        onClick={toggleCollapsed}
        className={cn(
          'absolute -right-3 top-[72px] z-10',
          'w-6 h-6 rounded-full bg-white border border-slate-200 shadow-soft',
          'flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30',
          'transition-all hover:scale-110'
        )}
        title={collapsed ? 'Expandir menu' : 'Recolher menu'}
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3" />
          : <ChevronLeft  className="w-3 h-3" />
        }
      </button>
    </aside>
  )
}
