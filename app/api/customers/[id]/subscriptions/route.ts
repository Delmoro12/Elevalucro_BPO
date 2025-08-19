import { NextRequest, NextResponse } from 'next/server'
import { subscriptionService } from '../../../../../src/shared/integrations/asaas/api/subscriptions'

// GET /api/customers/[id]/subscriptions - Listar assinaturas de um cliente
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptions = await subscriptionService.getCustomerSubscriptions(params.id)
    
    return NextResponse.json({
      success: true,
      data: subscriptions,
      count: subscriptions.length
    })

  } catch (error) {
    console.error('Erro ao buscar assinaturas do cliente:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar assinaturas do cliente',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}