import { TurmasClient } from '@/components/turmas/turmas-client'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'
import { getTurmasComDetalhes } from '@/lib/queries/turmas-query'
import { redirect } from 'next/navigation'

export default async function TurmasPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect('/login')

  const { turmas, professores } = await getTurmasComDetalhes(usuario.escola_id)

  return (
    <div className="p-6 lg:p-10">
      <TurmasClient
        turmas={turmas}
        professores={professores}
        escolaId={usuario.escola_id}
      />
    </div>
  )
}
