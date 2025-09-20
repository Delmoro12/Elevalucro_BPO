import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

// GET - Buscar grupo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`🔍 API: Getting DRE group by ID: ${id}`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }
    
    // Buscar grupo específico
    const { data: group, error } = await supabase
      .from('dre_groups')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Grupo DRE não encontrado' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar grupo DRE' },
        { status: 500 }
      )
    }

    console.log(`✅ Found DRE group: ${group.id}`)

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

// PATCH - Atualizar grupo
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`📝 API: Updating DRE group: ${id}`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { description, sort_order } = body

    // Validações
    if (!description?.trim()) {
      return NextResponse.json(
        { success: false, error: 'description é obrigatória' },
        { status: 400 }
      )
    }

    if (sort_order === undefined || sort_order === null) {
      return NextResponse.json(
        { success: false, error: 'sort_order é obrigatório' },
        { status: 400 }
      )
    }

    // Atualizar grupo
    const { data: group, error } = await supabase
      .from('dre_groups')
      .update({
        description: description.trim(),
        sort_order: parseInt(sort_order),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Grupo DRE não encontrado' },
          { status: 404 }
        )
      }
      // Tratar erro de unique constraint na ordenação
      if (error.code === '23505' && error.message.includes('idx_dre_groups_unique_sort_order')) {
        return NextResponse.json(
          { success: false, error: 'Já existe um grupo com essa ordem de exibição' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar grupo DRE' },
        { status: 500 }
      )
    }

    console.log(`✅ DRE group updated: ${id}`)

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

// DELETE - Deletar grupo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`🗑️ API: Deleting DRE group: ${id}`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Verificar se há categorias usando este grupo
    const { data: categories, error: checkError } = await supabase
      .from('financial_categories')
      .select('id')
      .eq('dre_groups_id', id)
      .limit(1)

    if (checkError) {
      console.error('❌ Database error on check:', checkError)
      return NextResponse.json(
        { success: false, error: 'Erro ao verificar dependências' },
        { status: 500 }
      )
    }

    if (categories && categories.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Não é possível deletar: existem categorias usando este grupo' },
        { status: 409 }
      )
    }

    // Deletar grupo
    const { error } = await supabase
      .from('dre_groups')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao deletar grupo DRE' },
        { status: 500 }
      )
    }

    console.log(`✅ DRE group deleted: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Grupo DRE deletado com sucesso'
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}