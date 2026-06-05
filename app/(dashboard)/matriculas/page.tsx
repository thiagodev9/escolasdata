export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { MatriculasKanban } from '@/components/matricula/matriculas-kanban'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'
import type { Matricula } from '@/lib/supabase/types'

export default async function MatriculasPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario || !['super_admin', 'diretora'].includes(usuario.role)) redirect('/dashboard')

  const admin = createAdmin()
  const escolaId = usuario.escola_id
  const slug = usuario.escola?.slug ?? ''

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
