import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

export async function PATCH(request: NextRequest) {
  try {
    console.log('✏️ API: Updating accounts receivable series...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { series_id, updates, update_type } = body

    console.log('🔍 Update series request:', { series_id, update_type, updates })

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

    // Campos permitidos para atualização
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
      'category_id'
    ];

    // Filtrar apenas campos permitidos
    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in updates) {
        updateData[field] = emptyToNull(updates[field]);
      }
    }

    // Adicionar updated_at
    updateData.updated_at = new Date().toISOString();

    // Construir query baseada no tipo de atualização
    let query = supabase
      .from('financial_transactions')
      .update(updateData)
      .eq('series_id', series_id)
      .eq('type', 'receivable')
      .eq('status', 'pending'); // Não atualizar contas já recebidas

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
        // Todas as contas pendentes da série (sem filtro adicional além do status)
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'update_type deve ser "current", "future" ou "all"' },
          { status: 400 }
        );
    }

    // Executar atualização
    const { data: updatedAccounts, error: updateError } = await query.select();

    if (updateError) {
      console.error('❌ Update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar contas da série' },
        { status: 500 }
      )
    }

    console.log(`✅ Updated ${updatedAccounts?.length || 0} accounts from series`)

    return NextResponse.json({
      success: true,
      updated_count: updatedAccounts?.length || 0,
      data: updatedAccounts,
      message: `${updatedAccounts?.length || 0} contas atualizadas da série`
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}