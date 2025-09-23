import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../../src/lib/supabase'
import { FinancialTransactionSummary } from '../../../../../src/types/elevalucro_bpo_app'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 API App: Getting accounts receivable summary...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      console.error('❌ Supabase admin client not available')
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Obter company_id da query string
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      )
    }
    
    // Buscar resumo usando a view de transações financeiras, filtrando apenas receitas (type = receivable)
    // IMPORTANTE: Aqui não filtramos por validated=true pois queremos mostrar TODOS os registros da empresa
    const { data: transactions, error } = await supabase
      .from('financial_transactions_view')
      .select('*')
      .eq('company_id', companyId)
      .eq('type', 'receivable')

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar resumo de contas a receber' },
        { status: 500 }
      )
    }

    // Calcular métricas manualmente
    const allTransactions: FinancialTransactionSummary[] = transactions || []
    
    // Contadores por status
    const totalContas = allTransactions.length
    const contasPendentes = allTransactions.filter(t => t.status === 'pending').length
    const contasRecebidas = allTransactions.filter(t => t.status === 'paid').length
    const contasVencidas = allTransactions.filter(t => 
      t.status_vencimento === 'vencida' && t.status === 'pending'
    ).length
    const contasVenceBreve = allTransactions.filter(t => 
      t.status_vencimento === 'vence_em_breve' && t.status === 'pending'
    ).length
    
    // Valores por status
    const valorTotal = allTransactions.reduce((sum, t) => sum + (t.value || 0), 0)
    const valorPendente = allTransactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + (t.value || 0), 0)
    const valorRecebido = allTransactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + (t.paid_amount || 0), 0)
    const valorVencido = allTransactions
      .filter(t => t.status_vencimento === 'vencida' && t.status === 'pending')
      .reduce((sum, t) => sum + (t.value || 0), 0)
    const valorVenceBreve = allTransactions
      .filter(t => t.status_vencimento === 'vence_em_breve' && t.status === 'pending')
      .reduce((sum, t) => sum + (t.value || 0), 0)
    const valorEmDia = allTransactions
      .filter(t => t.status_vencimento === 'em_dia' && t.status === 'pending')
      .reduce((sum, t) => sum + (t.value || 0), 0)

    // Contadores por método de pagamento
    const contasPix = allTransactions.filter(t => t.payment_method === 'pix').length
    const contasBoleto = allTransactions.filter(t => t.payment_method === 'bank_slip').length
    const contasTransferencia = allTransactions.filter(t => t.payment_method === 'bank_transfer').length

    // Contadores por validação
    const contasValidadas = allTransactions.filter(t => t.validated === true).length
    const contasNaoValidadas = allTransactions.filter(t => t.validated === false || t.validated === null).length

    const summary = {
      company_id: companyId,
      total_contas: totalContas,
      contas_pendentes: contasPendentes,
      contas_recebidas: contasRecebidas,
      contas_vencidas: contasVencidas,
      contas_vence_breve: contasVenceBreve,
      valor_total: valorTotal,
      valor_pendente: valorPendente,
      valor_recebido: valorRecebido,
      valor_vencido: valorVencido,
      valor_vence_breve: valorVenceBreve,
      valor_em_dia: valorEmDia,
      contas_pix: contasPix,
      contas_boleto: contasBoleto,
      contas_transferencia: contasTransferencia,
      contas_validadas: contasValidadas,
      contas_nao_validadas: contasNaoValidadas,
      ultima_atualizacao: new Date().toISOString()
    }

    console.log(`✅ App summary retrieved for company ${companyId}:`, summary)

    return NextResponse.json({
      success: true,
      data: summary
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}