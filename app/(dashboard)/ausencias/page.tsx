export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { AusenciasClient } from '@/components/ausencias/ausencias-client'
import { getUsuarioAtual } from '@/lib/queries/get-usuario'

export default async function AusenciasPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario || !['super_admin','diretora'].includes(usuario.role)) redirect('/dashboard')

  const admin = createAdmin()

  const [ausenciasRes, colaboradoresRes] = await Promise.all([
    (admin as any)
      .from('ausencias_professores')
      .select('id, colaborador_id, data, motivo, substituido_por_nome, criado_em, colaboradores(nome)')
      .eq('escola_id', usuario.escola_id)
      .order('data', { ascending: false }),
    (admin as any)
      .from('colaboradores')
      .select('id, nome, cargo')
      .eq('escola_id', usuario.escola_id)
      .eq('ativo', true)
      .in('cargo', ['professora','auxiliar_classe','monitora','coordenadora','psicologa','fonoaudiologa'])
      .order('nome'),
  ])

  const ausencias = (ausenciasRes.data ?? []).map((a: any) => ({
    id: a.id,
    colaborador_id: a.colaborador_id,
    colaborador_nome: a.colaboradores?.nome ?? '—',
    data: a.data,
    motivo: a.motivo,
    substituido_por_nome: a.substituido_por_nome,
    criado_em: a.criado_em,
  }))

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <AusenciasClient
        ausencias={ausencias}
        colaboradores={colaboradoresRes.data ?? []}
        escolaId={usuario.escola_id}
      />
    </div>
  )
}
