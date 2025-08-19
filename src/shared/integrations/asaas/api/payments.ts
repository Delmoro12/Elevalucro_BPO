import { asaasClient } from '../client'
import { AsaasPayment, AsaasCustomer } from '../types'

export interface CreatePaymentData {
  customerData: AsaasCustomer
  paymentData: Omit<AsaasPayment, 'customer'>
}

export interface CreateRecurringPaymentData {
  customerData: AsaasCustomer
  subscriptionData: {
    value: number
    cycle: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'
    billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
    description?: string
  }
}

export class PaymentService {
  // Criar cobrança única
  async createSinglePayment(data: CreatePaymentData): Promise<{
    customer: AsaasCustomer
    payment: AsaasPayment
  }> {
    try {
      // 1. Criar ou buscar cliente
      const customer = await this.findOrCreateCustomer(data.customerData)
      
      // 2. Criar cobrança
      const payment = await asaasClient.createPayment({
        ...data.paymentData,
        customer: customer.id!
      })

      return { customer, payment }
    } catch (error) {
      throw new Error(`Erro ao criar cobrança: ${error}`)
    }
  }

  // Criar cobrança recorrente
  async createRecurringPayment(data: CreateRecurringPaymentData): Promise<{
    customer: AsaasCustomer
    subscription: any
  }> {
    try {
      // 1. Criar ou buscar cliente
      const customer = await this.findOrCreateCustomer(data.customerData)
      
      // 2. Criar assinatura
      const subscription = await asaasClient.createSubscription({
        customer: customer.id!,
        value: data.subscriptionData.value,
        cycle: data.subscriptionData.cycle,
        billingType: data.subscriptionData.billingType,
        nextDueDate: this.getNextDueDate(),
        description: data.subscriptionData.description
      })

      return { customer, subscription }
    } catch (error) {
      throw new Error(`Erro ao criar cobrança recorrente: ${error}`)
    }
  }

  // Buscar ou criar cliente
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

  // Calcular próxima data de vencimento (próximo mês)
  private getNextDueDate(): string {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(5) // Todo dia 5 do mês
    return nextMonth.toISOString().split('T')[0]
  }

  // Buscar pagamentos de um cliente
  async getCustomerPayments(customerId: string): Promise<AsaasPayment[]> {
    try {
      const response = await asaasClient.listPayments({
        customer: customerId,
        limit: 100
      })
      return response.data
    } catch (error) {
      throw new Error(`Erro ao buscar pagamentos: ${error}`)
    }
  }
}

export const paymentService = new PaymentService()