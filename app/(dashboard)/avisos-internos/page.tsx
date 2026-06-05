export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { AvisosInternosClient } from '@/components/avisos-internos/avisos-internos-client'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'

export default async function AvisosInternosPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario || !['super_admin','diretora','professora'].includes(usuario.role)) redirect('/dashboard')

  const admin = createAdmin()

  const [avisosRes, lidosRes] = await Promise.all([
    (admin as any)
      .from('avisos_internos')
      .select('id, titulo, conteudo, prioridade, criado_em, criado_por:usuarios!avisos_internos_criado_por_fkey(nome)')
      .eq('escola_id', usuario.escola_id)
      .order('criado_em', { ascending: false })
      .limit(50),
    (admin as any)
      .from('avisos_lidos')
      .select('aviso_id')
      .eq('usuario_id', usuario.id),
  ])

  const avisos = avisosRes.data
  const lidos  = lidosRes.data

  const lidosSet = new Set((lidos ?? []).map((l: any) => l.aviso_id))

  const avisosFormatados = (avisos ?? []).map((a: any) => ({
    id: a.id,
    titulo: a.titulo,
    conteudo: a.conteudo,
    prioridade: a.prioridade,
    criado_em: a.criado_em,
    lido: lidosSet.has(a.id),
    criado_por_nome: a.criado_por?.nome ?? null,
  }))

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <AvisosInternosClient
        avisos={avisosFormatados}
        escolaId={usuario.escola_id}
        userId={usuario.id}
        userRole={usuario.role}
      />
    </div>
  )
}
