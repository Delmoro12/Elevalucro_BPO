import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../../src/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 API: Reversing receipt for account:', params.id);
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Tentar usar função SQL transacional primeiro
    const { data: result, error: rpcError } = await supabase.rpc(
      'reverse_financial_transaction',
      { 
        p_transaction_id: params.id,
        p_transaction_type: 'receivable'
      }
    )

    if (!rpcError) {
      console.log('✅ Recebimento estornado com transação')
      return NextResponse.json({
        success: true,
        data: result,
        message: 'Recebimento estornado com sucesso'
      })
    }

    // Se a função não existir, fazer manualmente
    if (rpcError.message?.includes('function') || rpcError.message?.includes('does not exist')) {
      console.log('🔄 Processando estorno manualmente...')
      

    // 1. Buscar a conta para verificar se está recebida
    const { data: account, error: accountError } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('id', params.id)
      .eq('type', 'receivable')
      .single()

    if (accountError || !account) {
      console.error('❌ Conta não encontrada:', accountError)
      return NextResponse.json(
        { success: false, error: 'Conta não encontrada' },
        { status: 404 }
      )
    }

    if (account.status !== 'paid') {
      console.error('⚠️ Conta não está recebida, não pode ser estornada')
      return NextResponse.json(
        { success: false, error: 'Conta não está recebida' },
        { status: 400 }
      )
    }

    // 2. Primeiro, buscar movimentações para debug
    const { data: existingMovements, error: searchError } = await supabase
      .from('cash_movements')
      .select('*')
      .eq('reference_type', 'account_receipt')
      .eq('reference_id', params.id)

    console.log('🔍 Movimentações encontradas para deletar:', {
      count: existingMovements?.length || 0,
      movements: existingMovements,
      searchError
    })

    // 3. Deletar movimentação financeira relacionada
    const { data: deletedData, error: deleteMovementError } = await supabase
      .from('cash_movements')
      .delete()
      .eq('reference_type', 'account_receipt')
      .eq('reference_id', params.id)
      .select()

    console.log('🗑️ Resultado da deleção:', {
      deletedData,
      deletedCount: deletedData?.length || 0,
      deleteMovementError
    })

    if (deleteMovementError) {
      console.error('⚠️ Erro ao deletar movimentação:', deleteMovementError)
      // Continuar mesmo se não conseguir deletar a movimentação
    } else {
      console.log(`✅ ${deletedData?.length || 0} movimentação(ões) financeira(s) deletada(s)`)
    }

    // 4. Reverter status da conta para pending
    const { data: updatedAccount, error: updateError } = await supabase
      .from('financial_transactions')
      .update({
        status: 'pending',
        payment_date: null,
        paid_amount: null,
        financial_account_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('type', 'receivable')
      .select(`
        *,
        companies_clients_suppliers (
          name,
          type
        )
      `)
      .single()

    if (updateError) {
      console.error('❌ Erro ao reverter conta:', updateError)
      return NextResponse.json(
        { success: false, error: 'Erro ao estornar recebimento' },
        { status: 500 }
      )
    }

    console.log('✅ Recebimento estornado com sucesso')
    return NextResponse.json({
      success: true,
      data: updatedAccount,
      message: 'Recebimento estornado com sucesso'
    })
    }

    // Outro erro na função RPC
    console.error('❌ Erro na função RPC:', rpcError)
    return NextResponse.json(
      { success: false, error: 'Erro ao estornar recebimento' },
      { status: 500 }
    )

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}