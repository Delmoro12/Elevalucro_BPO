import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../src/lib/supabase';

export async function GET(request: NextRequest) {
  console.log('🚀 API /onboarding/companies called');
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.log('❌ Supabase admin client not available');
      return NextResponse.json(
        { error: 'Supabase admin client not available' },
        { status: 500 }
      );
    }

    // Get companies from the unified view (now corrected to show real email, phone, segmento)
    const { data: companies, error } = await supabase
      .from('onboarding_companies_unified')
      .select('*')
      .order('data_inicio', { ascending: true });

    if (error) {
      console.error('Error fetching onboarding companies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch onboarding companies', details: error.message },
        { status: 500 }
      );
    }



    return NextResponse.json({
      success: true,
      companies: companies || []
    });

  } catch (error) {
    console.error('Unexpected error in onboarding companies API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}