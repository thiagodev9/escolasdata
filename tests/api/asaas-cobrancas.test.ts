import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mocks antes do import das rotas
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }) },
  }),
}))
vi.mock('@/lib/supabase/admin', () => ({
  createClient: () => ({ from: vi.fn().mockReturnValue({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) }) }) }),
}))

const mockAsaas = {
  isConfigured:        vi.fn(),
  criarCliente:        vi.fn(),
  buscarClientePorCpf: vi.fn(),
  criarCobranca:       vi.fn(),
  pixQrCode:           vi.fn(),
  listarCobrancas:     vi.fn(),
}
vi.mock('@/lib/asaas/client', () => mockAsaas)

const { GET, POST } = await import('@/app/api/asaas/cobrancas/route')

describe('GET /api/asaas/cobrancas', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 503 quando Asaas não está configurado', async () => {
    mockAsaas.isConfigured.mockReturnValue(false)
    const req = new NextRequest('http://localhost/api/asaas/cobrancas')
    const res = await GET(req)
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.configured).toBe(false)
  })

  it('retorna cobranças quando Asaas está configurado', async () => {
    mockAsaas.isConfigured.mockReturnValue(true)
    mockAsaas.listarCobrancas.mockResolvedValue({ data: [{ id: 'pay_1' }], totalCount: 1 })
    const req = new NextRequest('http://localhost/api/asaas/cobrancas')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toHaveLength(1)
  })

  it('passa filtros de customer e status', async () => {
    mockAsaas.isConfigured.mockReturnValue(true)
    mockAsaas.listarCobrancas.mockResolvedValue({ data: [], totalCount: 0 })
    const req = new NextRequest('http://localhost/api/asaas/cobrancas?customer=cus_1&status=PENDING')
    await GET(req)
    expect(mockAsaas.listarCobrancas).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_1', status: 'PENDING' })
    )
  })
})

describe('POST /api/asaas/cobrancas', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 503 quando Asaas não configurado', async () => {
    mockAsaas.isConfigured.mockReturnValue(false)
    const req = new NextRequest('http://localhost/api/asaas/cobrancas', {
      method: 'POST',
      body: JSON.stringify({ responsavelNome: 'Maria', valor: 100, vencimento: '2024-06-10', tipo: 'PIX' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(503)
  })

  it('cria cliente e cobrança PIX e retorna pixData', async () => {
    mockAsaas.isConfigured.mockReturnValue(true)
    mockAsaas.buscarClientePorCpf.mockResolvedValue(null)
    mockAsaas.criarCliente.mockResolvedValue({ id: 'cus_new', name: 'Maria' })
    mockAsaas.criarCobranca.mockResolvedValue({ id: 'pay_new', status: 'PENDING', billingType: 'PIX', value: 1200 })
    mockAsaas.pixQrCode.mockResolvedValue({ encodedImage: 'base64', payload: 'pix-code', expirationDate: '2024-06-11' })

    const req = new NextRequest('http://localhost/api/asaas/cobrancas', {
      method: 'POST',
      body: JSON.stringify({
        responsavelNome: 'Maria', responsavelEmail: 'maria@test.com',
        responsavelCpf: '000.000.000-00', valor: 1200,
        vencimento: '2024-06-10', descricao: 'Mensalidade', tipo: 'PIX', alunoId: 'a1',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.cobranca.id).toBe('pay_new')
    expect(body.pixData.payload).toBe('pix-code')
  })

  it('reutiliza cliente existente por CPF', async () => {
    mockAsaas.isConfigured.mockReturnValue(true)
    mockAsaas.buscarClientePorCpf.mockResolvedValue({ id: 'cus_existente', name: 'Ana' })
    mockAsaas.criarCobranca.mockResolvedValue({ id: 'pay_b', billingType: 'BOLETO', value: 1200 })

    const req = new NextRequest('http://localhost/api/asaas/cobrancas', {
      method: 'POST',
      body: JSON.stringify({
        responsavelNome: 'Ana', responsavelCpf: '111.111.111-11',
        valor: 1200, vencimento: '2024-06-10', tipo: 'BOLETO',
      }),
    })
    await POST(req)
    expect(mockAsaas.criarCliente).not.toHaveBeenCalled()
    expect(mockAsaas.criarCobranca).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_existente' })
    )
  })

  it('retorna 500 em caso de erro do Asaas', async () => {
    mockAsaas.isConfigured.mockReturnValue(true)
    mockAsaas.buscarClientePorCpf.mockResolvedValue(null)
    mockAsaas.criarCliente.mockRejectedValue(new Error('CPF inválido'))

    const req = new NextRequest('http://localhost/api/asaas/cobrancas', {
      method: 'POST',
      body: JSON.stringify({ responsavelNome: 'X', valor: 100, vencimento: '2024-06-10', tipo: 'PIX' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('CPF inválido')
  })
})
