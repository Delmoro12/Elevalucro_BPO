import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface CreateUserPayload {
  email: string;
  full_name: string;
  password: string;
  phone?: string;
  whatsapp?: string;
  profile_name: string; // 'BPO Operator', 'Vendedor', etc.
}

interface UpdateUserPayload {
  user_id: string;
  full_name?: string;
  phone?: string;
  whatsapp?: string;
  profile_name?: string;
  is_active?: boolean;
}

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
    console.log('🚀 BPO User Upsert started');

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
    const { action, ...payload } = await req.json();
    
    if (!action || !['create', 'update'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action. Must be "create" or "update"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'create') {
      return await createBpoUser(serviceClient, payload as CreateUserPayload);
    } else {
      return await updateBpoUser(serviceClient, payload as UpdateUserPayload);
    }

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

async function createBpoUser(serviceClient: any, payload: CreateUserPayload) {
  const { email, full_name, password, phone, whatsapp, profile_name } = payload;

  console.log('👤 Creating BPO user:', email);

  // 1. Get BPO role
  const { data: bpoRole, error: roleError } = await serviceClient
    .from('roles')
    .select('id')
    .eq('name', 'bpo_side')
    .single();

  if (roleError || !bpoRole) {
    console.error('❌ BPO role not found:', roleError);
    return new Response(JSON.stringify({ 
      error: 'BPO role not found',
      details: roleError?.message 
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // 2. Get or create profile
  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('name', profile_name)
    .eq('role_id', bpoRole.id)
    .maybeSingle();

  let profileId = profile?.id;

  if (!profileId) {
    console.log('📝 Creating new profile:', profile_name);
    const { data: newProfile, error: newProfileError } = await serviceClient
      .from('profiles')
      .insert({
        name: profile_name,
        role_id: bpoRole.id,
        is_active: true
      })
      .select('id')
      .single();

    if (newProfileError) {
      console.error('❌ Error creating profile:', newProfileError);
      return new Response(JSON.stringify({
        error: 'Failed to create profile',
        details: newProfileError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    profileId = newProfile.id;
  }

  // 3. Create auth user
  console.log('🔐 Creating auth user');
  const { data: authUser, error: authError } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      phone,
      profile_name
    }
  });

  if (authError || !authUser?.user) {
    console.error('❌ Auth creation failed:', authError);
    return new Response(JSON.stringify({
      error: 'Failed to create auth user',
      details: authError?.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const userId = authUser.user.id;

  // 4. Create user record
  console.log('📊 Creating user record');
  const { error: userError } = await serviceClient
    .from('users')
    .insert({
      id: userId,
      email,
      full_name,
      first_name: full_name.split(' ')[0],
      last_name: full_name.split(' ').slice(1).join(' ') || '',
      phone,
      whatsapp: whatsapp || phone,
      role_id: bpoRole.id,
      profile_id: profileId,
      company_id: null, // BPO users don't have company
      is_active: true,
      is_verified: true,
      verification_level: 'email'
    });

  if (userError) {
    console.error('❌ User creation failed:', userError);
    // Cleanup auth user
    await serviceClient.auth.admin.deleteUser(userId);
    return new Response(JSON.stringify({
      error: 'Failed to create user record',
      details: userError.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log('✅ BPO user created successfully');

  return new Response(JSON.stringify({
    success: true,
    message: 'BPO user created successfully',
    data: {
      user_id: userId,
      email,
      full_name,
      profile_name,
      profile_id: profileId
    }
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function updateBpoUser(serviceClient: any, payload: UpdateUserPayload) {
  const { user_id, full_name, phone, whatsapp, profile_name, is_active } = payload;

  console.log('✏️ Updating BPO user:', user_id);

  // Build update data
  const updateData: any = {};
  
  if (full_name !== undefined) {
    updateData.full_name = full_name;
    updateData.first_name = full_name.split(' ')[0];
    updateData.last_name = full_name.split(' ').slice(1).join(' ') || '';
  }
  
  if (phone !== undefined) updateData.phone = phone;
  if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
  if (is_active !== undefined) updateData.is_active = is_active;

  // Handle profile change
  if (profile_name !== undefined) {
    const { data: bpoRole, error: roleError } = await serviceClient
      .from('roles')
      .select('id')
      .eq('name', 'bpo_side')
      .single();

    if (roleError) {
      return new Response(JSON.stringify({
        error: 'BPO role not found',
        details: roleError.message
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('name', profile_name)
      .eq('role_id', bpoRole.id)
      .maybeSingle();

    if (!profile) {
      // Create new profile if doesn't exist
      const { data: newProfile, error: newProfileError } = await serviceClient
        .from('profiles')
        .insert({
          name: profile_name,
          role_id: bpoRole.id,
          is_active: true
        })
        .select('id')
        .single();

      if (newProfileError) {
        return new Response(JSON.stringify({
          error: 'Failed to create profile',
          details: newProfileError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      updateData.profile_id = newProfile.id;
    } else {
      updateData.profile_id = profile.id;
    }
  }

  updateData.updated_at = new Date().toISOString();

  // Update user record
  const { error: userError } = await serviceClient
    .from('users')
    .update(updateData)
    .eq('id', user_id);

  if (userError) {
    console.error('❌ User update failed:', userError);
    return new Response(JSON.stringify({
      error: 'Failed to update user',
      details: userError.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Update auth user metadata if full_name or phone changed
  if (full_name !== undefined || phone !== undefined) {
    const { error: authUpdateError } = await serviceClient.auth.admin.updateUserById(user_id, {
      user_metadata: {
        full_name: full_name,
        phone: phone,
        profile_name: profile_name
      }
    });

    if (authUpdateError) {
      console.warn('⚠️ Auth metadata update failed:', authUpdateError.message);
    }
  }

  console.log('✅ BPO user updated successfully');

  return new Response(JSON.stringify({
    success: true,
    message: 'BPO user updated successfully',
    data: {
      user_id,
      updated_fields: Object.keys(updateData)
    }
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}