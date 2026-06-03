export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@/lib/supabase/admin'
import { ChevronLeft, Bell } from 'lucide-react'

const CATEGORIA_COR: Record<string, string> = {
  geral:       'bg-slate-100 text-slate-600',
  pedagogico:  'bg-blue-100 text-blue-700',
  artes:       'bg-purple-100 text-purple-700',
  lazer:       'bg-green-100 text-green-700',
  refeicao:    'bg-orange-100 text-orange-700',
}

export default async function PortalAvisosPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const admin = createAdminClient()

  const { data: responsavel } = await (admin as any)
    .from('responsaveis')
    .select('id, escola_id')
    .eq('email', user.email)
    .maybeSingle() as { data: { id: string; escola_id: string } | null }

  if (!responsavel) redirect('/portal/login?erro=nao-cadastrado')

  const { data: posts } = await (admin as any)
    .from('feed_posts')
    .select('id, conteudo, foto_url, categoria, criado_em, turmas(nome)')
    .eq('escola_id', responsavel.escola_id)
    .order('criado_em', { ascending: false })
    .limit(30)

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/portal" className="text-slate-400 hover:text-slate-600 p-1">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-black text-slate-800">Avisos da escola</h1>
      </div>

      {(posts ?? []).length === 0 ? (
        <div className="flex flex-col items-center text-center gap-3 mt-16 text-slate-400">
          <Bell className="w-10 h-10" />
          <p className="text-sm">Nenhum aviso publicado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(posts ?? []).map((post: any) => {
            const corCategoria = CATEGORIA_COR[post.categoria] ?? CATEGORIA_COR.geral
            const data = new Date(post.criado_em).toLocaleDateString('pt-BR', {
              day: '2-digit', month: 'short', year: 'numeric',
            })

            return (
              <div key={post.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                {post.foto_url && (
                  <img src={post.foto_url} alt="" className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${corCategoria}`}>
                      {post.categoria}
                    </span>
                    <span className="text-xs text-slate-400">{data}</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{post.conteudo}</p>
                  {post.turmas?.nome && (
                    <p className="text-xs text-slate-400 mt-2">Turma: {post.turmas.nome}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
