export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { calcularMensalidadeSaas } from '@/lib/billing'
import { AssinaturasClient } from '@/components/assinaturas/assinaturas-client'

export default async function AssinaturasPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdmin()
  const { data: usuario } = await (admin as any)
    .from('usuarios').select('role').eq('id', user.id).single()

  if (usuario?.role !== 'super_admin') redirect('/dashboard')

  // Busca todas as escolas com suas assinaturas
  const { data: escolas } = await (admin as any)
    .from('escolas')
    .select('id, nome, ativo')
    .order('nome')

  const escolaIds = (escolas ?? []).map((e: any) => e.id)

  const [assinaturasRes, alunosCountRes] = await Promise.all([
    (admin as any)
      .from('assinaturas_saas')
      .select('*')
      .in('escola_id', escolaIds),
    Promise.all((escolas ?? []).map(async (e: any) => {
      const { count } = await (admin as any)
        .from('alunos')
        .select('id', { count: 'exact', head: true })
        .eq('escola_id', e.id)
        .eq('status', 'ativo')
      return { escola_id: e.id, count: count ?? 0 }
    }))
  ])

  const assMap = new Map<string, any>((assinaturasRes.data ?? []).map((a: any) => [a.escola_id, a]))
  const countMap = new Map(alunosCountRes.map((a: any) => [a.escola_id, a.count]))

  const dados = (escolas ?? []).map((e: any) => {
    const ass   = assMap.get(e.id)
    const qtd   = countMap.get(e.id) ?? 0
    const { valor, faixa } = calcularMensalidadeSaas(qtd)
    return {
      escola_id:        e.id,
      escola_nome:      e.nome,
      escola_ativa:     e.ativo,
      status:           ass?.status ?? 'sem_assinatura',
      asaas_customer_id: ass?.asaas_customer_id ?? null,
      trial_ate:        ass?.trial_ate ?? null,
      qtd_alunos:       qtd,
      faixa,
      valor_mensal:     valor,
    }
  })

  const receitaPotencial = dados
    .filter((d: any) => ['ativa', 'trial'].includes(d.status))
    .reduce((acc: number, d: any) => acc + d.valor_mensal, 0)

  return (
    <div className="p-6 lg:p-10">
      <AssinaturasClient dados={dados} receitaPotencial={receitaPotencial} />
    </div>
  )
}
