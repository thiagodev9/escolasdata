import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { MobileBottomNav } from '@/components/responsavel/mobile-bottom-nav'

export default async function ResponsavelLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdmin()
  const { data: usuario } = await (admin as any)
    .from('usuarios').select('role, nome, escola_id').eq('id', user.id).single() as { data: any | null }

  if (!usuario) redirect('/login')
  // Diretoras/professoras vão pro dashboard admin
  if (['diretora', 'professora', 'super_admin'].includes(usuario.role)) redirect('/dashboard')

  // Buscar filhos do responsável
  const { data: filhos } = await (admin as any)
    .from('alunos')
    .select('id, nome, foto_url, alunos_turmas(turma:turmas(nome))')
    .eq('escola_id', usuario.escola_id) as { data: any[] | null }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>
      <MobileBottomNav nomeUsuario={usuario.nome} />
    </div>
  )
}
