import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { decodeJWT } from '@/src/lib/jwtUtils';

// GET - Buscar acesso por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔑 [API] GET /accesses/:id - Getting access by ID:', params.id);

    // Extrair company_id do JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwtClaims = decodeJWT(token);
    const companyId = jwtClaims?.user_metadata?.company_id;

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID not found in token' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('clients_access')
      .select(`
        *,
        created_by_user:created_by(full_name),
        updated_by_user:updated_by(full_name)
      `)
      .eq('id', params.id)
      .eq('company_id', companyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Access not found' }, { status: 404 });
      }
      console.error('❌ [API] Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Mapear dados
    const mappedData = {
      id: data.id,
      company_id: data.company_id,
      description: data.description,
      login: data.login,
      password: data.password,
      url: data.url,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_by: data.updated_by,
      updated_at: data.updated_at,
      created_by_name: data.created_by_user?.full_name,
      updated_by_name: data.updated_by_user?.full_name,
    };

    console.log('✅ [API] Access found:', params.id);
    return NextResponse.json(mappedData);

  } catch (error) {
    console.error('❌ [API] Error in GET /accesses/:id:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Atualizar acesso
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔑 [API] PUT /accesses/:id - Updating access:', params.id);

    // Extrair company_id do JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwtClaims = decodeJWT(token);
    const companyId = jwtClaims?.user_metadata?.company_id;
    const userId = jwtClaims?.sub;

    if (!companyId || !userId) {
      return NextResponse.json({ error: 'Company ID or User ID not found in token' }, { status: 400 });
    }

    const body = await request.json();
    const { description, login, password, url } = body;

    // Preparar dados para atualização
    const updateData: any = {
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    if (description !== undefined) updateData.description = description.trim();
    if (login !== undefined) updateData.login = login.trim();
    if (password !== undefined) updateData.password = password.trim();
    if (url !== undefined) updateData.url = url?.trim() || null;

    // Validações
    if (updateData.description === '') {
      return NextResponse.json({ error: 'Description cannot be empty' }, { status: 400 });
    }
    if (updateData.login === '') {
      return NextResponse.json({ error: 'Login cannot be empty' }, { status: 400 });
    }
    if (updateData.password === '') {
      return NextResponse.json({ error: 'Password cannot be empty' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('clients_access')
      .update(updateData)
      .eq('id', params.id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Access not found' }, { status: 404 });
      }
      console.error('❌ [API] Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    console.log('✅ [API] Access updated successfully:', params.id);
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ [API] Error in PUT /accesses/:id:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Deletar acesso
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔑 [API] DELETE /accesses/:id - Deleting access:', params.id);

    // Extrair company_id do JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwtClaims = decodeJWT(token);
    const companyId = jwtClaims?.user_metadata?.company_id;

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID not found in token' }, { status: 400 });
    }

    const { error } = await supabase
      .from('clients_access')
      .delete()
      .eq('id', params.id)
      .eq('company_id', companyId);

    if (error) {
      console.error('❌ [API] Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    console.log('✅ [API] Access deleted successfully:', params.id);
    return NextResponse.json({ message: 'Access deleted successfully' });

  } catch (error) {
    console.error('❌ [API] Error in DELETE /accesses/:id:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}