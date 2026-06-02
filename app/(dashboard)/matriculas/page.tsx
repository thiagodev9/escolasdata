import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { MatriculasAdmin } from '@/components/matricula/matriculas-admin'
import type { Matricula } from '@/lib/supabase/types'

export default async function MatriculasPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdmin()
  const { data: usuario } = await (admin as any)
    .from('usuarios')
    .select('escola_id, escola:escolas(slug)')
    .eq('id', user?.id)
    .single() as { data: { escola_id: string; escola: { slug: string } | null } | null }

  const escolaId = usuario?.escola_id ?? ''
  const slug     = usuario?.escola?.slug ?? ''

  const { data } = await (admin as any)
    .from('matriculas')
    .select('*')
    .eq('escola_id', escolaId)
    .order('criado_em', { ascending: false }) as { data: Matricula[] | null }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Matrículas</h1>
        <p className="text-muted-foreground mt-1">
          Solicitações de pré-matrícula recebidas pelo formulário público.
        </p>
      </div>
      <MatriculasAdmin
        matriculas={data ?? []}
        escolaId={escolaId}
        slug={slug}
      />
    </div>
  )
}
