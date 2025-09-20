import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API BPO-APP: Getting non-validated financial transactions...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Obter company_id da query string (opcional para BPO-APP por enquanto)
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')
    
    // Buscar registros financeiros não validados usando a view unificada
    let query = supabase
      .from('financial_transactions_view')
      .select('*')
      .eq('validated', false) // Apenas registros não validados
      .eq('created_by_side', 'client_side') // Apenas registros criados pelo cliente
    
    // Filtrar por company_id apenas se fornecido
    if (companyId) {
      query = query.eq('company_id', companyId)
    }
    
    const { data: notValidatedTransactions, error } = await query
      .order('created_at', { ascending: false }) // Mais recentes primeiro

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar registros não validados' },
        { status: 500 }
      )
    }

    // Dados já vêm formatados da view
    const formattedTransactions = notValidatedTransactions || []

    console.log(`✅ BPO-APP: Found ${formattedTransactions.length} non-validated transactions`)

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
      total: formattedTransactions.length
    })

  } catch (error) {
    console.error('❌ BPO-APP API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
