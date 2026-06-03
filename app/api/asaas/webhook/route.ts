import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'

// Asaas envia o token configurado no painel em cada requisição
// Painel Asaas → Configurações → Integrações → Webhooks → Access Token
// Defina ASAAS_WEBHOOK_TOKEN no .env com o mesmo valor
function validarToken(req: NextRequest): boolean {
  const token = process.env.ASAAS_WEBHOOK_TOKEN
  if (!token) {
    // Se variável não configurada, bloqueia por segurança em produção
    if (process.env.NODE_ENV === 'production') return false
    return true // dev sem token configurado: permite
  }
  const received = req.headers.get('asaas-access-token')
  return received === token
}

export async function POST(req: NextRequest) {
  // 🔐 Valida token do webhook antes de processar qualquer dado
  if (!validarToken(req)) {
    console.warn('[Asaas Webhook] Token inválido ou ausente:', req.headers.get('asaas-access-token')?.slice(0, 8))
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { event, payment } = body

    console.log('[Asaas Webhook]', event, payment?.id)

    if (!payment?.externalReference) {
      return NextResponse.json({ ok: true })
    }

    const admin = createAdmin()

    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      await (admin as any)
        .from('alunos')
        .update({ status: 'ativo' })
        .eq('id', payment.externalReference)
        .eq('status', 'pendente')
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[Asaas Webhook Error]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
