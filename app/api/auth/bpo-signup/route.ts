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

    // Call the edge function directly for local development
    const isLocal = process.env.NODE_ENV === 'development';
    const functionUrl = isLocal 
      ? 'http://127.0.0.1:54321/functions/v1/bpo-signup'
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/bpo-signup`;
    
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('📍 Calling edge function at:', functionUrl);
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        full_name,
        email,
        phone,
        password
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Edge function error:', data);
      return NextResponse.json(
        { 
          error: data.error || 'Failed to create BPO operator',
          details: data.details || 'Unknown error'
        },
        { status: response.status }
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