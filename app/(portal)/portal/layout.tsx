import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@/lib/supabase/admin'
import { PortalNav } from '@/components/portal/portal-nav'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/portal/login')

  const admin = createAdminClient()
  const { data: responsavel } = await (admin as any)
    .from('responsaveis')
    .select('id')
    .eq('email', user.email)
    .maybeSingle()

  if (!responsavel) redirect('/portal/login?erro=nao-cadastrado')

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {children}
      <PortalNav />
    </div>
  )
}
