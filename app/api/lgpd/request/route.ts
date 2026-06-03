import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

// POST — criar solicitação LGPD (rota pública — responsável sem conta)
export async function POST(request: NextRequest) {
  // 🔐 Rate limit: 3 solicitações por IP a cada hora
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'

  const rl = checkRateLimit(`lgpd:${ip}`, { windowMs: 60 * 60 * 1000, max: 3 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Muitas solicitações. Tente novamente em 1 hora.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    )
  }

  try {
    const body = await request.json()
    const { escola_id, responsavel_email, responsavel_nome, tipo, observacoes } = body

    if (!escola_id || !responsavel_email || !tipo) {
      return NextResponse.json(
        { error: 'escola_id, responsavel_email e tipo são obrigatórios.' },
        { status: 400 }
      )
    }

    // Validar formato do e-mail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responsavel_email)) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
    }

    // Validar tipo permitido
    const TIPOS_VALIDOS = ['exportacao', 'exclusao', 'correcao', 'portabilidade']
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return NextResponse.json({ error: 'Tipo de solicitação inválido.' }, { status: 400 })
    }

    const admin = createClient()

    // 🔐 Confirma que a escola existe — evita inserir dados em escola inexistente
    const { data: escola } = await (admin as any)
      .from('escolas').select('id').eq('id', escola_id).eq('ativo', true).maybeSingle()

    if (!escola) {
      return NextResponse.json({ error: 'Escola não encontrada.' }, { status: 404 })
    }

    // 🔐 Rate limit adicional por email — máx 2 solicitações do mesmo e-mail em 24h
    const rlEmail = checkRateLimit(
      `lgpd:email:${responsavel_email.toLowerCase()}:${escola_id}`,
      { windowMs: 24 * 60 * 60 * 1000, max: 2 }
    )
    if (!rlEmail.allowed) {
      return NextResponse.json(
        { error: 'Já existe uma solicitação recente para este e-mail. Tente novamente amanhã.' },
        { status: 429 }
      )
    }

    const { data, error } = await (admin as any)
      .from('lgpd_requests')
      .insert({
        escola_id,
        responsavel_email: responsavel_email.trim().toLowerCase(),
        responsavel_nome:  responsavel_nome?.trim() ?? null,
        tipo,
        observacoes:       observacoes?.trim() ?? null,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: data.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH — processar solicitação (admin apenas)
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

    const STATUS_VALIDOS = ['pendente', 'processando', 'concluido', 'rejeitado']
    if (!STATUS_VALIDOS.includes(status)) {
      return NextResponse.json({ error: 'Status inválido.' }, { status: 400 })
    }

    const { error } = await (admin as any)
      .from('lgpd_requests')
      .update({
        status,
        resposta:      resposta ?? null,
        processado_por: user.id,
        processado_em: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('escola_id', usuario.escola_id) // garante que só processa da própria escola

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
