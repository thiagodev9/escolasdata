import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { calcularMensalidadeSaas, descricaoCobranca } from '@/lib/billing'

function autorizado(req: NextRequest): boolean {
  // Vercel Cron envia Authorization: Bearer CRON_SECRET
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true
  // Chamada manual via header próprio
  return req.headers.get('x-billing-secret') === process.env.BILLING_SECRET
}

// POST — chamada manual (dashboard super_admin)
export async function POST(req: NextRequest) {
  if (!autorizado(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const admin = createClient()
  const mesRef = new Date().toISOString().slice(0, 7) // YYYY-MM

  // Busca escolas com assinatura ativa ou em trial
  const { data: assinaturas, error } = await (admin as any)
    .from('assinaturas_saas')
    .select('id, escola_id, asaas_customer_id, status, escolas(nome)')
    .in('status', ['ativa', 'trial'])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const resultados: any[] = []

  for (const ass of (assinaturas ?? [])) {
    try {
      // Verifica se cobrança do mês já foi gerada
      const { data: jaExiste } = await (admin as any)
        .from('cobrancas_saas')
        .select('id')
        .eq('escola_id', ass.escola_id)
        .eq('mes_referencia', mesRef)
        .maybeSingle()

      if (jaExiste) {
        resultados.push({ escola: ass.escolas?.nome, status: 'já gerada' })
        continue
      }

      // Conta alunos ativos da escola
      const { count: qtdAlunos } = await (admin as any)
        .from('alunos')
        .select('id', { count: 'exact', head: true })
        .eq('escola_id', ass.escola_id)
        .eq('status', 'ativo')

      const total = qtdAlunos ?? 0
      const { valor } = calcularMensalidadeSaas(total)
      const descricao = descricaoCobranca(ass.escolas?.nome ?? '', total, mesRef)

      // Vencimento: dia 1 do próximo mês ou próximo mês vigente
      const [ano, mes] = mesRef.split('-').map(Number)
      const dtVenc = `${ano}-${String(mes).padStart(2,'0')}-01`

      let asaasPaymentId: string | null = null

      // Gera cobrança no Asaas se houver customer_id cadastrado
      if (ass.asaas_customer_id && process.env.ASAAS_API_KEY && process.env.ASAAS_BASE_URL) {
        const asaasRes = await fetch(`${process.env.ASAAS_BASE_URL}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'access_token': process.env.ASAAS_API_KEY,
          },
          body: JSON.stringify({
            customer:          ass.asaas_customer_id,
            billingType:       'PIX',
            value:             valor,
            dueDate:           dtVenc,
            description:       descricao,
            externalReference: `${ass.escola_id}:${mesRef}`,
          }),
        })

        if (asaasRes.ok) {
          const asaasData = await asaasRes.json()
          asaasPaymentId = asaasData.id
        }
      }

      // Salva cobrança no banco
      await (admin as any).from('cobrancas_saas').insert({
        escola_id:        ass.escola_id,
        mes_referencia:   mesRef,
        qtd_alunos:       total,
        valor,
        asaas_payment_id: asaasPaymentId,
        status:           asaasPaymentId ? 'pendente' : 'nao_enviada',
      })

      resultados.push({
        escola:     ass.escolas?.nome,
        qtdAlunos:  total,
        valor:      `R$ ${valor.toFixed(2)}`,
        asaas:      asaasPaymentId ? '✅ gerada' : '⚠️ sem customer_id',
      })
    } catch (e: any) {
      resultados.push({ escola: ass.escolas?.nome, erro: e.message })
    }
  }

  return NextResponse.json({
    mes: mesRef,
    total: resultados.length,
    resultados,
  })
}

// GET — chamado pelo Vercel Cron todo dia 1 às 09h (gera cobranças)
export async function GET(req: NextRequest) {
  if (!autorizado(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const admin = createClient()
  const mesRef = new Date().toISOString().slice(0, 7)

  const { data: assinaturas } = await (admin as any)
    .from('assinaturas_saas')
    .select('escola_id, status, escolas(nome)')
    .in('status', ['ativa', 'trial'])

  const preview: any[] = []

  for (const ass of (assinaturas ?? [])) {
    const { count } = await (admin as any)
      .from('alunos')
      .select('id', { count: 'exact', head: true })
      .eq('escola_id', ass.escola_id)
      .eq('status', 'ativo')

    const qtd = count ?? 0
    const { valor, faixa, pricePerAluno } = calcularMensalidadeSaas(qtd)

    preview.push({
      escola:       ass.escolas?.nome,
      status:       ass.status,
      qtdAlunos:    qtd,
      faixa,
      pricePerAluno: `R$ ${pricePerAluno.toFixed(2)}`,
      total:         `R$ ${valor.toFixed(2)}`,
    })
  }

  const totalGeral = preview.reduce((acc, p) => {
    const v = parseFloat(p.total.replace('R$ ','').replace(',','.'))
    return acc + v
  }, 0)

  return NextResponse.json({ mes: mesRef, preview, totalGeral: `R$ ${totalGeral.toFixed(2)}` })
}
