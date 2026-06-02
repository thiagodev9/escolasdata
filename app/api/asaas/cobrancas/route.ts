import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import * as Asaas from '@/lib/asaas/client'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customer')
    const status     = searchParams.get('status') ?? undefined

    if (!Asaas.isConfigured()) {
      return NextResponse.json({ error: 'Asaas não configurado', configured: false }, { status: 503 })
    }

    const cobrancas = await Asaas.listarCobrancas({ customer: customerId ?? undefined, status, limit: 50 })
    return NextResponse.json(cobrancas)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await req.json()
    const { responsavelNome, responsavelEmail, responsavelCpf, valor, vencimento, descricao, tipo, alunoId } = body

    if (!Asaas.isConfigured()) {
      return NextResponse.json({ error: 'Asaas não configurado. Configure ASAAS_API_KEY no .env.local', configured: false }, { status: 503 })
    }

    // 1. Criar ou recuperar cliente no Asaas
    let cliente = responsavelCpf ? await Asaas.buscarClientePorCpf(responsavelCpf) : null
    if (!cliente) {
      cliente = await Asaas.criarCliente({ name: responsavelNome, email: responsavelEmail, cpfCnpj: responsavelCpf })
    }

    // 2. Criar cobrança
    const cobranca = await Asaas.criarCobranca({
      customer: cliente.id,
      billingType: tipo ?? 'PIX',
      value: valor,
      dueDate: vencimento,
      description: descricao,
      externalReference: alunoId,
    })

    // 3. Buscar QR code se PIX
    let pixData = null
    if (tipo === 'PIX') {
      pixData = await Asaas.pixQrCode(cobranca.id).catch(() => null)
    }

    return NextResponse.json({ cobranca, pixData })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
