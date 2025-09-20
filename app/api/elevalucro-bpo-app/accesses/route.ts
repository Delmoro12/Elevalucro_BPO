import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { decodeJWT } from '@/src/lib/jwtUtils';

// GET - Listar acessos
export async function GET(request: NextRequest) {
  try {
    console.log('🔑 [API] GET /accesses - Listing accesses');

    // Extrair company_id do JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ [API] No authorization header');
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwtClaims = decodeJWT(token);
    const companyId = jwtClaims?.user_metadata?.company_id;

    if (!companyId) {
      console.log('❌ [API] No company_id in JWT');
      return NextResponse.json({ error: 'Company ID not found in token' }, { status: 400 });
    }

    console.log('✅ [API] Company ID from JWT:', companyId);

    // Parâmetros de busca
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');

    // Construir query
    let query = supabase
      .from('clients_access')
      .select(`
        *,
        created_by_user:created_by(full_name),
        updated_by_user:updated_by(full_name)
      `, { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    // Aplicar filtro de busca
    if (search) {
      query = query.or(`description.ilike.%${search}%,login.ilike.%${search}%`);
    }

    // Aplicar paginação
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ [API] Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Mapear dados
    const mappedData = (data || []).map((item: any) => ({
      id: item.id,
      company_id: item.company_id,
      description: item.description,
      login: item.login,
      password: item.password,
      url: item.url,
      created_by: item.created_by,
      created_at: item.created_at,
      updated_by: item.updated_by,
      updated_at: item.updated_at,
      created_by_name: item.created_by_user?.full_name,
      updated_by_name: item.updated_by_user?.full_name,
    }));

    console.log(`✅ [API] Found ${mappedData.length} accesses for company ${companyId}`);

    return NextResponse.json({
      data: mappedData,
      total: count || 0,
      page,
      limit,
    });

  } catch (error) {
    console.error('❌ [API] Error in GET /accesses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Criar acesso
export async function POST(request: NextRequest) {
  try {
    console.log('🔑 [API] POST /accesses - Creating access');

    // Extrair company_id do JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ [API] No authorization header');
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwtClaims = decodeJWT(token);
    const companyId = jwtClaims?.user_metadata?.company_id;
    const userId = jwtClaims?.sub;

    if (!companyId || !userId) {
      console.log('❌ [API] No company_id or user_id in JWT');
      return NextResponse.json({ error: 'Company ID or User ID not found in token' }, { status: 400 });
    }

    const body = await request.json();
    const { description, login, password, url } = body;

    // Validações
    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }
    if (!login?.trim()) {
      return NextResponse.json({ error: 'Login is required' }, { status: 400 });
    }
    if (!password?.trim()) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    console.log('✅ [API] Creating access for company:', companyId);

    const { data, error } = await supabase
      .from('clients_access')
      .insert({
        company_id: companyId,
        description: description.trim(),
        login: login.trim(),
        password: password.trim(),
        url: url?.trim() || null,
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [API] Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    console.log('✅ [API] Access created successfully:', data.id);
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('❌ [API] Error in POST /accesses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}