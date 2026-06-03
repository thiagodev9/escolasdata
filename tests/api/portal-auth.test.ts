import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// vi.hoisted garante que os mocks existem antes de vi.mock ser executado (hoisting)
const { mockFrom, mockSignInWithOtp } = vi.hoisted(() => ({
  mockFrom:          vi.fn(),
  mockSignInWithOtp: vi.fn().mockResolvedValue({ error: null }),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createClient: () => ({
    from: mockFrom,
    auth: { signInWithOtp: mockSignInWithOtp },
  }),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 4, resetAt: Date.now() + 90000 }),
}))

import { POST } from '@/app/api/portal/auth/route'
import { checkRateLimit } from '@/lib/rate-limit'

function makeRequest(body: object, ip = '1.2.3.4') {
  return new NextRequest('http://localhost/api/portal/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  })
}

function makeChain(data: any) {
  const chain: any = { data, error: null }
  const proxy: any = new Proxy(chain, {
    get(t, p) {
      // Impede que o proxy seja tratado como thenable pelo await
      if (p === 'then' || p === 'catch' || p === 'finally') return undefined
      if (p in t) return t[p]
      return () => proxy
    },
  })
  return proxy
}

describe('POST /api/portal/auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignInWithOtp.mockResolvedValue({ error: null })
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 4, resetAt: Date.now() + 90000 })
  })

  it('retorna 400 para e-mail inválido', async () => {
    const res = await POST(makeRequest({ email: 'nao-eh-email' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/e-mail inválido/i)
  })

  it('retorna 400 quando e-mail está ausente', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it('retorna 200 para e-mail válido de responsável cadastrado', async () => {
    mockFrom.mockReturnValue(makeChain({ id: 'r1' }))
    const res = await POST(makeRequest({ email: 'pai@exemplo.com' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it('retorna 200 mesmo quando e-mail não está cadastrado (não revela existência)', async () => {
    mockFrom.mockReturnValue(makeChain(null))
    const res = await POST(makeRequest({ email: 'desconhecido@exemplo.com' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it('chama signInWithOtp apenas quando responsável existe', async () => {
    mockFrom.mockReturnValue(makeChain({ id: 'r1' }))
    await POST(makeRequest({ email: 'pai@exemplo.com' }))
    expect(mockSignInWithOtp).toHaveBeenCalledOnce()
  })

  it('NÃO chama signInWithOtp quando responsável não existe', async () => {
    mockFrom.mockReturnValue(makeChain(null))
    await POST(makeRequest({ email: 'naoexiste@exemplo.com' }))
    expect(mockSignInWithOtp).not.toHaveBeenCalled()
  })

  it('retorna 429 quando rate limit é excedido', async () => {
    vi.mocked(checkRateLimit).mockReturnValueOnce({ allowed: false, remaining: 0, resetAt: Date.now() + 900000 })
    const res = await POST(makeRequest({ email: 'pai@exemplo.com' }))
    expect(res.status).toBe(429)
  })

  it('normaliza e-mail para minúsculas antes de buscar', async () => {
    mockFrom.mockReturnValue(makeChain({ id: 'r1' }))
    await POST(makeRequest({ email: 'PAI@EXEMPLO.COM' }))
    expect(mockSignInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'pai@exemplo.com' })
    )
  })
})
