import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../../src/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { seriesId: string } }
) {
  try {
    console.log(`🔍 API: Getting accounts for series ${params.seriesId}...`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Buscar contas da série usando a view
    const { data: seriesAccounts, error } = await supabase
      .from('accounts_payable_view')
      .select('*')
      .eq('series_id', params.seriesId)
      .order('due_date', { ascending: true })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar contas da série' },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${seriesAccounts?.length || 0} accounts in series`)

    return NextResponse.json({
      success: true,
      data: seriesAccounts || [],
      total: seriesAccounts?.length || 0
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}