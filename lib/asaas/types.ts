export type AsaasStatus = 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'CANCELLED'
export type AsaasBillingType = 'BOLETO' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD'

export interface AsaasCobranca {
  id: string
  customer: string
  customerName?: string
  billingType: AsaasBillingType
  value: number
  netValue?: number
  dueDate: string
  status: AsaasStatus
  description?: string
  invoiceUrl?: string
  bankSlipUrl?: string
  pixQrCodeUrl?: string
  paymentDate?: string
}

export interface AsaasCliente {
  id: string
  name: string
  email?: string
  phone?: string
  cpfCnpj?: string
}
