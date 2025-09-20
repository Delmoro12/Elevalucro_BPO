import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API: Deleting accounts receivable series...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { series_id, delete_type } = body

    console.log('🔍 Delete series request:', { series_id, delete_type })

    // Validações obrigatórias
    if (!series_id || !delete_type) {
      return NextResponse.json(
        { success: false, error: 'series_id e delete_type são obrigatórios' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('financial_transactions')
      .delete()
      .eq('series_id', series_id)
      .eq('type', 'receivable');

    // Aplicar filtro baseado no tipo de exclusão
    switch (delete_type) {
      case 'current':
        // Apenas a conta atual (precisa do ID específico, não implementado aqui)
        return NextResponse.json(
          { success: false, error: 'delete_type "current" requer account_id específico' },
          { status: 400 }
        );

      case 'future':
        // Apenas contas futuras (due_date > hoje)
        const today = new Date().toISOString().split('T')[0];
        query = query.gt('due_date', today);
        break;

      case 'unpaid':
        // Apenas contas não recebidas (status != 'received')
        query = query.neq('status', 'received');
        break;

      case 'all':
        // Todas as contas da série (sem filtro adicional)
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'delete_type deve ser "current", "future", "unpaid" ou "all"' },
          { status: 400 }
        );
    }

    // Primeiro, contar quantas contas serão excluídas e mostrar detalhes
    let countQuery = supabase
      .from('financial_transactions')
      .select('id, due_date', { count: 'exact' })
      .eq('series_id', series_id)
      .eq('type', 'receivable');

    if (delete_type === 'future') {
      const today = new Date().toISOString().split('T')[0];
      console.log('🗓️ Today:', today, 'filtering for due_date >', today);
      countQuery = countQuery.gt('due_date', today);
    } else if (delete_type === 'unpaid') {
      console.log('💰 Filtering for unpaid accounts (status != "received")');
      countQuery = countQuery.neq('status', 'received');
    }

    const { data: accountsToDelete, count: totalToDelete, error: countError } = await countQuery;
    
    console.log('📊 Accounts found for deletion:', {
      totalToDelete,
      accountsToDelete: accountsToDelete?.map((account: { id: string; due_date: string | null }) => ({
        id: account.id,
        due_date: account.due_date
      }))
    });

    if (countError) {
      console.error('❌ Count error:', countError)
      return NextResponse.json(
        { success: false, error: 'Erro ao contar contas para exclusão' },
        { status: 500 }
      )
    }

    // Executar a exclusão
    const { error: deleteError } = await query;

    if (deleteError) {
      console.error('❌ Delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Erro ao excluir contas da série' },
        { status: 500 }
      )
    }

    console.log(`✅ Deleted ${totalToDelete || 0} accounts from series`)

    return NextResponse.json({
      success: true,
      deleted_count: totalToDelete || 0,
      message: `${totalToDelete || 0} contas excluídas da série`
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
