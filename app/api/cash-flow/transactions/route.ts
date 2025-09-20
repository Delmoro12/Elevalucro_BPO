import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Getting cash flow transactions...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      console.error('❌ Supabase admin client not available')
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Obter parâmetros da query string
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      )
    }

    // Obter filtros opcionais
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const period = searchParams.get('period')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const financialAccountId = searchParams.get('financial_account_id')
    const categoryId = searchParams.get('category_id')
    const search = searchParams.get('search')

    // Montar query base da view
    let query = supabase
      .from('cash_flow_transactions_view')
      .select('*')
      .eq('company_id', companyId)
      .eq('validated', true) // IMPORTANTE: Apenas registros validados nas Tools

    // Aplicar filtros
    if (startDate && endDate) {
      query = query.gte('due_date', startDate).lte('due_date', endDate)
    } else if (period) {
      // Filtros por período predefinido
      const now = new Date()
      switch (period) {
        case 'month':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
          query = query.gte('due_date', startOfMonth).lte('due_date', endOfMonth)
          break
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3)
          const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0]
          const endOfQuarter = new Date(now.getFullYear(), quarter * 3 + 3, 0).toISOString().split('T')[0]
          query = query.gte('due_date', startOfQuarter).lte('due_date', endOfQuarter)
          break
        case 'year':
          const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
          const endOfYear = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]
          query = query.gte('due_date', startOfYear).lte('due_date', endOfYear)
          break
      }
    }

    if (status && status !== 'all') {
      switch (status) {
        case 'realized':
          query = query.eq('cash_flow_status', 'REALIZADO')
          break
        case 'pending':
          query = query.neq('cash_flow_status', 'REALIZADO')
          break
        case 'overdue':
          query = query.eq('cash_flow_status', 'VENCIDO')
          break
      }
    }

    if (type && type !== 'all') {
      switch (type) {
        case 'credit':
          query = query.eq('cash_flow_type', 'CRÉDITO')
          break
        case 'debit':
          query = query.eq('cash_flow_type', 'DÉBITO')
          break
      }
    }

    if (financialAccountId && financialAccountId !== 'all') {
      query = query.eq('financial_account_id', financialAccountId)
    }

    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId)
    }

    if (search) {
      query = query.or(`third_party_name.ilike.%${search}%,category_name.ilike.%${search}%,number_of_document.ilike.%${search}%,observacao.ilike.%${search}%`)
    }

    // Ordenar por data de vencimento
    query = query.order('due_date', { ascending: true })

    const { data: transactions, error, count } = await query

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar transações de fluxo de caixa' },
        { status: 500 }
      )
    }

    console.log(`✅ Cash flow transactions retrieved for company ${companyId}: ${transactions?.length || 0} records`)

    return NextResponse.json({
      success: true,
      data: transactions || [],
      total: count || (transactions?.length || 0),
      page: 1,
      limit: 1000
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}