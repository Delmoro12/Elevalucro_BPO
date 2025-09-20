import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API BPO-APP: Getting account balances from database...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')
    
    // Para BPO-APP, company_id é opcional por enquanto (será implementado via RLS)
    let query = supabase
      .from('account_balances')
      .select('*')
      .order('account_name')
    
    // Filtrar por company_id apenas se fornecido
    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    const { data: balances, error } = await query

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar saldos das contas' },
        { status: 500 }
      )
    }

    console.log(`✅ BPO-APP: Found ${balances?.length || 0} account balances`)

    return NextResponse.json({
      success: true,
      data: balances || []
    })

  } catch (error) {
    console.error('❌ BPO-APP API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}