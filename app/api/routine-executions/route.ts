import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../src/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Starting routine execution request');
    
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.error('❌ API: Database connection failed');
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }
    console.log('✅ API: Database connection OK');

    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ API: Missing authorization header');
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }
    console.log('✅ API: Authorization header found');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ API: Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log('✅ API: User authenticated:', user.email);

    const body = await request.json();
    console.log('📦 API: Request body:', body);
    
    const {
      company_routine_id,
      executed_at,
      status = 'completed',
      notes,
      attachments
    } = body;

    if (!company_routine_id || !executed_at) {
      console.error('❌ API: Missing required fields:', { company_routine_id, executed_at });
      return NextResponse.json(
        { error: 'company_routine_id and executed_at are required' },
        { status: 400 }
      );
    }
    console.log('✅ API: Required fields validated');

    // Create execution record
    console.log('💾 API: Attempting to insert execution record...');
    const insertData = {
      company_routine_id,
      executed_at,
      executed_by: user.id,
      status,
      notes: notes || null,
      attachments: attachments || null
    };
    console.log('📝 API: Insert data:', insertData);

    const { data: execution, error: insertError } = await supabase
      .from('routine_executions')
      .insert(insertData)
      .select(`
        id,
        company_routine_id,
        executed_at,
        executed_by,
        status,
        notes,
        attachments,
        created_at,
        updated_at
      `)
      .single();

    if (insertError) {
      console.error('❌ API: Error creating execution:', insertError);
      return NextResponse.json(
        { error: 'Failed to create execution' },
        { status: 500 }
      );
    }
    console.log('✅ API: Execution record created:', execution?.id);

    // Update companies_routines with last execution info
    const executedDate = new Date(executed_at).toISOString().split('T')[0];
    const { error: updateError } = await supabase
      .from('companies_routines')
      .update({
        last_completed_at: executed_at,
        last_completed_by: user.id,
        last_execution_date: executedDate
      })
      .eq('id', company_routine_id);

    if (updateError) {
      console.error('Error updating routine:', updateError);
      // Don't fail the request as execution was created successfully
    }

    // Also increment completion count
    const { error: incrementError } = await supabase.rpc(
      'increment_routine_completion_count',
      { routine_id: company_routine_id }
    );

    if (incrementError) {
      console.error('Error incrementing completion count:', incrementError);
    }

    console.log('🎉 API: Success! Returning response...');
    return NextResponse.json({
      success: true,
      execution
    });

  } catch (error) {
    console.error('💥 API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const companyRoutineId = searchParams.get('company_routine_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!companyRoutineId) {
      return NextResponse.json(
        { error: 'company_routine_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('routine_executions')
      .select(`
        id,
        company_routine_id,
        executed_at,
        executed_by,
        status,
        notes,
        attachments,
        created_at,
        updated_at
      `)
      .eq('company_routine_id', companyRoutineId)
      .order('executed_at', { ascending: false });

    if (startDate) {
      query = query.gte('executed_at', startDate);
    }

    if (endDate) {
      query = query.lte('executed_at', endDate);
    }

    const { data: executions, error } = await query;

    if (error) {
      console.error('Error fetching executions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch executions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      executions: executions || []
    });

  } catch (error) {
    console.error('Get routine executions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}