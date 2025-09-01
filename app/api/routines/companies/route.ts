import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase admin client not available' },
        { status: 500 }
      );
    }
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    if (companyId) {
      // Get specific company routine details
      const { data: routines, error } = await supabase
        .from('company_routines_details')
        .select('*')
        .eq('company_id', companyId)
        .order('routine_status', { ascending: true })
        .order('routine_next_execution', { ascending: true });

      if (error) {
        console.error('Error fetching company routines:', error);
        return NextResponse.json(
          { error: 'Failed to fetch company routines', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        routines: routines || []
      });
    } else {
      // Get routines summary for all companies
      const { data: companies, error } = await supabase
        .from('companies_routines_summary')
        .select('*')
        .order('health_score', { ascending: false });

      if (error) {
        console.error('Error fetching companies routines summary:', error);
        return NextResponse.json(
          { error: 'Failed to fetch routines summary', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        companies: companies || []
      });
    }

  } catch (error) {
    console.error('Unexpected error in routines companies API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}