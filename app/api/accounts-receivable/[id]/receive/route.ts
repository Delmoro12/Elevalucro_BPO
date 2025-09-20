import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../../src/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('💰 API: Processing receipt for account:', params.id);
    
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
      receipt_date: payment_date, // Usar payment_date na tabela unificada
      received_amount: paid_amount, // Usar paid_amount na tabela unificada
      notes
    } = body

    console.log('📝 Receipt data:', {
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

    // 1. Buscar informações da conta a receber incluindo cliente
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
      .eq('type', 'receivable')
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
      client_name: account.companies_clients_suppliers?.name,
      document: account.number_of_document
    })

    // Iniciar transação
    const { data: updatedAccount, error: updateError } = await supabase.rpc(
      'process_account_receipt',
      {
        p_account_id: params.id,
        p_financial_account_id: financial_account_id,
        p_receipt_date: payment_date,
        p_received_amount: paid_amount,
        p_notes: notes,
        p_client_name: account.companies_clients_suppliers?.name || 'Cliente',
        p_document_number: account.number_of_document,
        p_account_notes: account.notes,
        p_company_id: account.company_id
      }
    )

    if (updateError) {
      console.error('❌ Erro na transação:', updateError)
      
      // Se a função não existir ainda, fazer manualmente
      if (updateError.message?.includes('function') || updateError.message?.includes('does not exist')) {
        console.log('🔄 Processando manualmente sem transação...')
        
        // 2. Atualizar a conta a receber
        // Concatenar observações do recebimento com as existentes
        const updatedNotes = notes ? 
          `${account.notes || ''}\n\nRecebimento em ${payment_date}: ${notes}`.trim() : 
          account.notes

        const { data: manualUpdate, error: manualUpdateError } = await supabase
          .from('financial_transactions')
          .update({
            status: 'paid', // Usar 'paid' para ambos receivable e payable
            payment_date,
            paid_amount,
            financial_account_id,
            notes: updatedNotes
          })
          .eq('id', params.id)
          .eq('type', 'receivable')
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
            { success: false, error: 'Erro ao processar recebimento' },
            { status: 500 }
          )
        }

        // 3. Criar movimentação financeira (crédito para recebimento)
        const description = [
          'Recebimento',
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
            type: 'credit', // Crédito porque está recebendo dinheiro
            description: description.substring(0, 500), // Limitar tamanho
            reference_type: 'account_receipt',
            reference_id: params.id,
            date: payment_date
          }])
          .select()
          .single()

        if (movementError) {
          console.error('❌ Erro ao criar movimentação:', movementError)
          // Não vamos reverter o recebimento, apenas logar o erro
          console.error('⚠️ Recebimento processado mas movimentação não foi criada')
        } else {
          console.log('✅ Movimentação criada:', movement.id)
        }

        console.log('✅ Recebimento processado com sucesso')
        return NextResponse.json({
          success: true,
          data: manualUpdate,
          message: 'Recebimento processado com sucesso'
        })
      }

      return NextResponse.json(
        { success: false, error: 'Erro ao processar recebimento' },
        { status: 500 }
      )
    }

    console.log('✅ Recebimento processado com transação')
    return NextResponse.json({
      success: true,
      data: updatedAccount,
      message: 'Recebimento processado com sucesso'
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}