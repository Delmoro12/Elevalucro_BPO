import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API BPO-APP: Getting financial accounts from database...')
    
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
    
    // Buscar contas financeiras
    let query = supabase
      .from('financial_accounts')
      .select('*')
      .order('created_at', { ascending: false })

    // Filtrar por company_id apenas se fornecido
    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    const { data: accounts, error } = await query

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar contas financeiras' },
        { status: 500 }
      )
    }

    console.log(`✅ BPO-APP: Found ${accounts?.length || 0} financial accounts`)

    return NextResponse.json({
      success: true,
      data: accounts || [],
      total: accounts?.length || 0
    })

  } catch (error) {
    console.error('❌ BPO-APP API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}