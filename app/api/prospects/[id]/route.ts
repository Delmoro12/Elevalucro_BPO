import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

// GET - Buscar prospect por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`🔍 API: Getting prospect by ID: ${id}`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }
    
    // Buscar prospect específico
    const { data: prospect, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Prospect não encontrado' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar prospect' },
        { status: 500 }
      )
    }

    console.log(`✅ Found prospect: ${prospect?.nome_contato}`)

    return NextResponse.json({
      success: true,
      data: prospect
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar prospect
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const updateData = await request.json()
    
    console.log(`🔄 API: Updating prospect ${id}:`, updateData)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }
    
    // Verificar se está mudando status para "signed"
    const isBecomingSigned = updateData.status === 'signed'
    
    // Atualizar prospect
    const { data: prospect, error } = await supabase
      .from('prospects')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Prospect não encontrado' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar prospect' },
        { status: 500 }
      )
    }

    console.log(`✅ Updated prospect: ${prospect?.nome_contato}`)

    // Se mudou para "signed", disparar criação automática do cliente
    if (isBecomingSigned) {
      console.log('🎯 Prospect marcado como "signed" - disparando criação de cliente...')
      
      try {
        // Chamar a edge function para criar o cliente
        const signupResponse = await supabase.functions.invoke('client-signup', {
          body: { prospect_id: id }
        })
        
        const signupResult = signupResponse.data
        
        if (!signupResponse.error && signupResult?.success) {
          console.log('✅ Cliente criado automaticamente:', signupResult)
          
          return NextResponse.json({
            success: true,
            data: prospect,
            clientCreated: true,
            clientData: signupResult.data,
            message: 'Prospect atualizado e cliente criado automaticamente'
          })
        } else {
          console.error('❌ Erro ao criar cliente automaticamente:', signupResponse.error || signupResult)
          
          return NextResponse.json({
            success: true,
            data: prospect,
            clientCreated: false,
            error: signupResponse.error?.message || signupResult?.error || 'Erro na criação automática do cliente',
            message: 'Prospect atualizado, mas houve erro na criação do cliente'
          })
        }
      } catch (signupError) {
        console.error('❌ Erro ao disparar criação de cliente:', signupError)
        
        return NextResponse.json({
          success: true,
          data: prospect,
          clientCreated: false,
          error: 'Erro ao disparar criação automática do cliente',
          message: 'Prospect atualizado, mas houve erro na criação do cliente'
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: prospect
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar prospect
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`🗑️ API: Deleting prospect ${id}`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }
    
    // Deletar prospect
    const { error } = await supabase
      .from('prospects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao deletar prospect' },
        { status: 500 }
      )
    }

    console.log(`✅ Deleted prospect: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Prospect deletado com sucesso'
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}