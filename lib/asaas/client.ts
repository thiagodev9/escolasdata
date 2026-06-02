import type { AsaasCliente, AsaasCobranca, AsaasBillingType } from './types'

function getBaseUrl() { return process.env.ASAAS_BASE_URL ?? 'https://sandbox.asaas.com/api/v3' }
function getApiKey()  { return process.env.ASAAS_API_KEY  ?? '' }

async function asaasRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'access_token': getApiKey(),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.errors?.[0]?.description ?? `Asaas error ${res.status}`)
  }
  return res.json()
}

// ─── Clientes ─────────────────────────────────────────────────────────────
export async function criarCliente(data: {
  name: string; email?: string; phone?: string; cpfCnpj?: string
}): Promise<AsaasCliente> {
  return asaasRequest('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function buscarClientePorCpf(cpfCnpj: string): Promise<AsaasCliente | null> {
  const res = await asaasRequest<{ data: AsaasCliente[] }>(`/customers?cpfCnpj=${cpfCnpj}`)
  return res.data?.[0] ?? null
}

// ─── Cobranças ─────────────────────────────────────────────────────────────
export async function criarCobranca(data: {
  customer: string
  billingType: AsaasBillingType
  value: number
  dueDate: string           // YYYY-MM-DD
  description?: string
  externalReference?: string
  installmentCount?: number // para cartão parcelado
  creditCard?: {
    holderName: string; number: string; expiryMonth: string
    expiryYear: string; ccv: string
  }
  creditCardHolderInfo?: {
    name: string; email: string; cpfCnpj: string
    postalCode: string; addressNumber: string; phone: string
  }
}): Promise<AsaasCobranca> {
  return asaasRequest('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function buscarCobranca(id: string): Promise<AsaasCobranca> {
  return asaasRequest(`/payments/${id}`)
}

export async function listarCobrancas(params?: {
  customer?: string; status?: string; limit?: number; offset?: number
}): Promise<{ data: AsaasCobranca[]; totalCount: number }> {
  const qs = new URLSearchParams()
  if (params?.customer) qs.set('customer', params.customer)
  if (params?.status)   qs.set('status',   params.status)
  if (params?.limit)    qs.set('limit',    String(params.limit))
  if (params?.offset)   qs.set('offset',   String(params.offset))
  return asaasRequest(`/payments?${qs}`)
}

export async function cancelarCobranca(id: string): Promise<AsaasCobranca> {
  return asaasRequest(`/payments/${id}`, { method: 'DELETE' })
}

export async function pixQrCode(id: string): Promise<{ encodedImage: string; payload: string; expirationDate: string }> {
  return asaasRequest(`/payments/${id}/pixQrCode`)
}

export async function boletoUrl(id: string): Promise<{ bankSlipUrl: string; identificationField: string }> {
  return asaasRequest(`/payments/${id}/identificationField`)
}

export function isConfigured(): boolean {
  const key = getApiKey()
  return !!key && key !== 'sua-asaas-key-aqui'
}
