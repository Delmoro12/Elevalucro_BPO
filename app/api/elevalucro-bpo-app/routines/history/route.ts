import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../../src/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API BPO-APP: Getting routines history from database...')
    
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // 🔒 AUTENTICAÇÃO JWT - Obter e validar token Bearer
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ API BPO-APP: Missing or invalid Authorization header')
      return NextResponse.json(
        { success: false, error: 'Token de acesso obrigatório' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('❌ API BPO-APP: Authentication error:', authError)
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    console.log(`✅ API BPO-APP: Authenticated user: ${user.email}`)

    // Obter parâmetros de query (incluindo company_id)
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')
    const search = searchParams.get('search') || ''
    const startDate = searchParams.get('start_date') || ''
    const endDate = searchParams.get('end_date') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '25')

    // Validar que company_id foi fornecido
    if (!companyId) {
      console.error('❌ API BPO-APP: Missing company_id parameter')
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      )
    }

    console.log(`✅ API BPO-APP: Processing request for company: ${companyId}`)
    
    console.log('🔑 Using Supabase config: { url: \'http://127.0.0.1:54321\', keyType: \'eyJhbGciOiJIUzI1NiIs...\' }')

    // 🔒 SEGURANÇA: Construir query base filtrada pelo company_id fornecido
    let query = supabase
      .from('routine_executions_history')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId) // Filtrar pela empresa fornecida

    // Aplicar filtros
    if (search) {
      query = query.ilike('routine_name', `%${search}%`);
    }

    if (startDate) {
      query = query.gte('executed_at', startDate);
    }

    if (endDate) {
      query = query.lte('executed_at', endDate);
    }

    // Aplicar ordenação e paginação
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
      .order('executed_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / pageSize);

    // Formatar dados para a resposta
    const formattedData = (data || []).map(routine => ({
      ...routine,
      executed_at_formatted: new Date(routine.executed_at).toLocaleString('pt-BR'),
      created_at_formatted: new Date(routine.created_at).toLocaleString('pt-BR'),
      search_text: `${routine.routine_name} ${routine.routine_description} ${routine.executed_by_name || ''}`.toLowerCase()
    }));

    console.log(`✅ BPO-APP: Found ${data?.length || 0} routine executions`);

    return NextResponse.json({
      success: true,
      data: formattedData,
      total: count || 0,
      page,
      pageSize,
      totalPages
    });

  } catch (error) {
    console.error('❌ Error in routines history API:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}