import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

// GET - Buscar conta por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`🔍 API: Getting financial account by ID: ${id}`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }
    
    // Buscar conta específica
    const { data: account, error } = await supabase
      .from('financial_accounts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Conta financeira não encontrada' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar conta financeira' },
        { status: 500 }
      )
    }

    console.log(`✅ Found financial account: ${account.id}`)

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

// PATCH - Atualizar conta
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`📝 API: Updating financial account: ${id}`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { description } = body

    // Validações
    if (!description?.trim()) {
      return NextResponse.json(
        { success: false, error: 'description é obrigatória' },
        { status: 400 }
      )
    }

    // Atualizar conta
    const { data: account, error } = await supabase
      .from('financial_accounts')
      .update({
        description: description.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Conta financeira não encontrada' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar conta financeira' },
        { status: 500 }
      )
    }

    console.log(`✅ Financial account updated: ${id}`)

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

// DELETE - Deletar conta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`🗑️ API: Deleting financial account: ${id}`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Deletar conta
    const { error } = await supabase
      .from('financial_accounts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao deletar conta financeira' },
        { status: 500 }
      )
    }

    console.log(`✅ Financial account deleted: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Conta financeira deletada com sucesso'
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}