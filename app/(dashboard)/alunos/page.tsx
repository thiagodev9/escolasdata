import { AlunosClient } from '@/components/alunos/alunos-client'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'
import { getAlunosComDetalhes, getTurmasList } from '@/lib/queries/alunos-query'
import { redirect } from 'next/navigation'

export default async function AlunosPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect('/login')

  const escolaId = usuario.escola_id

  const [alunos, turmas] = await Promise.all([
    getAlunosComDetalhes(escolaId),
    getTurmasList(escolaId),
  ])

  return (
    <div className="p-6 lg:p-10">
      <AlunosClient
        alunos={alunos}
        turmas={turmas}
        escolaId={escolaId}
      />
    </div>
  )
}
