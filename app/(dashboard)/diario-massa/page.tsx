import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { DiarioMassaClient } from '@/components/diario/diario-massa-client'

export default async function DiarioMassaPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdmin()

  const { data: usuario } = await (admin as any)
    .from('usuarios').select('escola_id, id').eq('id', user?.id).single() as { data: any }

  const escolaId = usuario?.escola_id ?? ''

  const { data: turmas } = await (admin as any)
    .from('turmas')
    .select('id, nome, alunos_turmas(aluno:alunos(id, nome, foto_url, status))')
    .eq('escola_id', escolaId)
    .order('nome') as { data: any[] | null }

  return (
    <div className="p-6 lg:p-10">
      <DiarioMassaClient
        turmas={turmas ?? []}
        escolaId={escolaId}
        autorId={usuario?.id ?? ''}
      />
    </div>
  )
}
