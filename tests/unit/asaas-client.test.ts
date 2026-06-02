import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as AsaasClient from '@/lib/asaas/client'

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockOk(body: object) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response)
}
function mockFail(status: number, msg: string) {
  return Promise.resolve({
    ok: false, status,
    json: () => Promise.resolve({ errors: [{ description: msg }] }),
  } as Response)
}

describe('AsaasClient', () => {
  beforeEach(() => mockFetch.mockClear())

  describe('isConfigured()', () => {
    it('retorna false para chave placeholder', () => {
      vi.stubEnv('ASAAS_API_KEY', 'sua-asaas-key-aqui')
      expect(AsaasClient.isConfigured()).toBe(false)
    })

    it('retorna true para chave real', () => {
      vi.stubEnv('ASAAS_API_KEY', '$aact_real_key_abc123')
      expect(AsaasClient.isConfigured()).toBe(true)
    })
  })

  describe('criarCliente()', () => {
    it('envia POST /customers com os dados corretos', async () => {
      const cliente = { id: 'cus_123', name: 'Maria Silva' }
      mockFetch.mockReturnValueOnce(mockOk(cliente))

      const result = await AsaasClient.criarCliente({ name: 'Maria Silva', email: 'maria@test.com' })

      expect(mockFetch).toHaveBeenCalledOnce()
      const [url, opts] = mockFetch.mock.calls[0]
      expect(url).toContain('/customers')
      expect(opts.method).toBe('POST')
      expect(JSON.parse(opts.body)).toMatchObject({ name: 'Maria Silva', email: 'maria@test.com' })
      expect(result).toEqual(cliente)
    })

    it('lança erro com mensagem da API em caso de falha', async () => {
      mockFetch.mockReturnValueOnce(mockFail(400, 'CPF inválido'))
      await expect(AsaasClient.criarCliente({ name: 'X' })).rejects.toThrow('CPF inválido')
    })
  })

  describe('criarCobranca()', () => {
    it('cria cobrança PIX corretamente', async () => {
      const cobranca = { id: 'pay_abc', status: 'PENDING', billingType: 'PIX', value: 1200 }
      mockFetch.mockReturnValueOnce(mockOk(cobranca))

      const result = await AsaasClient.criarCobranca({
        customer: 'cus_123', billingType: 'PIX', value: 1200, dueDate: '2024-06-10',
      })

      const [url, opts] = mockFetch.mock.calls[0]
      expect(url).toContain('/payments')
      expect(opts.method).toBe('POST')
      expect(JSON.parse(opts.body)).toMatchObject({ billingType: 'PIX', value: 1200 })
      expect(result.id).toBe('pay_abc')
    })

    it('cria cobrança BOLETO corretamente', async () => {
      mockFetch.mockReturnValueOnce(mockOk({ id: 'pay_bol', billingType: 'BOLETO' }))
      const result = await AsaasClient.criarCobranca({
        customer: 'cus_123', billingType: 'BOLETO', value: 500, dueDate: '2024-07-01',
      })
      expect(result.billingType).toBe('BOLETO')
    })
  })

  describe('buscarCobranca()', () => {
    it('faz GET /payments/:id', async () => {
      mockFetch.mockReturnValueOnce(mockOk({ id: 'pay_123', status: 'RECEIVED' }))
      const result = await AsaasClient.buscarCobranca('pay_123')
      const [url] = mockFetch.mock.calls[0]
      expect(url).toContain('/payments/pay_123')
      expect(result.status).toBe('RECEIVED')
    })
  })

  describe('listarCobrancas()', () => {
    it('inclui filtros na query string', async () => {
      mockFetch.mockReturnValueOnce(mockOk({ data: [], totalCount: 0 }))
      await AsaasClient.listarCobrancas({ customer: 'cus_x', status: 'PENDING', limit: 10 })
      const [url] = mockFetch.mock.calls[0]
      expect(url).toContain('customer=cus_x')
      expect(url).toContain('status=PENDING')
      expect(url).toContain('limit=10')
    })
  })

  describe('pixQrCode()', () => {
    it('faz GET /payments/:id/pixQrCode', async () => {
      const qrData = { encodedImage: 'base64img', payload: 'pix-string', expirationDate: '2024-06-11' }
      mockFetch.mockReturnValueOnce(mockOk(qrData))
      const result = await AsaasClient.pixQrCode('pay_123')
      const [url] = mockFetch.mock.calls[0]
      expect(url).toContain('/payments/pay_123/pixQrCode')
      expect(result.payload).toBe('pix-string')
    })
  })

  describe('cancelarCobranca()', () => {
    it('faz DELETE /payments/:id', async () => {
      mockFetch.mockReturnValueOnce(mockOk({ id: 'pay_123', status: 'CANCELLED' }))
      await AsaasClient.cancelarCobranca('pay_123')
      const [, opts] = mockFetch.mock.calls[0]
      expect(opts.method).toBe('DELETE')
    })
  })
})
