// Exemplos de como usar a API de assinaturas

export interface SubscriptionResponse {
  success: boolean
  data?: {
    customer: any
    subscription: any
    plan: any
  }
  error?: string
  details?: string
}

// Exemplo 1: Criar assinatura para cliente que preencheu o pré-contrato
export async function createSubscriptionFromPreContract(
  preContractData: any, 
  planType: 'controle' | 'gerencial' | 'avancado'
) {
  const customerData = {
    name: preContractData.nomeEmpresa,
    email: preContractData.emailContato,
    phone: preContractData.telefoneContato,
    cpfCnpj: preContractData.cnpj,
    postalCode: preContractData.cep,
    address: preContractData.endereco,
    addressNumber: preContractData.numero,
    complement: '',
    province: preContractData.bairro,
    city: preContractData.cidade,
    state: preContractData.estado,
    country: 'Brasil',
    observations: `Contato: ${preContractData.nomeContato} (${preContractData.cargoContato}). Segmento: ${preContractData.segmento}. Áreas BPO: ${preContractData.areas.join(', ')}.`
  }

  try {
    const response = await fetch('/api/subscriptions/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerData,
        planType,
        billingType: 'BOLETO'
      })
    })

    const result: SubscriptionResponse = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao criar assinatura')
    }

    return result.data
  } catch (error) {
    console.error('Erro ao criar assinatura:', error)
    throw error
  }
}

// Exemplo 2: Buscar assinaturas de um cliente
export async function getCustomerSubscriptions(customerId: string) {
  try {
    const response = await fetch(`/api/customers/${customerId}/subscriptions`)
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao buscar assinaturas')
    }

    return result.data
  } catch (error) {
    console.error('Erro ao buscar assinaturas:', error)
    throw error
  }
}

// Exemplo 3: Buscar pagamentos de uma assinatura
export async function getSubscriptionPayments(subscriptionId: string) {
  try {
    const response = await fetch(`/api/subscriptions/${subscriptionId}/payments`)
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao buscar pagamentos')
    }

    return result.data
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error)
    throw error
  }
}

// Exemplo 4: Cancelar assinatura
export async function cancelSubscription(subscriptionId: string) {
  try {
    const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
      method: 'DELETE'
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao cancelar assinatura')
    }

    return result.data
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error)
    throw error
  }
}

// Exemplo 5: Listar planos disponíveis
export async function getAvailablePlans() {
  try {
    const response = await fetch('/api/subscriptions/create')
    const result = await response.json()
    
    if (!result.success) {
      throw new Error('Erro ao buscar planos')
    }

    return result.plans
  } catch (error) {
    console.error('Erro ao buscar planos:', error)
    throw error
  }
}

// Hook React para usar nas páginas
export function useSubscriptionAPI() {
  return {
    createSubscriptionFromPreContract,
    getCustomerSubscriptions,
    getSubscriptionPayments,
    cancelSubscription,
    getAvailablePlans
  }
}