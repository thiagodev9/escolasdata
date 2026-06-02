import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { LgpdClient } from '@/components/lgpd/lgpd-client'
import type { LgpdRequest, AuditLog } from '@/lib/supabase/types'

export default async function LgpdPage() {
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

  const [requestsRes, auditRes] = await Promise.all([
    (admin as any)
      .from('lgpd_requests')
      .select('*')
      .eq('escola_id', escolaId)
      .order('criado_em', { ascending: false }),
    (admin as any)
      .from('audit_log')
      .select('*')
      .eq('escola_id', escolaId)
      .order('criado_em', { ascending: false })
      .limit(50),
  ])

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">LGPD</h1>
        <p className="text-muted-foreground mt-1">
          Conformidade com a Lei Geral de Proteção de Dados — solicitações, exportação e auditoria.
        </p>
      </div>
      <LgpdClient
        requests={requestsRes.data ?? []}
        auditLog={auditRes.data ?? []}
        escolaId={escolaId}
        slug={slug}
      />
    </div>
  )
}
