import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../src/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Getting financial categories from database...')
    
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
    
    // Buscar categorias financeiras com join no dre_groups para obter o nome
    const { data: categories, error } = await supabase
      .from('financial_categories')
      .select(`
        *,
        dre_groups!dre_groups_id (
          id,
          description
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar categorias financeiras' },
        { status: 500 }
      )
    }

    // Formatar dados para incluir dre_group_name
    const formattedCategories = categories?.map((cat: {
      dre_groups?: { description?: string | null } | null
      [key: string]: any
    }) => ({
      ...cat,
      dre_group_name: cat.dre_groups?.description || null,
      dre_groups: undefined // Remove o objeto aninhado
    })) || []

    console.log(`✅ Found ${formattedCategories.length} financial categories`)

    return NextResponse.json({
      success: true,
      data: formattedCategories,
      total: formattedCategories.length
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
    console.log('📝 API: Creating new financial category...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { company_id, description, dre_groups_id } = body

    // Validações
    if (!company_id || !description) {
      return NextResponse.json(
        { success: false, error: 'company_id e description são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar categoria financeira
    const { data: category, error } = await supabase
      .from('financial_categories')
      .insert([{
        company_id,
        description: description.trim(),
        dre_groups_id: dre_groups_id || null
      }])
      .select(`
        *,
        dre_groups!dre_groups_id (
          id,
          description
        )
      `)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao criar categoria financeira' },
        { status: 500 }
      )
    }

    // Formatar resposta
    const formattedCategory = {
      ...category,
      dre_group_name: category.dre_groups?.description || null,
      dre_groups: undefined
    }

    console.log(`✅ Financial category created: ${category.id}`)

    return NextResponse.json({
      success: true,
      data: formattedCategory
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
