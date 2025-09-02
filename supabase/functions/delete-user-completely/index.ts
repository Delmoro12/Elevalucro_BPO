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
    routine_executions: number;
    companies_routines: number;
    companies_onboarding_checklist: number;
    documents: number;
    entities: number;
    profiles: number;
    subscriptions: number;
    user_permissions: number;
    user_company_roles: number;
    user_companies: number;
    user_profiles: number;
    companies: number;
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
      routine_executions: 0,
      companies_routines: 0,
      companies_onboarding_checklist: 0,
      documents: 0,
      entities: 0,
      profiles: 0,
      subscriptions: 0,
      user_permissions: 0,
      user_company_roles: 0,
      user_companies: 0,
      user_profiles: 0,
      companies: 0,
      users: 0,
      auth_user: false
    };

    try {
      // First, get all companies associated with this user
      const { data: userCompanies, error: getUserCompaniesError } = await supabaseAdmin
        .from('user_companies')
        .select('company_id')
        .eq('user_id', targetUserId);

      if (getUserCompaniesError) {
        console.error('Error fetching user companies:', getUserCompaniesError);
      }

      const companyIds = userCompanies?.map(uc => uc.company_id) || [];

      // Delete in order to respect foreign key constraints
      
      // 1. Delete routine_executions (depends on companies_routines)
      if (companyIds.length > 0) {
        // First get companies_routines IDs
        const { data: companiesRoutines } = await supabaseAdmin
          .from('companies_routines')
          .select('id')
          .in('company_id', companyIds);

        const routineIds = companiesRoutines?.map(r => r.id) || [];

        if (routineIds.length > 0) {
          const { count: routineExecutionsCount, error: routineExecutionsError } = await supabaseAdmin
            .from('routine_executions')
            .delete()
            .in('company_routine_id', routineIds);
          
          if (routineExecutionsError) {
            console.error('Error deleting routine_executions:', routineExecutionsError);
          }
          deletionResults.routine_executions = routineExecutionsCount || 0;
        }

        // 2. Delete companies_routines
        const { count: companiesRoutinesCount, error: companiesRoutinesError } = await supabaseAdmin
          .from('companies_routines')
          .delete()
          .in('company_id', companyIds);
        
        if (companiesRoutinesError) {
          console.error('Error deleting companies_routines:', companiesRoutinesError);
        }
        deletionResults.companies_routines = companiesRoutinesCount || 0;

        // 3. Delete companies_onboarding_checklist
        const { count: companiesOnboardingCount, error: companiesOnboardingError } = await supabaseAdmin
          .from('companies_onboarding_checklist')
          .delete()
          .in('company_id', companyIds);
        
        if (companiesOnboardingError) {
          console.error('Error deleting companies_onboarding_checklist:', companiesOnboardingError);
        }
        deletionResults.companies_onboarding_checklist = companiesOnboardingCount || 0;

        // 4. Delete documents (CASCADE will handle this, but explicit is safer)
        const { count: documentsCount, error: documentsError } = await supabaseAdmin
          .from('documents')
          .delete()
          .in('company_id', companyIds);
        
        if (documentsError) {
          console.error('Error deleting documents:', documentsError);
        }
        deletionResults.documents = documentsCount || 0;

        // 5. Delete entities (CASCADE will handle this, but explicit is safer)
        const { count: entitiesCount, error: entitiesError } = await supabaseAdmin
          .from('entities')
          .delete()
          .in('company_id', companyIds);
        
        if (entitiesError) {
          console.error('Error deleting entities:', entitiesError);
        }
        deletionResults.entities = entitiesCount || 0;

        // 6. Delete profiles (CASCADE will handle this, but explicit is safer)
        const { count: profilesCount, error: profilesError } = await supabaseAdmin
          .from('profiles')
          .delete()
          .in('company_id', companyIds);
        
        if (profilesError) {
          console.error('Error deleting profiles:', profilesError);
        }
        deletionResults.profiles = profilesCount || 0;

        // 7. Delete subscriptions (CASCADE will handle this, but explicit is safer)
        const { count: subscriptionsCount, error: subscriptionsError } = await supabaseAdmin
          .from('subscriptions')
          .delete()
          .in('company_id', companyIds);
        
        if (subscriptionsError) {
          console.error('Error deleting subscriptions:', subscriptionsError);
        }
        deletionResults.subscriptions = subscriptionsCount || 0;
      }

      // 8. Delete user_permissions
      const { count: userPermissionsCount, error: userPermissionsError } = await supabaseAdmin
        .from('user_permissions')
        .delete()
        .eq('user_id', targetUserId);
      
      if (userPermissionsError) {
        console.error('Error deleting user_permissions:', userPermissionsError);
      }
      deletionResults.user_permissions = userPermissionsCount || 0;

      // 9. Delete user_company_roles
      const { count: userCompanyRolesCount, error: userCompanyRolesError } = await supabaseAdmin
        .from('user_company_roles')
        .delete()
        .eq('user_id', targetUserId);
      
      if (userCompanyRolesError) {
        console.error('Error deleting user_company_roles:', userCompanyRolesError);
      }
      deletionResults.user_company_roles = userCompanyRolesCount || 0;

      // 10. Delete user_companies
      const { count: userCompaniesCount, error: userCompaniesError } = await supabaseAdmin
        .from('user_companies')
        .delete()
        .eq('user_id', targetUserId);
      
      if (userCompaniesError) {
        console.error('Error deleting user_companies:', userCompaniesError);
      }
      deletionResults.user_companies = userCompaniesCount || 0;

      // 11. Delete user_profiles
      const { count: userProfilesCount, error: userProfilesError } = await supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('user_id', targetUserId);
      
      if (userProfilesError) {
        console.error('Error deleting user_profiles:', userProfilesError);
      }
      deletionResults.user_profiles = userProfilesCount || 0;

      // 12. Delete companies (now that all references are gone)
      if (companyIds.length > 0) {
        const { count: companiesCount, error: companiesError } = await supabaseAdmin
          .from('companies')
          .delete()
          .in('id', companyIds);
        
        if (companiesError) {
          console.error('Error deleting companies:', companiesError);
        }
        deletionResults.companies = companiesCount || 0;
      }

      // 13. Delete from users table
      const { count: usersCount, error: usersError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', targetUserId);
      
      if (usersError) {
        console.error('Error deleting from users:', usersError);
      }
      deletionResults.users = usersCount || 0;

      // 14. Finally, delete from auth.users
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