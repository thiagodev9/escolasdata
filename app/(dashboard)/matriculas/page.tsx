export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { MatriculasKanban } from '@/components/matricula/matriculas-kanban'
import type { Matricula } from '@/lib/supabase/types'

export default async function MatriculasPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdmin()
  const { data: usuario } = await (admin as any)
    .from('usuarios')
    .select('escola_id, role, escola:escolas(slug)')
    .eq('id', user.id)
    .single() as { data: { escola_id: string; role: string; escola: { slug: string } | null } | null }

  if (!usuario || !['super_admin','diretora'].includes(usuario.role)) redirect('/dashboard')

  const escolaId = usuario.escola_id
  const slug     = usuario.escola?.slug ?? ''

  const { data } = await (admin as any)
    .from('matriculas')
    .select('*')
    .eq('escola_id', escolaId)
    .order('criado_em', { ascending: false }) as { data: Matricula[] | null }

  return (
    <div className="p-6 lg:p-8 flex flex-col h-[calc(100vh-4rem)]">
      <MatriculasKanban
        matriculas={data ?? []}
        escolaId={escolaId}
        slug={slug}
      />
    </div>
  )
}
