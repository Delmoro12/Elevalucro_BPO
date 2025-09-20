import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

export async function PATCH(request: NextRequest) {
  try {
    console.log('📝 API: Updating accounts series...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { series_id, updates, update_type } = body

    // Validações obrigatórias
    if (!series_id || !updates || !update_type) {
      return NextResponse.json(
        { success: false, error: 'series_id, updates e update_type são obrigatórios' },
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

    // Preparar dados para update
    const updateData: any = {};
    
    if (updates.pix_number !== undefined) {
      updateData.pix_number = emptyToNull(updates.pix_number);
    }
    if (updates.bank_slip_code !== undefined) {
      updateData.bank_slip_code = emptyToNull(updates.bank_slip_code);
    }
    if (updates.payment_method !== undefined) {
      updateData.payment_method = updates.payment_method;
    }
    if (updates.companies_clients_suppliers_id !== undefined) {
      updateData.companies_clients_suppliers_id = emptyToNull(updates.companies_clients_suppliers_id);
    }
    if (updates.value !== undefined) {
      updateData.value = parseFloat(updates.value);
    }
    if (updates.date_of_issue !== undefined) {
      updateData.date_of_issue = emptyToNull(updates.date_of_issue);
    }
    if (updates.number_of_document !== undefined) {
      updateData.number_of_document = emptyToNull(updates.number_of_document);
    }
    if (updates.notes !== undefined) {
      updateData.notes = emptyToNull(updates.notes);
    }
    if (updates.category_id !== undefined) {
      updateData.category_id = emptyToNull(updates.category_id);
    }

    updateData.updated_at = new Date().toISOString();

    let query = supabase
      .from('financial_transactions')
      .update(updateData)
      .eq('series_id', series_id)
      .eq('type', 'payable');

    // Aplicar filtro baseado no tipo de atualização
    switch (update_type) {
      case 'current':
        // Apenas a conta atual (precisa do ID específico, não implementado aqui)
        return NextResponse.json(
          { success: false, error: 'update_type "current" requer account_id específico' },
          { status: 400 }
        );

      case 'future':
        // Apenas contas futuras (due_date >= hoje)
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('due_date', today);
        break;

      case 'all':
        // Todas as contas da série (sem filtro adicional)
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'update_type deve ser "current", "future" ou "all"' },
          { status: 400 }
        );
    }

    const { data: updatedAccounts, error } = await query
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
      `);

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar série de contas' },
        { status: 500 }
      )
    }

    // Formatar resposta
    const formattedAccounts = (updatedAccounts || []).map((account: {
      id: string
      companies_clients_suppliers?: { name?: string | null } | null
      financial_categories?: { description?: string | null } | null
      [key: string]: any
    }) => ({
      ...account,
      supplier_name: account.companies_clients_suppliers?.name || null,
      category_name: account.financial_categories?.description || null,
      companies_clients_suppliers: undefined,
      financial_categories: undefined
    }));

    console.log(`✅ Updated ${formattedAccounts.length} accounts in series`)

    return NextResponse.json({
      success: true,
      data: formattedAccounts,
      total: formattedAccounts.length,
      message: `${formattedAccounts.length} contas atualizadas`
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
