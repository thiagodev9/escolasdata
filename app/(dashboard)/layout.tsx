import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { Sidebar } from '@/components/layout/sidebar'
import type { Role, Usuario } from '@/lib/supabase/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Uma query única: usuario + escola + config (elimina 2 round-trips sequenciais)
  const { data: usuario } = await (createAdmin() as any)
    .from('usuarios')
    .select('*, escola:escolas(*, configuracoes_escola(logo_url, nome_fantasia, cor_primaria))')
    .eq('id', user.id)
    .single() as { data: (Usuario & { escola: ({ nome: string; configuracoes_escola: Array<{ logo_url: string | null; nome_fantasia: string | null; cor_primaria: string | null }> } | null) }) | null }

  if (!usuario) redirect('/login')

  const configRow  = (usuario.escola as any)?.configuracoes_escola?.[0] ?? null
  const escolaNome = configRow?.nome_fantasia || usuario.escola?.nome || ''
  const logoUrl    = configRow?.logo_url    ?? null
  const corPrimaria = configRow?.cor_primaria ?? '#2563EB'

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
