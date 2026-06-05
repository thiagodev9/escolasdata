import { redirect } from 'next/navigation'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { ColaboradoresClient } from '@/components/colaboradores/colaboradores-client'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'

export const dynamic = 'force-dynamic'

export default async function ColaboradoresPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario || !['super_admin', 'diretora'].includes(usuario.role)) redirect('/dashboard')

  const admin = createAdmin()

  const { data: colaboradores } = await (admin as any)
    .from('colaboradores')
    .select('*')
    .eq('escola_id', usuario.escola_id)
    .order('nome')

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ColaboradoresClient
        colaboradores={colaboradores ?? []}
        escolaId={usuario.escola_id}
      />
    </div>
  )
}
