import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../src/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Getting prospects from database...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }
    
    // Buscar prospects do banco
    const { data: prospects, error } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar prospects' },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${prospects?.length || 0} prospects`)

    return NextResponse.json({
      success: true,
      data: {
        prospects: prospects || [],
        total: prospects?.length || 0
      }
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
    console.log('📝 API: Creating new prospect...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }
    
    const body = await request.json()
    console.log('📋 Prospect data received:', body)
    
    // Inserir prospect no banco
    const { data: prospect, error } = await supabase
      .from('prospects')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('❌ Database error creating prospect:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao criar prospect', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Prospect created successfully:', prospect.id)

    return NextResponse.json({
      success: true,
      message: 'Prospect criado com sucesso',
      data: prospect
    })

  } catch (error) {
    console.error('❌ API Error creating prospect:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}