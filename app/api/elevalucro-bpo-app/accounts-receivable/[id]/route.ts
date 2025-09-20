import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../../src/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📝 API BPO-APP: Updating account receivable ${params.id}...`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      payment_method,
      companies_clients_suppliers_id,
      due_date,
      value,
      date_of_issue,
      number_of_document,
      notes,
      category_id,
      occurrence,
      status,
      recurrence_day_of_week,
      recurrence_day_of_month,
      installment_count,
      installment_day
    } = body

    // Função para converter string vazia em null
    const emptyToNull = (value: any) => {
      if (typeof value === 'string') {
        return value.trim() === '' ? null : value.trim();
      }
      return value || null;
    };

    // Preparar configuração de recorrência usando apenas campos do formulário
    const recurrenceConfig: any = {};
    if (recurrence_day_of_week) recurrenceConfig.day_of_week = recurrence_day_of_week;
    if (recurrence_day_of_month) recurrenceConfig.day_of_month = recurrence_day_of_month;
    if (installment_count) recurrenceConfig.installment_count = installment_count;
    if (installment_day) recurrenceConfig.installment_day = installment_day;

    // Verificar se o registro existe e está editável (não validado)
    const { data: existingRecord } = await supabase
      .from('financial_transactions')
      .select('id, validated, created_by_side')
      .eq('id', params.id)
      .eq('type', 'receivable')
      .single()

    if (!existingRecord) {
      return NextResponse.json(
        { success: false, error: 'Registro não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o registro pode ser editado (apenas client_side não validados)
    if (existingRecord.validated || existingRecord.created_by_side !== 'client_side') {
      return NextResponse.json(
        { success: false, error: 'Este registro não pode ser editado' },
        { status: 403 }
      )
    }

    // Atualizar conta a receber
    const { data: account, error } = await supabase
      .from('financial_transactions')
      .update({
        payment_method: emptyToNull(payment_method),
        companies_clients_suppliers_id: emptyToNull(companies_clients_suppliers_id),
        due_date: emptyToNull(due_date),
        value: value ? parseFloat(value) : null,
        date_of_issue: emptyToNull(date_of_issue),
        number_of_document: emptyToNull(number_of_document),
        notes: emptyToNull(notes),
        category_id: emptyToNull(category_id),
        occurrence: occurrence || 'unique',
        status: status || 'pending',
        recurrence_config: Object.keys(recurrenceConfig).length > 0 ? recurrenceConfig : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        companies_clients_suppliers!companies_clients_suppliers_id (
          id,
          name
        ),
        financial_categories!category_id (
          id,
          description
        )
      `)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar conta a receber' },
        { status: 500 }
      )
    }

    // Formatar resposta
    const formattedAccount = {
      ...account,
      client_name: account.companies_clients_suppliers?.name || null,
      category_name: account.financial_categories?.description || null,
      companies_clients_suppliers: undefined,
      financial_categories: undefined
    }

    console.log(`✅ BPO-APP: Account receivable updated: ${params.id}`)

    return NextResponse.json({
      success: true,
      data: formattedAccount,
      message: 'Conta atualizada com sucesso'
    })

  } catch (error) {
    console.error('❌ BPO-APP API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🗑️ API BPO-APP: Deleting account receivable ${params.id}...`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Verificar se o registro existe e está editável (não validado)
    const { data: existingRecord } = await supabase
      .from('financial_transactions')
      .select('id, validated, created_by_side')
      .eq('id', params.id)
      .eq('type', 'receivable')
      .single()

    if (!existingRecord) {
      return NextResponse.json(
        { success: false, error: 'Registro não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o registro pode ser deletado (apenas client_side não validados)
    if (existingRecord.validated || existingRecord.created_by_side !== 'client_side') {
      return NextResponse.json(
        { success: false, error: 'Este registro não pode ser excluído' },
        { status: 403 }
      )
    }

    // Deletar conta a receber
    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao excluir conta a receber' },
        { status: 500 }
      )
    }

    console.log(`✅ BPO-APP: Account receivable deleted: ${params.id}`)

    return NextResponse.json({
      success: true,
      message: 'Conta excluída com sucesso'
    })

  } catch (error) {
    console.error('❌ BPO-APP API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}