import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../src/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API BPO-APP: Getting cash movements from database...')
    
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
    
    // Buscar movimentações de caixa usando a tabela principal
    let query = supabase
      .from('cash_movements')
      .select(`
        *,
        financial_accounts (
          id,
          description
        )
      `)
    
    // Filtrar por company_id apenas se fornecido
    if (companyId) {
      query = query.eq('company_id', companyId)
    }
    
    const { data: cashMovements, error } = await query
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar movimentações de caixa' },
        { status: 500 }
      )
    }

    // Formatar dados para o frontend
    const formattedMovements = (cashMovements || []).map((movement: {
      financial_accounts?: { description?: string | null } | null
      [key: string]: any
    }) => ({
      ...movement,
      financial_account_name: movement.financial_accounts?.description || 'Conta não encontrada',
      amount_formatted: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(movement.amount),
      date_formatted: new Date(movement.date).toLocaleDateString('pt-BR'),
      financial_accounts: undefined // Remove o objeto aninhado
    }))

    console.log(`✅ BPO-APP: Found ${formattedMovements.length} cash movements`)

    return NextResponse.json({
      success: true,
      data: formattedMovements,
      total: formattedMovements.length
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
    console.log('📝 API BPO-APP: Creating new cash movement...')
    
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
      financial_account_id,
      amount,
      type,
      description,
      reference_type,
      reference_id,
      date
    } = body

    // Validações obrigatórias
    if (!company_id || !financial_account_id || !amount || !type || !description || !date) {
      return NextResponse.json(
        { success: false, error: 'company_id, financial_account_id, amount, type, description e date são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar tipo
    if (!['credit', 'debit'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'type deve ser "credit" ou "debit"' },
        { status: 400 }
      )
    }

    // Validar valor
    if (isNaN(amount) || amount <= 0) {
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

    // Criar movimentação de caixa
    const { data: movement, error } = await supabase
      .from('cash_movements')
      .insert([{
        company_id,
        financial_account_id,
        amount: parseFloat(amount),
        type,
        description: description.trim(),
        reference_type: emptyToNull(reference_type),
        reference_id: emptyToNull(reference_id),
        date: date
      }])
      .select(`
        *,
        financial_accounts (
          id,
          description
        )
      `)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao criar movimentação de caixa' },
        { status: 500 }
      )
    }

    // Formatar resposta
    const formattedMovement = {
      ...movement,
      financial_account_name: movement.financial_accounts?.description || 'Conta não encontrada',
      amount_formatted: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(movement.amount),
      date_formatted: new Date(movement.date).toLocaleDateString('pt-BR'),
      financial_accounts: undefined
    }

    console.log(`✅ BPO-APP: Cash movement created: ${movement.id}`)

    return NextResponse.json({
      success: true,
      data: formattedMovement,
      message: 'Movimentação de caixa criada com sucesso'
    })

  } catch (error) {
    console.error('❌ BPO-APP API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
