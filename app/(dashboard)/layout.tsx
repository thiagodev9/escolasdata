import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { Sidebar } from '@/components/layout/sidebar'
import type { Role, Usuario } from '@/lib/supabase/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const admin = createAdmin()

  let usuario: (Usuario & { escola: { nome: string } | null }) | null = null

  const { data: u } = await (supabase as any)
    .from('usuarios')
    .select('*, escola:escolas(*)')
    .eq('id', user.id)
    .single() as { data: (Usuario & { escola: { nome: string } | null }) | null }

  if (!u) {
    const { data: uAdmin } = await (admin as any)
      .from('usuarios')
      .select('*, escola:escolas(*)')
      .eq('id', user.id)
      .single() as { data: (Usuario & { escola: { nome: string } | null }) | null }
    if (!uAdmin) redirect('/login')
    usuario = uAdmin
  } else {
    usuario = u
  }

  // Busca logo e nome fantasia das configurações da escola
  const { data: config } = await (admin as any)
    .from('configuracoes_escola')
    .select('logo_url, nome_fantasia, cor_primaria')
    .eq('escola_id', usuario.escola_id)
    .maybeSingle() as { data: { logo_url: string | null; nome_fantasia: string | null; cor_primaria: string | null } | null }

  const escolaNome = config?.nome_fantasia || usuario.escola?.nome || ''
  const logoUrl    = config?.logo_url    ?? null
  const corPrimaria = config?.cor_primaria ?? '#2563EB'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        role={usuario.role as Role}
        escolaNome={escolaNome}
        logoUrl={logoUrl}
        corPrimaria={corPrimaria}
        usuario={usuario}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
