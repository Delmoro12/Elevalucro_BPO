import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../src/lib/supabase'

// Função helper para calcular saldo atual de uma conta
async function calculateAccountBalance(accountId: string, companyId: string) {
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('Supabase client not available')

  const { data: movements, error } = await supabase
    .from('cash_movements')
    .select('amount, type')
    .eq('financial_account_id', accountId)
    .eq('company_id', companyId)

  if (error) {
    console.error('❌ Error calculating balance:', error)
    throw new Error('Erro ao calcular saldo da conta')
  }

  const balance = (movements || []).reduce((acc: number, movement: { type: 'credit' | 'debit'; amount: number }) => {
    return movement.type === 'credit' 
      ? acc + movement.amount 
      : acc - movement.amount
  }, 0)

  console.log(`💰 Current balance for account ${accountId}: R$ ${balance.toFixed(2)}`)
  return balance
}

// Função helper para formatar valor em moeda
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Getting cash movements from database...')
    
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
    
    // Buscar movimentações com dados da conta financeira
    const { data: movements, error } = await supabase
      .from('cash_movements')
      .select(`
        *,
        financial_accounts!financial_account_id (
          id,
          description
        )
      `)
      .eq('company_id', companyId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar movimentações' },
        { status: 500 }
      )
    }

    // Formatar dados incluindo nome da conta
    const formattedMovements = (movements || []).map((movement: {
      financial_accounts?: { description?: string | null } | null
      [key: string]: any
    }) => ({
      ...movement,
      financial_account_name: movement.financial_accounts?.description || null,
      financial_accounts: undefined
    }))

    // Apenas ordenar movimentações por data decrescente
    const sortedMovements = formattedMovements.sort((a: { date?: string | null; created_at?: string | null }, b: { date?: string | null; created_at?: string | null }) => {
      const dateA = new Date(a.date ?? a.created_at ?? 0)
      const dateB = new Date(b.date ?? b.created_at ?? 0)
      return dateB.getTime() - dateA.getTime()
    })

    console.log(`✅ Found ${sortedMovements.length} cash movements`)

    return NextResponse.json({
      success: true,
      data: sortedMovements,
      total: sortedMovements.length
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
    console.log('📝 API: Creating new cash movement...')
    
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

    console.log('🔍 Raw request data:', {
      company_id,
      financial_account_id,
      amount,
      type,
      description,
      reference_type,
      reference_id,
      date
    })

    // Validações obrigatórias
    if (!company_id || !financial_account_id || !amount || !type || !description || !date) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: company_id, financial_account_id, amount, type, description, date' },
        { status: 400 }
      )
    }

    // Validar tipo
    if (!['credit', 'debit'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Tipo deve ser "credit" ou "debit"' },
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

    // Lógica especial para ajuste de saldo
    let finalAmount = parseFloat(amount);
    let finalType = type;
    let finalDescription = description;

    if (reference_type === 'saldo') {
      console.log('🎯 Processing balance adjustment...');
      
      try {
        // Calcular saldo atual da conta
        const currentBalance = await calculateAccountBalance(financial_account_id, company_id);
        const targetBalance = parseFloat(amount);
        const difference = targetBalance - currentBalance;

        console.log(`📊 Balance adjustment calculation:
          Current balance: ${formatCurrency(currentBalance)}
          Target balance: ${formatCurrency(targetBalance)}  
          Difference: ${formatCurrency(difference)}`);

        // Se não há diferença, não criar movimentação
        if (Math.abs(difference) < 0.01) { // Considera diferenças menores que 1 centavo como zero
          return NextResponse.json({
            success: true,
            message: 'Saldo já está no valor desejado. Nenhuma movimentação foi criada.',
            current_balance: formatCurrency(currentBalance)
          });
        }

        // Definir tipo e valor da movimentação de ajuste
        finalAmount = Math.abs(difference);
        finalType = difference >= 0 ? 'credit' : 'debit';
        finalDescription = `Ajuste de saldo para ${formatCurrency(targetBalance)}${description ? ` - ${description}` : ''}`;

        console.log(`✅ Creating adjustment: ${finalType} of ${formatCurrency(finalAmount)}`);

      } catch (error) {
        console.error('❌ Error calculating balance for adjustment:', error);
        return NextResponse.json(
          { success: false, error: 'Erro ao calcular saldo atual da conta para ajuste' },
          { status: 500 }
        );
      }
    }

    console.log('📤 Final data being inserted:', {
      company_id,
      financial_account_id,
      amount: finalAmount,
      type: finalType,
      description: finalDescription,
      reference_type,
      reference_id,
      date
    })

    // Criar movimentação
    const { data: movement, error } = await supabase
      .from('cash_movements')
      .insert([{
        company_id,
        financial_account_id,
        amount: finalAmount,
        type: finalType,
        description: finalDescription,
        reference_type: reference_type || null,
        reference_id: reference_id || null,
        date
      }])
      .select(`
        *,
        financial_accounts!financial_account_id (
          id,
          description
        )
      `)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao criar movimentação' },
        { status: 500 }
      )
    }

    // Formatar resposta
    const formattedMovement = {
      ...movement,
      financial_account_name: movement.financial_accounts?.description || null,
      financial_accounts: undefined
    }

    console.log(`✅ Cash movement created: ${movement.id}`)

    return NextResponse.json({
      success: true,
      data: formattedMovement,
      message: 'Movimentação criada com sucesso'
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
