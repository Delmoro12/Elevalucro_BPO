import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../src/lib/supabase';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase admin client not available' },
        { status: 500 }
      );
    }
    const { id: companyId } = params;

    // Get detailed onboarding information for specific company
    const { data: companyDetails, error } = await supabase
      .from('onboarding_companies_unified')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Company not found in onboarding' },
          { status: 404 }
        );
      }
      
      console.error('Error fetching company onboarding details:', error);
      return NextResponse.json(
        { error: 'Failed to fetch company details', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      company: companyDetails
    });

  } catch (error) {
    console.error('Unexpected error in company onboarding details API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase admin client not available' },
        { status: 500 }
      );
    }
    const { id: companyId } = params;
    const body = await request.json();

    const { 
      checklist_item_id, 
      is_checked, 
      notes,
      semana_onboarding // For moving between weeks
    } = body;

    // If updating checklist item
    if (checklist_item_id !== undefined) {
      const { error: checklistError } = await supabase
        .from('companies_onboarding_checklist')
        .upsert({
          company_id: companyId,
          checklist_item_id: checklist_item_id,
          is_checked: is_checked,
          notes: notes,
          checked_at: is_checked ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'company_id,checklist_item_id'
        });

      if (checklistError) {
        console.error('Error updating checklist item:', checklistError);
        return NextResponse.json(
          { error: 'Failed to update checklist item', details: checklistError.message },
          { status: 500 }
        );
      }

      // Calculate and update onboarding progress
      const { data: checklistStats, error: statsError } = await supabase
        .from('companies_onboarding_checklist')
        .select('is_checked')
        .eq('company_id', companyId);

      if (!statsError && checklistStats) {
        const totalItems = checklistStats.length;
        const completedItems = checklistStats.filter(item => item.is_checked).length;
        const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        // Update the companies table with new progress
        const { error: progressError } = await supabase
          .from('companies')
          .update({ 
            onboarding_progress: progressPercentage,
            updated_at: new Date().toISOString()
          })
          .eq('id', companyId);

        if (progressError) {
          console.error('Error updating onboarding progress:', progressError);
        } else {
          console.log(`Updated onboarding progress for company ${companyId}: ${progressPercentage}%`);
        }
      }
    }

    // If moving company between onboarding weeks
    if (semana_onboarding) {
      // This would need additional logic to update company stage
      // For now, we'll just return success as the view calculates weeks automatically
      console.log(`Company ${companyId} moved to ${semana_onboarding}`);
    }

    // Return updated company details
    const { data: updatedCompany, error: fetchError } = await supabase
      .from('onboarding_companies_unified')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated company details:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch updated details', details: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      company: updatedCompany
    });

  } catch (error) {
    console.error('Unexpected error in company onboarding update API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}