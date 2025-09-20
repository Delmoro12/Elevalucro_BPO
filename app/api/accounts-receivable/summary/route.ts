import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 API: Getting accounts receivable summary...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
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
    
    // Buscar resumo usando a view de resumo
    const { data: summary, error } = await supabase
      .from('accounts_receivable_summary')
      .select('*')
      .eq('company_id', companyId)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      
      // Se a view não existir, retornar valores zerados
      if (error.code === 'PGRST116' || error.message?.includes('0 rows')) {
        return NextResponse.json({
          success: true,
          data: {
            company_id: companyId,
            total_contas: 0,
            contas_pendentes: 0,
            contas_recebidas: 0,
            contas_vencidas: 0,
            contas_vence_breve: 0,
            valor_total: 0,
            valor_pendente: 0,
            valor_recebido: 0,
            valor_vencido: 0,
            valor_vence_breve: 0,
            valor_em_dia: 0
          }
        })
      }
      
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar resumo de contas a receber' },
        { status: 500 }
      )
    }

    console.log(`✅ Summary retrieved for company ${companyId}`)

    return NextResponse.json({
      success: true,
      data: summary || {
        company_id: companyId,
        total_contas: 0,
        contas_pendentes: 0,
        contas_recebidas: 0,
        contas_vencidas: 0,
        contas_vence_breve: 0,
        valor_total: 0,
        valor_pendente: 0,
        valor_recebido: 0,
        valor_vencido: 0,
        valor_vence_breve: 0,
        valor_em_dia: 0
      }
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}