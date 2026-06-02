import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import type { Role, Usuario } from '@/lib/supabase/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')


  const { data: usuario } = await (supabase as any)
    .from('usuarios')
    .select('*, escola:escolas(*)')
    .eq('id', user.id)
    .single() as { data: (Usuario & { escola: { nome: string } | null }) | null }

  // Se usuario não encontrado mas está autenticado, pode ser RLS bloqueando.
  // Usar service role para buscar o perfil sem RLS.
  if (!usuario) {
    const { createClient: createAdmin } = await import('@/lib/supabase/admin')
    const admin = createAdmin()
    const { data: usuarioAdmin } = await (admin as any)
      .from('usuarios')
      .select('*, escola:escolas(*)')
      .eq('id', user.id)
      .single() as { data: (Usuario & { escola: { nome: string } | null }) | null }
    if (!usuarioAdmin) redirect('/login')
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar role={usuarioAdmin.role as Role} escolaNome={usuarioAdmin.escola?.nome ?? ''} usuario={usuarioAdmin} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={usuario.role as Role} escolaNome={usuario.escola?.nome ?? ''} usuario={usuario} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
