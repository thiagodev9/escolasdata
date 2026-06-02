import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { RelatoriosClient } from '@/components/relatorios/relatorios-client'

export default async function RelatoriosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdmin()
  const { data: usuario } = await (admin as any)
    .from('usuarios')
    .select('escola_id')
    .eq('id', user?.id)
    .single() as { data: { escola_id: string } | null }

  const { data: turmas } = await (admin as any)
    .from('turmas')
    .select('id, nome')
    .eq('escola_id', usuario?.escola_id ?? '')
    .order('nome') as { data: { id: string; nome: string }[] | null }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground mt-1">
          Gere relatórios em PDF para imprimir ou compartilhar.
        </p>
      </div>
      <RelatoriosClient turmas={turmas ?? []} />
    </div>
  )
}
