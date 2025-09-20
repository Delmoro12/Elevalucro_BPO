import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../src/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Getting financial accounts from database...')
    
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
    
    // Buscar contas financeiras
    const { data: accounts, error } = await supabase
      .from('financial_accounts')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar contas financeiras' },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${accounts?.length || 0} financial accounts`)

    return NextResponse.json({
      success: true,
      data: accounts || [],
      total: accounts?.length || 0
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 API: Creating new financial account...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { company_id, description } = body

    // Validações
    if (!company_id || !description) {
      return NextResponse.json(
        { success: false, error: 'company_id e description são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar conta financeira
    const { data: account, error } = await supabase
      .from('financial_accounts')
      .insert([{
        company_id,
        description: description.trim()
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao criar conta financeira' },
        { status: 500 }
      )
    }

    console.log(`✅ Financial account created: ${account.id}`)

    return NextResponse.json({
      success: true,
      data: account
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}