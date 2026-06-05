import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import type { Role, Usuario } from '@/lib/supabase/types'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // getUsuarioAtual é memoizado por React.cache() — pages no mesmo request não fazem query extra
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect('/login')

  const configRow   = (usuario.escola as any)?.configuracoes_escola?.[0] ?? null
  const escolaNome  = configRow?.nome_fantasia || usuario.escola?.nome || ''
  const logoUrl     = configRow?.logo_url ?? null
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
