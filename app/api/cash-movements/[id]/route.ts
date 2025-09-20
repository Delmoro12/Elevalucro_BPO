import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 API: Updating cash movement...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da movimentação é obrigatório' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const updateData: any = {}

    // Campos que podem ser atualizados
    if (body.financial_account_id !== undefined) updateData.financial_account_id = body.financial_account_id
    if (body.amount !== undefined) updateData.amount = parseFloat(body.amount)
    if (body.type !== undefined) updateData.type = body.type
    if (body.description !== undefined) updateData.description = body.description
    if (body.reference_type !== undefined) updateData.reference_type = body.reference_type
    if (body.reference_id !== undefined) updateData.reference_id = body.reference_id
    if (body.date !== undefined) updateData.date = body.date

    // Atualizar movimentação
    const { data: movement, error } = await supabase
      .from('cash_movements')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        financial_accounts!financial_account_id (
          id,
          description
        )
      `)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar movimentação' },
        { status: 500 }
      )
    }

    // Formatar resposta
    const formattedMovement = {
      ...movement,
      financial_account_name: movement.financial_accounts?.description || null,
      financial_accounts: undefined
    }

    console.log(`✅ Cash movement updated: ${id}`)

    return NextResponse.json({
      success: true,
      data: formattedMovement,
      message: 'Movimentação atualizada com sucesso'
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ API: Deleting cash movement...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da movimentação é obrigatório' },
        { status: 400 }
      )
    }

    // Deletar movimentação
    const { error } = await supabase
      .from('cash_movements')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao deletar movimentação' },
        { status: 500 }
      )
    }

    console.log(`✅ Cash movement deleted: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Movimentação deletada com sucesso'
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}