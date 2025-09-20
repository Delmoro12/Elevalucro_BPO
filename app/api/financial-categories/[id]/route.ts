import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

// GET - Buscar categoria por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`🔍 API: Getting financial category by ID: ${id}`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }
    
    // Buscar categoria específica com join
    const { data: category, error } = await supabase
      .from('financial_categories')
      .select(`
        *,
        dre_groups!dre_groups_id (
          id,
          description
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Categoria financeira não encontrada' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar categoria financeira' },
        { status: 500 }
      )
    }

    // Formatar resposta
    const formattedCategory = {
      ...category,
      dre_group_name: category.dre_groups?.description || null,
      dre_groups: undefined
    }

    console.log(`✅ Found financial category: ${category.id}`)

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

// PATCH - Atualizar categoria
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`📝 API: Updating financial category: ${id}`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { description, dre_groups_id } = body

    // Validações
    if (!description?.trim()) {
      return NextResponse.json(
        { success: false, error: 'description é obrigatória' },
        { status: 400 }
      )
    }

    // Atualizar categoria
    const { data: category, error } = await supabase
      .from('financial_categories')
      .update({
        description: description.trim(),
        dre_groups_id: dre_groups_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Categoria financeira não encontrada' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar categoria financeira' },
        { status: 500 }
      )
    }

    // Formatar resposta
    const formattedCategory = {
      ...category,
      dre_group_name: category.dre_groups?.description || null,
      dre_groups: undefined
    }

    console.log(`✅ Financial category updated: ${id}`)

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

// DELETE - Deletar categoria
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`🗑️ API: Deleting financial category: ${id}`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Deletar categoria
    const { error } = await supabase
      .from('financial_categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao deletar categoria financeira' },
        { status: 500 }
      )
    }

    console.log(`✅ Financial category deleted: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Categoria financeira deletada com sucesso'
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}