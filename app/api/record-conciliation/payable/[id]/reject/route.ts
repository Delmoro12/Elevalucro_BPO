import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../../../src/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 API TOOLS: Rejecting payable record ${params.id}...`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { rejected_by, rejection_reason } = body

    if (!rejection_reason) {
      return NextResponse.json(
        { success: false, error: 'Motivo da rejeição é obrigatório' },
        { status: 400 }
      )
    }

    // Primeiro, buscar o registro existente
    const { data: existingRecord, error: fetchError } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('id', params.id)
      .eq('type', 'payable')
      .eq('created_by_side', 'client_side')
      .single()

    if (fetchError || !existingRecord) {
      console.error('❌ Record not found:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Registro não encontrado' },
        { status: 404 }
      )
    }

    if (existingRecord.validated) {
      return NextResponse.json(
        { success: false, error: 'Registro já foi validado e não pode ser rejeitado' },
        { status: 400 }
      )
    }

    // Marcar como rejeitado
    const { error: updateError } = await supabase
      .from('financial_transactions')
      .update({
        rejected: true,
        rejected_at: new Date().toISOString(),
        rejected_by: rejected_by || 'BPO Operator',
        rejection_reason
      })
      .eq('id', params.id)

    if (updateError) {
      console.error('❌ Database error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Erro ao rejeitar registro' },
        { status: 500 }
      )
    }

    console.log(`✅ TOOLS: Payable record ${params.id} rejected successfully`)

    return NextResponse.json({
      success: true,
      message: 'Registro rejeitado com sucesso'
    })

  } catch (error) {
    console.error('❌ TOOLS API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}