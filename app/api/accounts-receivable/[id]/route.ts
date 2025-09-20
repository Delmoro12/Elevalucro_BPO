import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

// GET - Buscar uma conta a receber específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const { data, error } = await supabase
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
      .eq('type', 'receivable')
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar conta a receber' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Conta não encontrada' },
        { status: 404 }
      )
    }

    // Formatar resposta para compatibilidade
    const formattedAccount = {
      ...data,
      client_name: data.companies_clients_suppliers?.name || null,
      category_name: data.financial_categories?.description || null
    }

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

// PATCH - Atualizar uma conta a receber
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 API: Updating account receivable', params.id, '...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { user_id } = body  // Extrair user_id para auditoria

    // Função para converter string vazia em null
    const emptyToNull = (value: any) => {
      if (typeof value === 'string') {
        return value.trim() === '' ? null : value.trim();
      }
      return value || null;
    };

    // Campos que podem ser atualizados
    const allowedFields = [
      'pix_number',
      'bank_slip_code',
      'payment_method',
      'companies_clients_suppliers_id',
      'due_date',
      'value',
      'date_of_issue',
      'number_of_document',
      'notes',
      'category_id',
      'occurrence',
      'status',
      'receipt_date',
      'received_amount',
      'financial_account_id'
    ];

    // Filtrar apenas campos permitidos
    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = emptyToNull(body[field]);
      }
    }

    // Adicionar campos de auditoria
    updateData.updated_at = new Date().toISOString();
    updateData.updated_by = user_id;

    const { data, error } = await supabase
      .from('financial_transactions')
      .update(updateData)
      .eq('id', params.id)
      .eq('type', 'receivable')
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
      ...data,
      client_name: data.companies_clients_suppliers?.name || null,
      category_name: data.financial_categories?.description || null,
      companies_clients_suppliers: undefined,
      financial_categories: undefined
    }

    console.log(`✅ Account receivable updated: ${params.id}`)

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

// DELETE - Deletar uma conta a receber
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', params.id)
      .eq('type', 'receivable')

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao deletar conta a receber' },
        { status: 500 }
      )
    }

    console.log(`✅ Account receivable deleted: ${params.id}`)

    return NextResponse.json({
      success: true,
      message: 'Conta a receber deletada com sucesso'
    })
  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}