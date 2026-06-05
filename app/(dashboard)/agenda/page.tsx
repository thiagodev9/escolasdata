import { createClient as createAdmin } from '@/lib/supabase/admin'
import { AgendaClient } from '@/components/agenda/agenda-client'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'
import { redirect } from 'next/navigation'

export default async function AgendaPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect('/login')

  const admin = createAdmin()
  const escolaId = usuario.escola_id

  // eventos e turmas em paralelo
  const [eventosRes, turmasRes] = await Promise.all([
    (admin as any).from('eventos').select('*').eq('escola_id', escolaId).order('data'),
    (admin as any).from('turmas').select('id, nome').eq('escola_id', escolaId).order('nome'),
  ])

  const eventos: any[] = eventosRes.data ?? []

  return (
    <div className="p-6 lg:p-10">
      <AgendaClient
        eventos={eventos}
        turmas={turmasRes.data ?? []}
        escolaId={escolaId}
      />
    </div>
  )
}
