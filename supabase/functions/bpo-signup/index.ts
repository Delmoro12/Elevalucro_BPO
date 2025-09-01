import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('🚀 BPO operator signup started');

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse request
    const { full_name, email, phone, password } = await req.json();
    
    if (!full_name || !email || !password) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: full_name, email, password' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📋 Creating BPO operator:', { full_name, email, phone: phone || 'N/A' });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate password length
    if (password.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters long' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('👤 Creating auth user...');
    
    // Create auth user
    const { data: authUser, error: authError } = await serviceClient.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: password,
      email_confirm: true, // BPO operators are pre-verified
      user_metadata: {
        full_name: full_name.trim(),
        phone: phone?.trim() || null,
        role: 'bpo_side'
      }
    });
    
    if (authError || !authUser?.user) {
      console.error('❌ Auth creation failed:', authError);
      
      // Handle specific auth errors
      if (authError?.message?.includes('already registered')) {
        return new Response(JSON.stringify({
          error: 'Este email já está cadastrado'
        }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({
        error: 'Failed to create user account',
        details: authError?.message || 'Unknown error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = authUser.user.id;
    console.log('✅ Auth user created:', userId);

    // Create database record
    console.log('🗃️ Creating database record...');
    const { data: dbResult, error: dbError } = await serviceClient.rpc('create_bpo_operator_signup', {
      p_user_id: userId,
      p_full_name: full_name.trim(),
      p_email: email.toLowerCase().trim(),
      p_phone: phone?.trim() || null
    });
    
    if (dbError) {
      console.error('❌ Database creation failed:', dbError);
      
      // Cleanup: delete auth user if database creation fails
      try {
        await serviceClient.auth.admin.deleteUser(userId);
        console.log('🧹 Cleaned up auth user after database error');
      } catch (cleanupError) {
        console.error('❌ Failed to cleanup auth user:', cleanupError);
      }
      
      return new Response(JSON.stringify({
        error: 'Failed to create operator record',
        details: dbError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Database record created');

    // Force JWT refresh to include custom claims from database
    console.log('🔄 Triggering JWT hook to load custom claims...');
    try {
      const { error: refreshError } = await serviceClient.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...authUser.user.user_metadata,
          claims_refreshed: true,
          refresh_timestamp: new Date().toISOString()
        }
      });
      
      if (refreshError) {
        console.log('⚠️ JWT refresh warning:', refreshError.message);
      } else {
        console.log('✅ JWT hook triggered for claims refresh');
      }
    } catch (refreshErr) {
      console.log('⚠️ JWT refresh failed, but continuing...', refreshErr);
    }

    console.log('🎉 BPO operator signup completed successfully!');

    return new Response(JSON.stringify({
      success: true,
      message: 'BPO operator created successfully',
      data: {
        user_id: userId,
        email: email.toLowerCase().trim(),
        full_name: full_name.trim(),
        role: 'bpo_side',
        created_at: new Date().toISOString()
      }
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});