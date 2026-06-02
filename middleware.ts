import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import type { Role } from '@/lib/supabase/types'

// Rotas que não requerem autenticação
const PUBLIC_ROUTES = ['/login', '/reset-senha', '/auth/callback', '/solicitar-demo', '/matricula', '/privacidade', '/lgpd/solicitar']

// Redirecionamento padrão por role após login
const ROLE_HOME: Record<Role, string> = {
  super_admin: '/dashboard',
  diretora:    '/dashboard',
  professora:  '/dashboard',
  responsavel: '/diario',
}

// Rotas restritas por role (roles que NÃO podem acessar)
const RESTRICTED_ROUTES: Record<string, Role[]> = {
  '/financeiro': ['professora', 'responsavel'],
  '/configuracoes': ['professora', 'responsavel'],
  '/turmas': ['responsavel'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignora arquivos estáticos e rotas especiais
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/print') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const { supabaseResponse, user, supabase } = await updateSession(request)

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) || pathname === '/onboarding'

  // Não autenticado tentando acessar rota protegida → /login
  if (!user && !isPublicRoute) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Autenticado tentando acessar /login → dashboard
  if (user && isPublicRoute) {

    const { data: usuario } = await (supabase as any)
      .from('usuarios')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null }

    const role = (usuario?.role as Role) ?? 'responsavel'
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = ROLE_HOME[role]
    return NextResponse.redirect(homeUrl)
  }

  // Verificar restrições de role para rotas protegidas
  if (user) {

    const { data: usuario } = await (supabase as any)
      .from('usuarios')
      .select('role, escola_id')
      .eq('id', user.id)
      .single() as { data: { role: string; escola_id: string } | null }

    if (usuario) {
      const role = usuario.role as Role

      // Checar rotas restritas
      for (const [route, blockedRoles] of Object.entries(RESTRICTED_ROUTES)) {
        if (pathname.startsWith(route) && blockedRoles.includes(role)) {
          const homeUrl = request.nextUrl.clone()
          homeUrl.pathname = ROLE_HOME[role]
          return NextResponse.redirect(homeUrl)
        }
      }

      // Injetar escola_id no header para uso nos Server Components
      supabaseResponse.headers.set('x-escola-id', usuario.escola_id ?? '')
      supabaseResponse.headers.set('x-user-role', role)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
