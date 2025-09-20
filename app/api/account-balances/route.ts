import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../src/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      )
    }

    const { data: balances, error } = await supabase
      .from('account_balances')
      .select('*')
      .eq('company_id', companyId)
      .order('account_name')

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar saldos das contas' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: balances || []
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}