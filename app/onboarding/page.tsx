import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

export default async function OnboardingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const admin = createAdmin()
  const { data: usuario } = await (admin as any)
    .from('usuarios')
    .select('role, escola:escolas(id, nome, onboarding_completo)')
    .eq('id', user.id)
    .single() as {
      data: {
        role: string
        escola: { id: string; nome: string; onboarding_completo: boolean } | null
      } | null
    }

  if (!usuario || !['diretora', 'super_admin'].includes(usuario.role)) {
    redirect('/dashboard')
  }

  const escola = usuario.escola
  if (!escola) redirect('/login?modo=cadastro')

  return (
    <OnboardingWizard
      escolaId={escola.id}
      escolaNome={escola.nome}
    />
  )
}
