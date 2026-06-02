import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { ConfiguracoesClient } from '@/components/configuracoes/configuracoes-client'

export default async function ConfiguracoesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdmin()
  const { data: usuario } = await (admin as any)
    .from('usuarios').select('escola_id').eq('id', user?.id).single() as { data: { escola_id: string } | null }

  const escolaId = usuario?.escola_id ?? ''

  const [escolaRes, usuariosRes] = await Promise.all([
    (admin as any).from('escolas').select('*').eq('id', escolaId).single(),
    (admin as any).from('usuarios').select('*').eq('escola_id', escolaId).order('nome'),
  ])

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Personalize sua escola e gerencie usuários.</p>
      </div>
      <ConfiguracoesClient
        escola={escolaRes.data}
        usuarios={usuariosRes.data ?? []}
        escolaId={escolaId}
      />
    </div>
  )
}
