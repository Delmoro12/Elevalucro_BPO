// Tipos base do Asaas
export interface AsaasCustomer {
  id?: string
  name: string
  email: string
  phone?: string
  mobilePhone?: string
  cpfCnpj: string
  postalCode?: string
  address?: string
  addressNumber?: string
  complement?: string
  province?: string
  city?: string
  state?: string
  country?: string
  observations?: string
}

export interface AsaasPayment {
  id?: string
  customer: string // ID do cliente
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED'
  value: number
  dueDate: string // YYYY-MM-DD
  description?: string
  externalReference?: string
  installmentCount?: number
  installmentValue?: number
  discount?: {
    value: number
    dueDateLimitDays: number
    type: 'FIXED' | 'PERCENTAGE'
  }
  interest?: {
    value: number
    type: 'PERCENTAGE'
  }
  fine?: {
    value: number
    type: 'FIXED' | 'PERCENTAGE'
  }
}

export interface AsaasSubscription {
  id?: string
  customer: string
  billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD'
  value: number
  nextDueDate: string // YYYY-MM-DD
  cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'
  description?: string
  endDate?: string
  maxPayments?: number
  status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  dateCreated?: string
  
  // Configurações de desconto
  discount?: {
    value: number
    dueDateLimitDays: number
    type: 'FIXED' | 'PERCENTAGE'
  }
  
  // Configurações de juros
  interest?: {
    value: number
    type: 'PERCENTAGE'
  }
  
  // Configurações de multa
  fine?: {
    value: number
    type: 'FIXED' | 'PERCENTAGE'
  }
  
  // Split de pagamento
  split?: Array<{
    walletId: string
    fixedValue?: number
    percentualValue?: number
  }>
}

export interface AsaasWebhook {
  id?: string
  name: string
  url: string
  email?: string
  sendType: 'SEQUENTIALLY' | 'NON_SEQUENTIALLY'
  apiVersion: number
  enabled: boolean
  interrupted: boolean
  authToken?: string
}

// Respostas da API
export interface AsaasApiResponse<T> {
  object: string
  hasMore: boolean
  totalCount: number
  limit: number
  offset: number
  data: T[]
}

export interface AsaasError {
  errors: Array<{
    code: string
    description: string
  }>
}