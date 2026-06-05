import { createClient as createAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { CardapioClient, type CardapioItem } from '@/components/cardapio/cardapio-client'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'

export const dynamic = 'force-dynamic'

export default async function CardapioPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect('/login')

  const admin = createAdmin() as any
  const escolaId = usuario.escola_id

  // Busca as 3 semanas ao redor (anterior, atual, próxima)
  const hoje = new Date()
  const monday = new Date(hoje)
  const day = monday.getDay() || 7
  monday.setDate(monday.getDate() - day + 1)
  monday.setHours(0, 0, 0, 0)

  const inicio = new Date(monday); inicio.setDate(inicio.getDate() - 7)
  const fim    = new Date(monday); fim.setDate(fim.getDate() + 14)

  const { data: items } = await admin
    .from('cardapio')
    .select('*')
    .eq('escola_id', escolaId)
    .gte('semana_inicio', inicio.toISOString().slice(0, 10))
    .lte('semana_inicio', fim.toISOString().slice(0, 10))
    .order('semana_inicio')
    .order('dia_semana')
    .order('refeicao')

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Cardápio Semanal</h1>
        <p className="text-muted-foreground mt-1">Planeje as refeições da semana para alunos e responsáveis.</p>
      </div>
      <CardapioClient items={(items ?? []) as CardapioItem[]} escolaId={escolaId} />
    </div>
  )
}
