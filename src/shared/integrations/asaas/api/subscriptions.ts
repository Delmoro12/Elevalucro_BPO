import { asaasClient } from '../client'
import { AsaasSubscription, AsaasCustomer, AsaasPayment, AsaasApiResponse } from '../types'

export interface CreateSubscriptionData {
  customerData: AsaasCustomer
  subscriptionData: Omit<AsaasSubscription, 'customer' | 'id' | 'status' | 'dateCreated'>
}

export interface BPOSubscriptionPlans {
  controle: {
    value: 950
    description: 'Plano Controle - Básico organizado'
  }
  gerencial: {
    value: 1300
    description: 'Plano Gerencial - Controle + Gestão'
  }
  avancado: {
    value: 1700
    description: 'Plano Avançado - Gerencial + Inteligência'
  }
}

export const BPO_PLANS: BPOSubscriptionPlans = {
  controle: {
    value: 950,
    description: 'Plano Controle - Básico organizado'
  },
  gerencial: {
    value: 1300,
    description: 'Plano Gerencial - Controle + Gestão'
  },
  avancado: {
    value: 1700,
    description: 'Plano Avançado - Gerencial + Inteligência'
  }
}

export class SubscriptionService {
  
  /**
   * Criar assinatura BPO baseada no plano escolhido
   */
  async createBPOSubscription(
    customerData: AsaasCustomer,
    planType: keyof BPOSubscriptionPlans,
    billingType: 'BOLETO' | 'PIX' = 'BOLETO',
    customValue?: number
  ): Promise<{
    customer: AsaasCustomer
    subscription: AsaasSubscription
  }> {
    try {
      // 1. Buscar ou criar cliente
      const customer = await this.findOrCreateCustomer(customerData)
      
      // 2. Configurar dados da assinatura baseado no plano
      const plan = BPO_PLANS[planType]
      const subscriptionData: Omit<AsaasSubscription, 'customer' | 'id' | 'status' | 'dateCreated'> = {
        billingType,
        value: customValue || plan.value,
        cycle: 'MONTHLY',
        nextDueDate: this.getNextBillingDate(),
        description: plan.description,
        // Configurações padrão para BPO
        discount: {
          value: 5, // 5% desconto se pagar até a data
          dueDateLimitDays: 0,
          type: 'PERCENTAGE'
        },
        interest: {
          value: 2, // 2% juros ao mês
          type: 'PERCENTAGE'
        },
        fine: {
          value: 2, // 2% multa
          type: 'PERCENTAGE'
        }
      }

      // 3. Criar assinatura
      const subscription = await asaasClient.createSubscription({
        ...subscriptionData,
        customer: customer.id!
      })

      return { customer, subscription }
    } catch (error) {
      throw new Error(`Erro ao criar assinatura BPO: ${error}`)
    }
  }

  /**
   * Criar assinatura personalizada
   */
  async createCustomSubscription(data: CreateSubscriptionData): Promise<{
    customer: AsaasCustomer
    subscription: AsaasSubscription
  }> {
    try {
      // 1. Buscar ou criar cliente
      const customer = await this.findOrCreateCustomer(data.customerData)
      
      // 2. Criar assinatura
      const subscription = await asaasClient.createSubscription({
        ...data.subscriptionData,
        customer: customer.id!
      })

      return { customer, subscription }
    } catch (error) {
      throw new Error(`Erro ao criar assinatura: ${error}`)
    }
  }

  /**
   * Listar pagamentos de uma assinatura
   */
  async getSubscriptionPayments(subscriptionId: string): Promise<AsaasPayment[]> {
    try {
      const response = await fetch(
        `${asaasClient['config'].baseUrl}/subscriptions/${subscriptionId}/payments`,
        {
          headers: asaasClient['config'].headers
        }
      )
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      
      const data: AsaasApiResponse<AsaasPayment> = await response.json()
      return data.data
    } catch (error) {
      throw new Error(`Erro ao buscar pagamentos da assinatura: ${error}`)
    }
  }

  /**
   * Atualizar assinatura
   */
  async updateSubscription(
    subscriptionId: string, 
    updateData: Partial<AsaasSubscription>
  ): Promise<AsaasSubscription> {
    try {
      const response = await fetch(
        `${asaasClient['config'].baseUrl}/subscriptions/${subscriptionId}`,
        {
          method: 'PUT',
          headers: asaasClient['config'].headers,
          body: JSON.stringify(updateData)
        }
      )
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(`Erro ao atualizar assinatura: ${error}`)
    }
  }

  /**
   * Cancelar assinatura
   */
  async cancelSubscription(subscriptionId: string): Promise<AsaasSubscription> {
    try {
      const response = await fetch(
        `${asaasClient['config'].baseUrl}/subscriptions/${subscriptionId}`,
        {
          method: 'DELETE',
          headers: asaasClient['config'].headers
        }
      )
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(`Erro ao cancelar assinatura: ${error}`)
    }
  }

  /**
   * Buscar assinatura por ID
   */
  async getSubscription(subscriptionId: string): Promise<AsaasSubscription> {
    return asaasClient.getSubscription(subscriptionId)
  }

  /**
   * Listar assinaturas de um cliente
   */
  async getCustomerSubscriptions(customerId: string): Promise<AsaasSubscription[]> {
    try {
      const response = await fetch(
        `${asaasClient['config'].baseUrl}/subscriptions?customer=${customerId}`,
        {
          headers: asaasClient['config'].headers
        }
      )
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      
      const data: AsaasApiResponse<AsaasSubscription> = await response.json()
      return data.data
    } catch (error) {
      throw new Error(`Erro ao buscar assinaturas do cliente: ${error}`)
    }
  }

  // Métodos privados
  private async findOrCreateCustomer(customerData: AsaasCustomer): Promise<AsaasCustomer> {
    try {
      // Tentar buscar cliente existente por CNPJ/CPF
      const existingCustomers = await asaasClient.listCustomers({
        cpfCnpj: customerData.cpfCnpj,
        limit: 1
      })

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0]
      }

      // Se não existir, criar novo
      return await asaasClient.createCustomer(customerData)
    } catch (error) {
      throw new Error(`Erro ao buscar/criar cliente: ${error}`)
    }
  }

  private getNextBillingDate(): string {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(5) // Todo dia 5 do mês
    return nextMonth.toISOString().split('T')[0]
  }
}

export const subscriptionService = new SubscriptionService()