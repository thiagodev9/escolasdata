import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'

// Asaas envia eventos de pagamento via webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, payment } = body

    // Eventos relevantes: PAYMENT_RECEIVED, PAYMENT_CONFIRMED, PAYMENT_OVERDUE
    console.log('[Asaas Webhook]', event, payment?.id)

    if (!payment?.externalReference) {
      return NextResponse.json({ ok: true })
    }

    // O externalReference é o aluno_id — podemos atualizar status no banco
    const admin = createAdmin()

    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      // Marcar aluno como ativo se estava pendente por inadimplência
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
