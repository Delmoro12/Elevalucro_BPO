import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../src/lib/supabase';

export async function POST(request: NextRequest) {
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
    const {
      company_id,
      routine_id,
      custom_name,
      custom_description,
      custom_instructions,
      custom_frequency,
      assigned_to,
      start_date,
      day_of_week,
      day_of_month,
      month_of_year
    } = body;

    if (!company_id) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    // Create company routine
    const { data: routine, error: insertError } = await supabase
      .from('companies_routines')
      .insert({
        company_id,
        routine_id: routine_id || null,
        custom_name: custom_name || null,
        custom_description: custom_description || null,
        custom_instructions: custom_instructions || null,
        custom_frequency: custom_frequency || null,
        assigned_to: assigned_to || null,
        start_date: start_date || null,
        day_of_week: day_of_week || null,
        day_of_month: day_of_month || null,
        month_of_year: month_of_year || null,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating company routine:', insertError);
      return NextResponse.json(
        { error: 'Failed to create routine' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: routine.id,
      routine
    });

  } catch (error) {
    console.error('Companies routines API error:', error);
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
    const companyId = searchParams.get('company_id');

    let query = supabase
      .from('companies_routines')
      .select(`
        *,
        routine:routines(name, description, instructions),
        assigned_user:users!assigned_to(name, email)
      `)
      .eq('is_active', true);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data: routines, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies routines:', error);
      return NextResponse.json(
        { error: 'Failed to fetch routines' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      routines: routines || []
    });

  } catch (error) {
    console.error('Get companies routines API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}