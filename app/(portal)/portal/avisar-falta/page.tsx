export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@/lib/supabase/admin'
import { ChevronLeft } from 'lucide-react'
import { getResponsavel } from '@/lib/portal/get-responsavel'
import { AvisarFaltaClient } from '@/components/portal/avisar-falta-client'

export default async function AvisarFaltaPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const admin = createAdminClient()
  const responsavel = await getResponsavel(user.email!)
  if (!responsavel) redirect('/portal/login?erro=nao-cadastrado')

  const { data: links } = await (admin as any)
    .from('alunos_responsaveis')
    .select('alunos(id, nome, foto_url)')
    .eq('responsavel_id', responsavel.id)

  const alunos = (links ?? []).map((l: any) => ({
    id: l.alunos.id,
    nome: l.alunos.nome,
    foto_url: l.alunos.foto_url ?? null,
  }))

  // Avisos já enviados para amanhã/hoje
  const amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)
  const dataMin = new Date().toISOString().split('T')[0]

  const { data: avisosExistentes } = await (admin as any)
    .from('avisos_falta')
    .select('aluno_id, data, motivo')
    .eq('responsavel_id', responsavel.id)
    .gte('data', dataMin)

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/portal" className="text-slate-400 hover:text-slate-600 p-1">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-black text-slate-800">Avisar falta</h1>
      </div>
      <AvisarFaltaClient
        alunos={alunos}
        responsavelId={responsavel.id}
        escolaId={responsavel.escola_id}
        avisosExistentes={avisosExistentes ?? []}
      />
    </div>
  )
}
