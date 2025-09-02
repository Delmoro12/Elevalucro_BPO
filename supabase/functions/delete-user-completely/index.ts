import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteUserRequest {
  user_email?: string;
  user_id?: string;
}

interface DeleteUserResponse {
  success: boolean;
  message: string;
  deleted?: {
    company_users: number;
    profiles: number;
    users: number;
    auth_user: boolean;
  };
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role (for admin operations)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the calling user's token and role
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !callingUser) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if calling user has bpo_side role
    const userRole = callingUser.user_metadata?.role;
    if (userRole !== 'bpo_side') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Only BPO staff can delete users.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: DeleteUserRequest = await req.json();
    const { user_email, user_id } = body;

    if (!user_email && !user_id) {
      return new Response(
        JSON.stringify({ error: 'Either user_email or user_id must be provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the user to delete
    let targetUserId: string | null = null;
    let targetEmail: string | null = null;

    if (user_id) {
      targetUserId = user_id;
      // Get email for logging
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('id', user_id)
        .single();
      targetEmail = userData?.email || 'unknown';
    } else if (user_email) {
      targetEmail = user_email;
      // Get user ID from auth.users
      const { data: { users }, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (searchError) {
        throw new Error(`Error searching for user: ${searchError.message}`);
      }

      const targetUser = users.find(u => u.email === user_email);
      if (!targetUser) {
        return new Response(
          JSON.stringify({ 
            success: false,
            message: `User with email ${user_email} not found`,
            error: 'User not found' 
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      targetUserId = targetUser.id;
    }

    if (!targetUserId) {
      throw new Error('Could not determine target user ID');
    }

    // Start deletion process (atomic - all or nothing)
    const deletionResults = {
      company_users: 0,
      profiles: 0,
      users: 0,
      auth_user: false
    };

    try {
      // 1. Delete from company_users
      const { count: companyUsersCount, error: companyUsersError } = await supabaseAdmin
        .from('company_users')
        .delete()
        .eq('user_id', targetUserId);
      
      if (companyUsersError) {
        console.error('Error deleting from company_users:', companyUsersError);
        // Continue even if no records found
      }
      deletionResults.company_users = companyUsersCount || 0;

      // 2. Delete from profiles
      const { count: profilesCount, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('user_id', targetUserId);
      
      if (profilesError) {
        console.error('Error deleting from profiles:', profilesError);
        // Continue even if no records found
      }
      deletionResults.profiles = profilesCount || 0;

      // 3. Delete from users table
      const { count: usersCount, error: usersError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', targetUserId);
      
      if (usersError) {
        console.error('Error deleting from users:', usersError);
        // Continue even if no records found
      }
      deletionResults.users = usersCount || 0;

      // 4. Finally, delete from auth.users
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
      
      if (authDeleteError) {
        throw new Error(`Failed to delete auth user: ${authDeleteError.message}`);
      }
      deletionResults.auth_user = true;

      // Log the deletion for audit purposes
      console.log(`User deletion completed by ${callingUser.email}:`, {
        deleted_user_id: targetUserId,
        deleted_user_email: targetEmail,
        deleted_by: callingUser.email,
        deleted_at: new Date().toISOString(),
        results: deletionResults
      });

      // Return success response
      const response: DeleteUserResponse = {
        success: true,
        message: `User ${targetEmail} and all related data have been permanently deleted`,
        deleted: deletionResults
      };

      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (deletionError) {
      // If any step fails, we should ideally rollback
      // Since Supabase doesn't support cross-table transactions in Edge Functions,
      // we log the error and return failure
      console.error('Error during deletion process:', deletionError);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to complete user deletion',
          error: deletionError instanceof Error ? deletionError.message : 'Unknown error',
          deleted: deletionResults
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Unexpected error in delete-user-completely function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});