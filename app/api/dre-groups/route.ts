import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../src/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Getting DRE groups from database...')
    
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
    
    // Buscar grupos DRE ordenados por sort_order
    const { data: groups, error } = await supabase
      .from('dre_groups')
      .select('*')
      .eq('company_id', companyId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar grupos DRE' },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${groups?.length || 0} DRE groups`)

    return NextResponse.json({
      success: true,
      data: groups || [],
      total: groups?.length || 0
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
    console.log('📝 API: Creating new DRE group...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { company_id, description, sort_order } = body

    // Validações
    if (!company_id || !description) {
      return NextResponse.json(
        { success: false, error: 'company_id e description são obrigatórios' },
        { status: 400 }
      )
    }

    if (sort_order === undefined || sort_order === null) {
      return NextResponse.json(
        { success: false, error: 'sort_order é obrigatório' },
        { status: 400 }
      )
    }

    // Criar grupo DRE
    const { data: group, error } = await supabase
      .from('dre_groups')
      .insert([{
        company_id,
        description: description.trim(),
        sort_order: parseInt(sort_order)
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      // Tratar erro de unique constraint na ordenação
      if (error.code === '23505' && error.message.includes('idx_dre_groups_unique_sort_order')) {
        return NextResponse.json(
          { success: false, error: 'Já existe um grupo com essa ordem de exibição' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Erro ao criar grupo DRE' },
        { status: 500 }
      )
    }

    console.log(`✅ DRE group created: ${group.id}`)

    return NextResponse.json({
      success: true,
      data: group
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}