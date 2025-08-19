import { NextRequest, NextResponse } from 'next/server'
import { subscriptionService } from '../../../../../src/shared/integrations/asaas/api/subscriptions'

// GET /api/subscriptions/[id]/payments - Listar pagamentos de uma assinatura
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payments = await subscriptionService.getSubscriptionPayments(params.id)
    
    return NextResponse.json({
      success: true,
      data: payments,
      count: payments.length
    })

  } catch (error) {
    console.error('Erro ao buscar pagamentos da assinatura:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar pagamentos da assinatura',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}