import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../../../src/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 API TOOLS: Validating receivable record ${params.id}...`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { validated_by, notes, category_id } = body
    
    // Obter o user ID atual se não fornecido
    const userId = validated_by || body.user_id

    console.log('🔍 Body received:', body)
    
    // Primeiro, buscar o registro existente
    console.log('🔍 Searching for record with ID:', params.id)
    const { data: existingRecord, error: fetchError } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('id', params.id)
      .eq('type', 'receivable')
      .eq('created_by_side', 'client_side')
      .single()
    
    console.log('🔍 Query result:', { existingRecord, fetchError })

    if (fetchError || !existingRecord) {
      console.error('❌ Record not found:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Registro não encontrado' },
        { status: 404 }
      )
    }

    if (existingRecord.validated) {
      return NextResponse.json(
        { success: false, error: 'Registro já foi validado' },
        { status: 400 }
      )
    }

    // Validar o registro
    const updateData: any = {
      validated: true,
      validated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: notes || existingRecord.notes
    };
    
    // Se um validated_by UUID foi fornecido, incluir no update
    if (userId && typeof userId === 'string' && userId.length === 36) {
      updateData.validated_by = userId;
      updateData.updated_by = userId;
    }
    
    console.log('🔍 Update data:', updateData)

    // Incluir categoria_id se fornecida
    if (category_id) {
      updateData.category_id = category_id;
    }

    console.log('🔍 Updating record...')
    const { error: updateError } = await supabase
      .from('financial_transactions')
      .update(updateData)
      .eq('id', params.id)
    
    console.log('🔍 Update result:', { updateError })

    if (updateError) {
      console.error('❌ Database error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Erro ao validar registro' },
        { status: 500 }
      )
    }

    // Se for um registro recorrente, gerar os registros filhos
    if (existingRecord.occurrence && existingRecord.occurrence !== 'unique') {
      console.log(`🔄 Generating recurring records for occurrence: ${existingRecord.occurrence}`)
      
      try {
        const { error: functionError } = await supabase
          .rpc('generate_recurring_records', {
            parent_id: params.id
          })
        
        if (functionError) {
          console.error('❌ Error generating recurring records:', functionError)
          // Não falhar a validação por causa dos registros recorrentes
        } else {
          console.log('✅ Recurring records generated successfully')
        }
      } catch (err) {
        console.error('❌ Exception generating recurring records:', err)
        // Não falhar a validação por causa dos registros recorrentes
      }
    }

    console.log(`✅ TOOLS: Receivable record ${params.id} validated successfully`)

    return NextResponse.json({
      success: true,
      message: 'Registro validado com sucesso'
    })

  } catch (error) {
    console.error('❌ TOOLS API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}