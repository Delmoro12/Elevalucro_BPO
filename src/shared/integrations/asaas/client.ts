import { ASAAS_CONFIG } from './config'
import { AsaasCustomer, AsaasPayment, AsaasSubscription, AsaasApiResponse, AsaasError } from './types'

export class AsaasClient {
  private config = ASAAS_CONFIG.getCurrentConfig()

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.config.headers,
        ...options.headers
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Asaas API Error: ${JSON.stringify(data)}`)
    }

    return data
  }

  // Clientes
  async createCustomer(customer: AsaasCustomer): Promise<AsaasCustomer> {
    return this.makeRequest<AsaasCustomer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer)
    })
  }

  async getCustomer(customerId: string): Promise<AsaasCustomer> {
    return this.makeRequest<AsaasCustomer>(`/customers/${customerId}`)
  }

  async updateCustomer(customerId: string, customer: Partial<AsaasCustomer>): Promise<AsaasCustomer> {
    return this.makeRequest<AsaasCustomer>(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(customer)
    })
  }

  async listCustomers(params?: { 
    offset?: number
    limit?: number
    name?: string
    email?: string
    cpfCnpj?: string
  }): Promise<AsaasApiResponse<AsaasCustomer>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString() ? `?${searchParams}` : ''
    return this.makeRequest<AsaasApiResponse<AsaasCustomer>>(`/customers${query}`)
  }

  // Pagamentos
  async createPayment(payment: AsaasPayment): Promise<AsaasPayment> {
    return this.makeRequest<AsaasPayment>('/payments', {
      method: 'POST',
      body: JSON.stringify(payment)
    })
  }

  async getPayment(paymentId: string): Promise<AsaasPayment> {
    return this.makeRequest<AsaasPayment>(`/payments/${paymentId}`)
  }

  async listPayments(params?: {
    offset?: number
    limit?: number
    customer?: string
    status?: string
    dueDate?: string
  }): Promise<AsaasApiResponse<AsaasPayment>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString() ? `?${searchParams}` : ''
    return this.makeRequest<AsaasApiResponse<AsaasPayment>>(`/payments${query}`)
  }

  // Assinaturas
  async createSubscription(subscription: AsaasSubscription): Promise<AsaasSubscription> {
    return this.makeRequest<AsaasSubscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscription)
    })
  }

  async getSubscription(subscriptionId: string): Promise<AsaasSubscription> {
    return this.makeRequest<AsaasSubscription>(`/subscriptions/${subscriptionId}`)
  }
}

export const asaasClient = new AsaasClient()