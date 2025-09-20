import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../src/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Getting accounts payable from database...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Obter company_id da query string
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      )
    }
    
    // Buscar contas a pagar usando a view unificada com dados já enriquecidos
    // IMPORTANTE: Apenas registros validados são mostrados nas Tools
    const { data: accountsPayable, error } = await supabase
      .from('financial_transactions_view')
      .select('*')
      .eq('company_id', companyId)
      .eq('type', 'payable')
      .eq('validated', true)
      .order('due_date', { ascending: true })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar contas a pagar' },
        { status: 500 }
      )
    }

    // Dados já vêm formatados da view
    const formattedAccounts = accountsPayable || []

    console.log(`✅ Found ${formattedAccounts.length} accounts payable`)

    return NextResponse.json({
      success: true,
      data: formattedAccounts,
      total: formattedAccounts.length
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
    console.log('📝 API: Creating new account payable...')
    
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
      user_id,  // ID do usuário autenticado vindo do JWT
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
      installment_day,
      // Campos de validação BPO
      created_by_side,
      validated,
      validated_at,
      validated_by
    } = body

    // Validações obrigatórias
    if (!company_id || !value || !due_date || !payment_method) {
      return NextResponse.json(
        { success: false, error: 'company_id, value, due_date e payment_method são obrigatórios' },
        { status: 400 }
      )
    }

    // user_id opcional por enquanto (TODO: tornar obrigatório quando frontend enviar)
    // if (!user_id) {
    //   return NextResponse.json(
    //     { success: false, error: 'user_id é obrigatório para auditoria' },
    //     { status: 400 }
    //   )
    // }

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

    // Criar conta a pagar na tabela unificada
    const { data: account, error } = await supabase
      .from('financial_transactions')
      .insert([{
        company_id,
        type: 'payable',
        created_by_side: created_by_side || 'bpo_side',
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
        validated: validated !== undefined ? validated : false,
        validated_at: validated_at || null,
        validated_by: validated_by || null,
        created_by: user_id
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
        { success: false, error: 'Erro ao criar conta a pagar' },
        { status: 500 }
      )
    }

    // Se a conta for recorrente (não única), gerar as contas da série
    let recurringAccounts = [];
    if (occurrence && occurrence !== 'unique') {
      console.log(`🔄 Generating recurring accounts for ${occurrence} occurrence...`);
      try {
        const { data: generatedAccounts, error: recurrenceError } = await supabase
          .rpc('generate_recurring_accounts', {
            p_account_id: account.id,
            p_occurrence_type: occurrence,
            p_recurrence_config: recurrenceConfig
          });

        if (recurrenceError) {
          console.error('❌ Recurrence generation error:', recurrenceError);
          // Não falhar a criação da conta principal, apenas log do erro
        } else {
          recurringAccounts = generatedAccounts || [];
          console.log(`✅ Generated ${recurringAccounts.length} recurring accounts`);
        }
      } catch (recurrenceErr) {
        console.error('❌ Error calling recurrence function:', recurrenceErr);
        // Não falhar a criação da conta principal
      }
    }

    // Formatar resposta
    const formattedAccount = {
      ...account,
      supplier_name: account.companies_clients_suppliers?.name || null,
      category_name: account.financial_categories?.description || null,
      companies_clients_suppliers: undefined,
      financial_categories: undefined
    }

    console.log(`✅ Account payable created: ${account.id}`)

    return NextResponse.json({
      success: true,
      data: formattedAccount,
      recurring_accounts_created: recurringAccounts.length,
      message: recurringAccounts.length > 0 
        ? `Conta criada com ${recurringAccounts.length} contas recorrentes geradas`
        : 'Conta criada com sucesso'
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
