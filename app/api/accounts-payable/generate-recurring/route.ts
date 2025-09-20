import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 API: Generating recurring accounts...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { account_id, occurrence_type, recurrence_config } = body

    // Validações obrigatórias
    if (!account_id || !occurrence_type) {
      return NextResponse.json(
        { success: false, error: 'account_id e occurrence_type são obrigatórios' },
        { status: 400 }
      )
    }

    // Se for única, não precisa gerar recorrência
    if (occurrence_type === 'unique') {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Conta única criada sem recorrência'
      })
    }

    // Chamar função PostgreSQL para gerar contas recorrentes
    const { data: recurringAccounts, error } = await supabase
      .rpc('generate_recurring_accounts', {
        p_account_id: account_id,
        p_occurrence_type: occurrence_type,
        p_recurrence_config: recurrence_config
      })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao gerar contas recorrentes' },
        { status: 500 }
      )
    }

    console.log(`✅ Generated ${recurringAccounts?.length || 0} recurring accounts`)

    return NextResponse.json({
      success: true,
      data: recurringAccounts || [],
      total: recurringAccounts?.length || 0,
      message: `${recurringAccounts?.length || 0} contas recorrentes criadas`
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}