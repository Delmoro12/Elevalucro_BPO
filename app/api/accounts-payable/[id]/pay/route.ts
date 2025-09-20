import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../../src/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('💰 API: Processing payment for account:', params.id);
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      financial_account_id,
      payment_date,
      paid_amount,
      notes
    } = body

    console.log('📝 Payment data:', {
      account_id: params.id,
      financial_account_id,
      payment_date,
      paid_amount,
      notes
    })

    // Validações
    if (!financial_account_id || !payment_date || !paid_amount) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: financial_account_id, payment_date, paid_amount' },
        { status: 400 }
      )
    }

    // 1. Buscar informações da conta a pagar incluindo fornecedor
    const { data: account, error: accountError } = await supabase
      .from('financial_transactions')
      .select(`
        *,
        companies_clients_suppliers!companies_clients_suppliers_id (
          name,
          type
        )
      `)
      .eq('id', params.id)
      .eq('type', 'payable')
      .single()

    if (accountError || !account) {
      console.error('❌ Conta não encontrada:', accountError)
      return NextResponse.json(
        { success: false, error: 'Conta não encontrada' },
        { status: 404 }
      )
    }

    console.log('📋 Account found:', {
      id: account.id,
      supplier_name: account.companies_clients_suppliers?.name,
      document: account.number_of_document
    })

    // Processar manualmente (skip stored procedure)
    console.log('🔄 Processando manualmente...')
    
      // 2. Atualizar a conta a pagar
      // Concatenar observações do pagamento com as existentes
      const updatedNotes = notes ? 
        `${account.notes || ''}\n\nPagamento em ${payment_date}: ${notes}`.trim() : 
        account.notes

      const { data: manualUpdate, error: manualUpdateError } = await supabase
        .from('financial_transactions')
        .update({
          status: 'paid',
          payment_date,
          paid_amount,
          financial_account_id,
          notes: updatedNotes
        })
        .eq('id', params.id)
        .eq('type', 'payable')
        .select(`
          *,
          companies_clients_suppliers!companies_clients_suppliers_id (
            name,
            type
          )
        `)
        .single()

      if (manualUpdateError) {
        console.error('❌ Erro ao atualizar conta:', manualUpdateError)
        return NextResponse.json(
          { success: false, error: 'Erro ao processar pagamento' },
          { status: 500 }
        )
      }

      // 3. Criar movimentação financeira
      const description = [
        'Pagamento',
        account.companies_clients_suppliers?.name,
        account.number_of_document ? `Doc: ${account.number_of_document}` : null,
        account.notes
      ].filter(Boolean).join(' - ')

      const { data: movement, error: movementError } = await supabase
        .from('cash_movements')
        .insert([{
          company_id: account.company_id,
          financial_account_id,
          amount: paid_amount,
          type: 'debit',
          description: description.substring(0, 500), // Limitar tamanho
          reference_type: 'account_payment',
          reference_id: params.id,
          date: payment_date
        }])
        .select()
        .single()

      if (movementError) {
        console.error('❌ Erro ao criar movimentação:', movementError)
        // Não vamos reverter o pagamento, apenas logar o erro
        console.error('⚠️ Pagamento processado mas movimentação não foi criada')
      } else {
        console.log('✅ Movimentação criada:', movement.id)
      }

      console.log('✅ Pagamento processado com sucesso')
      return NextResponse.json({
        success: true,
        data: manualUpdate,
        message: 'Pagamento processado com sucesso'
      })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}