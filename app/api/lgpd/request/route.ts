import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

// POST — criar solicitação LGPD (pública ou autenticada)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { escola_id, responsavel_email, responsavel_nome, tipo, observacoes } = body

    if (!escola_id || !responsavel_email || !tipo) {
      return NextResponse.json({ error: 'escola_id, responsavel_email e tipo são obrigatórios.' }, { status: 400 })
    }

    const admin = createClient()
    const { data, error } = await (admin as any)
      .from('lgpd_requests')
      .insert({
        escola_id, responsavel_email: responsavel_email.trim(),
        responsavel_nome: responsavel_nome?.trim() ?? null,
        tipo, observacoes: observacoes?.trim() ?? null,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: data.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH — processar solicitação (admin)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const admin = createClient()
    const { data: usuario } = await (admin as any)
      .from('usuarios').select('escola_id, role').eq('id', user.id).single() as { data: { escola_id: string; role: string } | null }

    if (!usuario || !['diretora', 'super_admin'].includes(usuario.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { id, status, resposta } = await request.json()
    const { error } = await (admin as any)
      .from('lgpd_requests')
      .update({
        status, resposta: resposta ?? null,
        processado_por: user.id,
        processado_em: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('escola_id', usuario.escola_id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
