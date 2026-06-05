import { redirect } from 'next/navigation'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { GastosClient } from '@/components/gastos/gastos-client'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'

export const dynamic = 'force-dynamic'

export default async function GastosPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario || !['super_admin', 'diretora'].includes(usuario.role)) redirect('/dashboard')

  const admin = createAdmin()

  const dataMin = new Date()
  dataMin.setMonth(dataMin.getMonth() - 12)

  const { data: gastos } = await (admin as any)
    .from('gastos')
    .select('*')
    .eq('escola_id', usuario.escola_id)
    .gte('dt_pagamento', dataMin.toISOString().slice(0, 10))
    .order('dt_pagamento', { ascending: false })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <GastosClient
        gastos={gastos ?? []}
        escolaId={usuario.escola_id}
        usuarioId={usuario.id}
      />
    </div>
  )
}
