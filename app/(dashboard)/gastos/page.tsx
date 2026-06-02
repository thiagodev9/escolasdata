import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GastosClient } from '@/components/gastos/gastos-client'

export const dynamic = 'force-dynamic'

export default async function GastosPage() {
  const supabase = createClient()

  const { data: { user } } = await (supabase as any).auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await (supabase as any)
    .from('usuarios')
    .select('id, escola_id, role')
    .eq('id', user.id)
    .single()

  if (!usuario || !['super_admin','diretora'].includes(usuario.role)) redirect('/dashboard')

  // Busca últimos 13 meses para comparação
  const dataMin = new Date()
  dataMin.setMonth(dataMin.getMonth() - 12)

  const { data: gastos } = await (supabase as any)
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
