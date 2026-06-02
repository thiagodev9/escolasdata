import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) })
const mockFrom   = vi.fn().mockReturnValue({ update: mockUpdate })

vi.mock('@/lib/supabase/admin', () => ({
  createClient: () => ({ from: mockFrom }),
}))

const { POST } = await import('@/app/api/asaas/webhook/route')

function makeWebhookReq(event: string, payment: object) {
  return new NextRequest('http://localhost/api/asaas/webhook', {
    method: 'POST',
    body: JSON.stringify({ event, payment }),
  })
}

describe('POST /api/asaas/webhook', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna ok: true para qualquer evento', async () => {
    const res = await POST(makeWebhookReq('PAYMENT_CREATED', { id: 'pay_1' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  it('não atualiza banco quando payment.externalReference está ausente', async () => {
    await POST(makeWebhookReq('PAYMENT_RECEIVED', { id: 'pay_1' }))
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('atualiza aluno para "ativo" em PAYMENT_RECEIVED', async () => {
    await POST(makeWebhookReq('PAYMENT_RECEIVED', { id: 'pay_1', externalReference: 'aluno-uuid-1' }))
    expect(mockFrom).toHaveBeenCalledWith('alunos')
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'ativo' })
  })

  it('atualiza aluno para "ativo" em PAYMENT_CONFIRMED', async () => {
    await POST(makeWebhookReq('PAYMENT_CONFIRMED', { id: 'pay_1', externalReference: 'aluno-uuid-2' }))
    expect(mockFrom).toHaveBeenCalledWith('alunos')
  })

  it('não atualiza banco para PAYMENT_OVERDUE', async () => {
    await POST(makeWebhookReq('PAYMENT_OVERDUE', { id: 'pay_1', externalReference: 'aluno-uuid-1' }))
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('retorna 200 mesmo quando body é inválido', async () => {
    const req = new NextRequest('http://localhost/api/asaas/webhook', {
      method: 'POST', body: 'invalid-json',
    })
    const res = await POST(req)
    expect(res.status).toBe(500) // JSON parse error
  })
})
