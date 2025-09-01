import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../src/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🚀 API /auth/bpo-signup called');
  
  try {
    const body = await request.json();
    const { full_name, email, phone, password } = body;
    
    // Validate required fields
    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: full_name, email, password' },
        { status: 400 }
      );
    }

    console.log('📋 BPO signup request:', { full_name, email, phone: phone || 'N/A' });

    // Get Supabase client
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.log('❌ Supabase admin client not available');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Call the edge function with proper headers
    const { data, error } = await supabase.functions.invoke('bpo-signup', {
      body: {
        full_name,
        email,
        phone,
        password
      },
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      return NextResponse.json(
        { 
          error: error.message || 'Failed to create BPO operator',
          details: error.details || 'Unknown error'
        },
        { status: 500 }
      );
    }

    if (!data?.success) {
      console.error('❌ Edge function returned error:', data);
      return NextResponse.json(
        { 
          error: data?.error || 'Failed to create BPO operator',
          details: data?.details || 'Unknown error'
        },
        { status: data?.status || 500 }
      );
    }

    console.log('✅ BPO operator created successfully:', data.data?.user_id);
    
    return NextResponse.json({
      success: true,
      message: data.message,
      data: data.data
    });

  } catch (error) {
    console.error('❌ Unexpected error in bpo-signup API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}