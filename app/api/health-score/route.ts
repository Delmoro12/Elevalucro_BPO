import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../src/lib/supabase';

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
    const classification = searchParams.get('classification');

    let query = supabase
      .from('operational_health_score')
      .select('*');

    // Filter by company if specified
    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    // Filter by health classification if specified
    if (classification && ['excellent', 'good', 'warning', 'critical'].includes(classification)) {
      query = query.eq('health_classification', classification);
    }

    // Order by health score (best first) and company name
    query = query.order('health_score', { ascending: false })
                 .order('nome_empresa', { ascending: true });

    const { data: healthScores, error } = await query;

    if (error) {
      console.error('Error fetching health scores:', error);
      return NextResponse.json(
        { error: 'Failed to fetch health scores', details: error.message },
        { status: 500 }
      );
    }

    // Calculate aggregated stats
    const stats = {
      total_companies: healthScores?.length || 0,
      excellent: healthScores?.filter((c: any) => c.health_classification === 'excellent').length || 0,
      good: healthScores?.filter((c: any) => c.health_classification === 'good').length || 0,
      warning: healthScores?.filter((c: any) => c.health_classification === 'warning').length || 0,
      critical: healthScores?.filter((c: any) => c.health_classification === 'critical').length || 0,
      average_score: healthScores?.length ? 
        (healthScores.reduce((sum: number, c: any) => sum + c.health_score, 0) / healthScores.length).toFixed(1) : 0,
      companies_in_onboarding: healthScores?.filter((c: any) => c.lifecycle_stage === 'onboarding').length || 0,
      companies_operational: healthScores?.filter((c: any) => c.lifecycle_stage === 'operational').length || 0
    };

    return NextResponse.json({
      success: true,
      health_scores: healthScores || [],
      stats
    });

  } catch (error) {
    console.error('Unexpected error in health score API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}