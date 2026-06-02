import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SuperAdminClient } from '@/components/super-admin/super-admin-client'

export default async function SuperAdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdmin()
  const { data: usuario } = await (admin as any)
    .from('usuarios')
    .select('role')
    .eq('id', user?.id)
    .single() as { data: { role: string } | null }

  if (usuario?.role !== 'super_admin') redirect('/dashboard')

  // Buscar todas as escolas com contagens
  const { data: escolas } = await (admin as any)
    .from('escolas')
    .select('*')
    .order('criado_em', { ascending: false }) as { data: any[] | null }

  // Buscar contagens por escola
  const escolaIds = (escolas ?? []).map((e: any) => e.id)

  const [alunosRes, usuariosRes] = await Promise.all([
    (admin as any)
      .from('alunos')
      .select('escola_id', { count: 'exact' })
      .in('escola_id', escolaIds)
      .eq('status', 'ativo'),
    (admin as any)
      .from('usuarios')
      .select('escola_id', { count: 'exact' })
      .in('escola_id', escolaIds),
  ])

  // Montar contagens por escola
  const alunosPorEscola: Record<string, number> = {}
  for (const a of alunosRes.data ?? []) {
    alunosPorEscola[a.escola_id] = (alunosPorEscola[a.escola_id] ?? 0) + 1
  }
  const usuariosPorEscola: Record<string, number> = {}
  for (const u of usuariosRes.data ?? []) {
    usuariosPorEscola[u.escola_id] = (usuariosPorEscola[u.escola_id] ?? 0) + 1
  }

  const escolasComStats = (escolas ?? []).map((e: any) => ({
    ...e,
    total_alunos:   alunosPorEscola[e.id]   ?? 0,
    total_usuarios: usuariosPorEscola[e.id] ?? 0,
  }))

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Multi-Unidade</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral de todas as escolas cadastradas na plataforma.
        </p>
      </div>
      <SuperAdminClient escolas={escolasComStats} />
    </div>
  )
}
