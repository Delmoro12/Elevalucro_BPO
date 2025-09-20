import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../src/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('📍 Buscando rotina com ID:', params.id);
    
    const { data: routine, error } = await supabase
      .from('companies_routines')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching routine:', error);
      console.error('Error details:', error.details, error.hint, error.code);
      return NextResponse.json(
        { error: 'Routine not found', details: error.message },
        { status: 404 }
      );
    }
    
    console.log('✅ Rotina encontrada:', routine);

    return NextResponse.json({
      success: true,
      routine
    });

  } catch (error) {
    console.error('Get routine API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Remove id from body to avoid conflicts
    const { id, ...updateData } = body;

    const { data: routine, error: updateError } = await supabase
      .from('companies_routines')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating routine:', updateError);
      return NextResponse.json(
        { error: 'Failed to update routine' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      routine
    });

  } catch (error) {
    console.error('Update routine API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🗑️ DELETE API chamada para ID:', params.id);
    
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🗑️ Fazendo soft delete para ID:', params.id);
    
    // Soft delete - just mark as inactive
    const { error: deleteError } = await supabase
      .from('companies_routines')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id);

    if (deleteError) {
      console.error('🗑️ Error deleting routine:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete routine' },
        { status: 500 }
      );
    }

    console.log('🗑️ Soft delete realizado com sucesso');
    
    return NextResponse.json({
      success: true,
      message: 'Routine deleted successfully'
    });

  } catch (error) {
    console.error('Delete routine API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}