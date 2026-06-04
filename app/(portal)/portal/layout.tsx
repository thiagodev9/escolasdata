import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { PortalNav } from '@/components/portal/portal-nav'
import { getResponsavel } from '@/lib/portal/get-responsavel'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/portal/login')

  const responsavel = await getResponsavel(user.email!)

  if (!responsavel) redirect('/portal/login?erro=nao-cadastrado')

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {children}
      <PortalNav />
    </div>
  )
}
