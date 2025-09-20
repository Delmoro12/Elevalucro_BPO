import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 API: Getting account payable ${params.id}...`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Buscar conta a pagar da tabela unificada
    const { data: account, error } = await supabase
      .from('financial_transactions')
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
      .eq('id', params.id)
      .eq('type', 'payable')
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Conta a pagar não encontrada' },
        { status: 404 }
      )
    }

    // Formatar resposta para compatibilidade
    const formattedAccount = {
      ...account,
      supplier_name: account.companies_clients_suppliers?.name || null,
      category_name: account.financial_categories?.description || null
    }

    console.log(`✅ Account payable found: ${account.id}`)

    return NextResponse.json({
      success: true,
      data: formattedAccount
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar conta a pagar (parcial)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📝 API: Updating account payable ${params.id}...`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    console.log(`🔍 PATCH Body received:`, JSON.stringify(body, null, 2))
    
    const { user_id } = body  // Extrair user_id para auditoria
    
    // Preparar dados para update - remover campos que não devem ser atualizados
    const {
      company_id, // não deve ser atualizado
      created_at, // não deve ser atualizado
      updated_at, // será atualizado automaticamente
      id: bodyId, // não deve ser atualizado
      supplier_name, // campo calculado, não está na tabela
      category_name, // campo calculado, não está na tabela
      // Remover campos que foram removidos da tabela
      installment_number,
      installment_total,
      recurrence_day_of_week,
      recurrence_day_of_month,
      installment_count,
      installment_day,
      user_id: _ignoredUserId,
      ...updateData
    } = body

    console.log(`🔧 PATCH updateData after filtering:`, JSON.stringify(updateData, null, 2))

    // Função para converter string vazia em null
    const emptyToNull = (value: any) => {
      if (typeof value === 'string') {
        return value.trim() === '' ? null : value.trim();
      }
      return value || null;
    };

    // Aplicar emptyToNull nos campos que podem ser UUID
    if (updateData.companies_clients_suppliers_id !== undefined) {
      updateData.companies_clients_suppliers_id = emptyToNull(updateData.companies_clients_suppliers_id);
    }
    if (updateData.category_id !== undefined) {
      updateData.category_id = emptyToNull(updateData.category_id);
    }
    if (updateData.pix_number !== undefined) {
      updateData.pix_number = emptyToNull(updateData.pix_number);
    }
    if (updateData.bank_slip_code !== undefined) {
      updateData.bank_slip_code = emptyToNull(updateData.bank_slip_code);
    }
    if (updateData.due_date !== undefined) {
      updateData.due_date = emptyToNull(updateData.due_date);
    }
    if (updateData.date_of_issue !== undefined) {
      updateData.date_of_issue = emptyToNull(updateData.date_of_issue);
    }
    if (updateData.number_of_document !== undefined) {
      updateData.number_of_document = emptyToNull(updateData.number_of_document);
    }
    if (updateData.notes !== undefined) {
      updateData.notes = emptyToNull(updateData.notes);
    }

    // Validar valor se fornecido
    if (updateData.value !== undefined) {
      if (isNaN(updateData.value) || updateData.value <= 0) {
        return NextResponse.json(
          { success: false, error: 'Valor deve ser um número maior que zero' },
          { status: 400 }
        )
      }
      updateData.value = parseFloat(updateData.value)
    }

    // Preparar dados finais para update
    const finalUpdateData = {
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: user_id  // Adicionar auditoria de quem atualizou
    }
    
    console.log(`🚀 PATCH Final update data:`, JSON.stringify(finalUpdateData, null, 2))

    // Atualizar conta a pagar na tabela unificada
    const { data: account, error } = await supabase
      .from('financial_transactions')
      .update(finalUpdateData)
      .eq('id', params.id)
      .eq('type', 'payable')
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
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar conta a pagar', details: error.message },
        { status: 500 }
      )
    }

    // Formatar resposta
    const formattedAccount = {
      ...account,
      supplier_name: account.companies_clients_suppliers?.name || null,
      category_name: account.financial_categories?.description || null,
      companies_clients_suppliers: undefined,
      financial_categories: undefined
    }

    console.log(`✅ Account payable updated: ${account.id}`)

    return NextResponse.json({
      success: true,
      data: formattedAccount
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📝 API: Updating account payable ${params.id}...`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      user_id,  // ID do usuário para auditoria
      pix_number,
      bank_slip_code,
      payment_method,
      companies_clients_suppliers_id,
      due_date,
      value,
      date_of_issue,
      number_of_document,
      notes,
      category_id,
      occurrence
    } = body

    // Validações obrigatórias
    if (!value || !due_date || !payment_method) {
      return NextResponse.json(
        { success: false, error: 'value, due_date e payment_method são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar valor
    if (isNaN(value) || value <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valor deve ser um número maior que zero' },
        { status: 400 }
      )
    }

    // Função para converter string vazia em null
    const emptyToNull = (value: any) => {
      if (typeof value === 'string') {
        return value.trim() === '' ? null : value.trim();
      }
      return value || null;
    };

    // Atualizar conta a pagar na tabela unificada
    const { data: account, error } = await supabase
      .from('financial_transactions')
      .update({
        pix_number: emptyToNull(pix_number),
        bank_slip_code: emptyToNull(bank_slip_code),
        payment_method,
        companies_clients_suppliers_id: emptyToNull(companies_clients_suppliers_id),
        due_date: emptyToNull(due_date),
        value: parseFloat(value),
        date_of_issue: emptyToNull(date_of_issue),
        number_of_document: emptyToNull(number_of_document),
        notes: emptyToNull(notes),
        category_id: emptyToNull(category_id),
        occurrence: occurrence || 'unique',
        updated_at: new Date().toISOString(),
        updated_by: user_id  // Adicionar auditoria de quem atualizou
      })
      .eq('id', params.id)
      .eq('type', 'payable')
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
        { success: false, error: 'Erro ao atualizar conta a pagar' },
        { status: 500 }
      )
    }

    // Formatar resposta
    const formattedAccount = {
      ...account,
      supplier_name: account.companies_clients_suppliers?.name || null,
      category_name: account.financial_categories?.description || null,
      companies_clients_suppliers: undefined,
      financial_categories: undefined
    }

    console.log(`✅ Account payable updated: ${account.id}`)

    return NextResponse.json({
      success: true,
      data: formattedAccount
    })

  } catch (error) {
    console.error('❌ API Error:', error)
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
    console.log(`🗑️ API: Deleting account payable ${params.id}...`)
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Verificar se a conta existe antes de deletar
    const { data: existingAccount, error: checkError } = await supabase
      .from('financial_transactions')
      .select('id')
      .eq('id', params.id)
      .eq('type', 'payable')
      .single()

    if (checkError || !existingAccount) {
      return NextResponse.json(
        { success: false, error: 'Conta a pagar não encontrada' },
        { status: 404 }
      )
    }

    // Deletar conta a pagar da tabela unificada
    const { error: deleteError } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', params.id)
      .eq('type', 'payable')

    if (deleteError) {
      console.error('❌ Database error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Erro ao deletar conta a pagar' },
        { status: 500 }
      )
    }

    console.log(`✅ Account payable deleted: ${params.id}`)

    return NextResponse.json({
      success: true,
      message: 'Conta a pagar deletada com sucesso'
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
