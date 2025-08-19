import { NextRequest, NextResponse } from 'next/server'
import { subscriptionService } from '../../../../src/shared/integrations/asaas/api/subscriptions'

// GET /api/subscriptions/[id] - Buscar assinatura
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscription = await subscriptionService.getSubscription(params.id)
    
    return NextResponse.json({
      success: true,
      data: subscription
    })

  } catch (error) {
    console.error('Erro ao buscar assinatura:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar assinatura',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// PUT /api/subscriptions/[id] - Atualizar assinatura
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await request.json()
    
    const subscription = await subscriptionService.updateSubscription(
      params.id,
      updateData
    )
    
    return NextResponse.json({
      success: true,
      data: subscription
    })

  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao atualizar assinatura',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/subscriptions/[id] - Cancelar assinatura
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscription = await subscriptionService.cancelSubscription(params.id)
    
    return NextResponse.json({
      success: true,
      message: 'Assinatura cancelada com sucesso',
      data: subscription
    })

  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao cancelar assinatura',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}