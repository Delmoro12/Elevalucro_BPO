import { NextRequest, NextResponse } from 'next/server'
import { subscriptionService, BPO_PLANS } from '../../../../src/shared/integrations/asaas/api/subscriptions'
import { AsaasCustomer } from '../../../../src/shared/integrations/asaas/types'

export interface CreateSubscriptionRequest {
  customerData: AsaasCustomer
  planType: keyof typeof BPO_PLANS
  billingType?: 'BOLETO' | 'PIX'
  customValue?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSubscriptionRequest = await request.json()
    
    // Validações básicas
    if (!body.customerData || !body.planType) {
      return NextResponse.json(
        { error: 'customerData e planType são obrigatórios' },
        { status: 400 }
      )
    }

    if (!BPO_PLANS[body.planType]) {
      return NextResponse.json(
        { error: 'Plano inválido. Use: controle, gerencial ou avancado' },
        { status: 400 }
      )
    }

    // Criar assinatura
    const result = await subscriptionService.createBPOSubscription(
      body.customerData,
      body.planType,
      body.billingType || 'BOLETO',
      body.customValue
    )

    return NextResponse.json({
      success: true,
      data: {
        customer: result.customer,
        subscription: result.subscription,
        plan: BPO_PLANS[body.planType]
      }
    })

  } catch (error) {
    console.error('Erro ao criar assinatura:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao criar assinatura',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// Método GET para listar planos disponíveis
export async function GET() {
  return NextResponse.json({
    success: true,
    plans: BPO_PLANS
  })
}