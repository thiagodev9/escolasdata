import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { AgendaClient } from '@/components/agenda/agenda-client'

export default async function AgendaPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdmin()

  const { data: usuario } = await (admin as any)
    .from('usuarios').select('escola_id').eq('id', user?.id).single() as { data: { escola_id: string } | null }
  const escolaId = usuario?.escola_id ?? ''

  // Buscar eventos (tabela pode não existir ainda — tratado com try/catch)
  let eventos: any[] = []
  try {
    const { data } = await (admin as any)
      .from('eventos')
      .select('*')
      .eq('escola_id', escolaId)
      .order('data') as { data: any[] | null }
    eventos = data ?? []
  } catch {
    eventos = []
  }

  const { data: turmas } = await (admin as any)
    .from('turmas').select('id, nome').eq('escola_id', escolaId).order('nome') as { data: any[] | null }

  return (
    <div className="p-6 lg:p-10">
      <AgendaClient
        eventos={eventos ?? []}
        turmas={turmas ?? []}
        escolaId={escolaId}
      />
    </div>
  )
}
