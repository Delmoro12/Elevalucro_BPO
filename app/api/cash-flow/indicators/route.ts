import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 API: Getting cash flow indicators...')
    
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
    
    // Buscar indicadores usando a view de resumo
    const { data: summary, error } = await supabase
      .from('cash_flow_summary_view')
      .select('*')
      .eq('company_id', companyId)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      
      // Se a view não existir ou não tiver dados, retornar valores zerados
      if (error.code === 'PGRST116' || error.message?.includes('0 rows')) {
        const defaultIndicators = {
          company_id: companyId,
          realized_balance: 0,
          liquidity_ratio: 0,
          pending_income: 0,
          pending_expenses: 0,
          calculated_at: new Date().toISOString()
        }
        
        console.log('⚠️ No data found, returning default indicators')
        return NextResponse.json({
          success: true,
          data: defaultIndicators
        })
      }
      
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar indicadores de fluxo de caixa' },
        { status: 500 }
      )
    }

    // Garantir que temos os campos necessários
    const indicators = {
      company_id: summary.company_id,
      realized_balance: summary.realized_balance || 0,
      liquidity_ratio: summary.liquidity_ratio || 0,
      pending_income: summary.pending_income || 0,
      pending_expenses: summary.pending_expenses || 0,
      calculated_at: summary.calculated_at || new Date().toISOString()
    }

    console.log(`✅ Cash flow indicators retrieved for company ${companyId}:`, indicators)

    return NextResponse.json({
      success: true,
      data: indicators
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}