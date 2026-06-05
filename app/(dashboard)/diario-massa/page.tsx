import { createClient as createAdmin } from '@/lib/supabase/admin'
import { DiarioMassaClient } from '@/components/diario/diario-massa-client'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'
import { redirect } from 'next/navigation'

export default async function DiarioMassaPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect('/login')

  const admin = createAdmin()
  const escolaId = usuario.escola_id

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
        autorId={usuario.id}
      />
    </div>
  )
}
