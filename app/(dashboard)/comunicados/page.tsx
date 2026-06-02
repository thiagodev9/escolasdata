import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { ComunicadosClient } from '@/components/comunicados/comunicados-client'
import { isConfigured } from '@/lib/evolution/client'

export default async function ComunicadosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdmin()

  const { data: usuario } = await (admin as any)
    .from('usuarios').select('escola_id, escola:escolas(nome)').eq('id', user?.id).single() as { data: any }

  const escolaId   = usuario?.escola_id ?? ''
  const escolaNome = usuario?.escola?.nome ?? ''

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
