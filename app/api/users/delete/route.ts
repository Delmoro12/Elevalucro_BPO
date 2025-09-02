import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../src/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    // Initialize Supabase admin client
    const supabase = getSupabaseAdmin();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase admin client not available' },
        { status: 500 }
      );
    }

    // Get the current user to verify permissions using the token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has bpo_side role
    const userRole = user.user_metadata?.role;
    if (userRole !== 'bpo_side') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only BPO staff can delete users.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { user_email, user_id } = body;

    if (!user_email && !user_id) {
      return NextResponse.json(
        { error: 'Either user_email or user_id must be provided' },
        { status: 400 }
      );
    }

    // Use the token we already have from the authorization header (already defined above)

    // Call the edge function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const response = await fetch(
      `${supabaseUrl}/functions/v1/delete-user-completely`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_email,
          user_id
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: result.error || 'Failed to delete user',
          details: result 
        },
        { status: response.status }
      );
    }

    // Log successful deletion
    console.log(`User deletion completed via API:`, {
      deleted_by: user.email,
      deleted_user: user_email || user_id,
      timestamp: new Date().toISOString(),
      result: result
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in delete user API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}