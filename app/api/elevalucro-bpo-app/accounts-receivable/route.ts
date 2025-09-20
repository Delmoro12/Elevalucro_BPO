import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API BPO-APP: Getting accounts receivable from database...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Obter company_id da query string (opcional para BPO-APP por enquanto)
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')
    
    // Buscar contas a receber usando a view unificada com dados já enriquecidos
    let query = supabase
      .from('financial_transactions_view')
      .select('*')
      .eq('type', 'receivable')
    
    // Filtrar por company_id apenas se fornecido
    if (companyId) {
      query = query.eq('company_id', companyId)
    }
    
    const { data: accountsReceivable, error } = await query
      .order('due_date', { ascending: true })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar contas a receber' },
        { status: 500 }
      )
    }

    // Dados já vêm formatados da view
    const formattedAccounts = accountsReceivable || []

    console.log(`✅ BPO-APP: Found ${formattedAccounts.length} accounts receivable`)

    return NextResponse.json({
      success: true,
      data: formattedAccounts,
      total: formattedAccounts.length
    })

  } catch (error) {
    console.error('❌ BPO-APP API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 API BPO-APP: Creating new account receivable...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      company_id, 
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
      occurrence,
      recurrence_day_of_week,
      recurrence_day_of_month,
      installment_count,
      installment_day
    } = body

    // Validações obrigatórias
    if (!company_id || !value || !due_date || !payment_method) {
      return NextResponse.json(
        { success: false, error: 'company_id, value, due_date e payment_method são obrigatórios' },
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

    // Preparar configuração de recorrência usando apenas campos do formulário
    const recurrenceConfig: any = {};
    if (recurrence_day_of_week) recurrenceConfig.day_of_week = recurrence_day_of_week;
    if (recurrence_day_of_month) recurrenceConfig.day_of_month = recurrence_day_of_month;
    if (installment_count) recurrenceConfig.installment_count = installment_count;
    if (installment_day) recurrenceConfig.installment_day = installment_day;

    // Criar conta a receber na tabela unificada (BPO-APP: sempre não validada inicialmente)
    const { data: account, error } = await supabase
      .from('financial_transactions')
      .insert([{
        company_id,
        type: 'receivable',
        created_by_side: 'client_side', // BPO-APP: registros criados pelo cliente
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
        recurrence_config: Object.keys(recurrenceConfig).length > 0 ? recurrenceConfig : null,
        validated: false, // BPO-APP: registros criados aguardam validação
        validated_at: null,
        validated_by: null
      }])
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
        { success: false, error: 'Erro ao criar conta a receber' },
        { status: 500 }
      )
    }

    // IMPORTANTE: Na criação pelo cliente (BPO-APP), NÃO geramos os registros recorrentes
    // Os registros recorrentes serão gerados apenas quando o operador BPO validar/aprovar
    // Isso garante controle e revisão antes da criação em massa
    if (occurrence && occurrence !== 'unique') {
      console.log(`📝 BPO-APP: Conta recorrente (${occurrence}) criada. Aguardando validação BPO para gerar série.`);
    }

    // Formatar resposta
    const formattedAccount = {
      ...account,
      client_name: account.companies_clients_suppliers?.name || null,
      category_name: account.financial_categories?.description || null,
      companies_clients_suppliers: undefined,
      financial_categories: undefined
    }

    console.log(`✅ BPO-APP: Account receivable created: ${account.id}`)

    return NextResponse.json({
      success: true,
      data: formattedAccount,
      message: occurrence && occurrence !== 'unique' 
        ? `Conta recorrente (${occurrence}) criada. Será replicada após validação do BPO.`
        : 'Conta criada com sucesso'
    })

  } catch (error) {
    console.error('❌ BPO-APP API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}