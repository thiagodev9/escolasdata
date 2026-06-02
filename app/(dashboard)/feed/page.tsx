import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { FeedClient } from '@/components/feed/feed-client'

export default async function FeedPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdmin()

  const { data: usuario } = await (admin as any)
    .from('usuarios').select('escola_id, id, nome').eq('id', user?.id).single() as { data: any }

  const escolaId = usuario?.escola_id ?? ''

  const [postsRes, turmasRes] = await Promise.all([
    (admin as any)
      .from('feed_posts')
      .select('*, autor:usuarios(nome), turma:turmas(nome)')
      .eq('escola_id', escolaId)
      .order('criado_em', { ascending: false })
      .limit(30),
    (admin as any)
      .from('turmas').select('id, nome').eq('escola_id', escolaId).order('nome'),
  ])

  return (
    <div className="p-6 lg:p-10">
      <FeedClient
        posts={postsRes.data ?? []}
        turmas={turmasRes.data ?? []}
        escolaId={escolaId}
        autorId={usuario?.id ?? ''}
        autorNome={usuario?.nome ?? ''}
      />
    </div>
  )
}
