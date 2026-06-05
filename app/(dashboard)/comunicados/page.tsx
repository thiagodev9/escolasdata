import { createClient as createAdmin } from '@/lib/supabase/admin'
import { ComunicadosClient } from '@/components/comunicados/comunicados-client'
import { isConfigured } from '@/lib/evolution/client'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'
import { redirect } from 'next/navigation'

export default async function ComunicadosPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect('/login')

  const admin = createAdmin()
  const escolaId   = usuario.escola_id
  const escolaNome = usuario.escola?.nome ?? ''

  const [turmasRes, historicoRes] = await Promise.all([
    (admin as any).from('turmas').select('id, nome').eq('escola_id', escolaId).order('nome'),
    (admin as any)
      .from('comunicados')
      .select('*, enviado_por_usuario:usuarios(nome), turma:turmas(nome)')
      .eq('escola_id', escolaId)
      .order('criado_em', { ascending: false })
      .limit(20),
  ])

  return (
    <div className="p-6 lg:p-10">
      <ComunicadosClient
        turmas={turmasRes.data ?? []}
        historico={historicoRes.data ?? []}
        escolaId={escolaId}
        escolaNome={escolaNome}
        whatsappAtivo={isConfigured()}
      />
    </div>
  )
}
