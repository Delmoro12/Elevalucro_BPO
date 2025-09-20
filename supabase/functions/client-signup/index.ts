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
    console.log('🚀 Client signup started');

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
    const { prospect_id } = await req.json();
    
    if (!prospect_id) {
      return new Response(JSON.stringify({ error: 'Missing prospect_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📋 Getting prospect:', prospect_id);

    // Get prospect
    const { data: prospect, error: prospectError } = await serviceClient
      .from('prospects')
      .select('*')
      .eq('id', prospect_id)
      .eq('status', 'signed')
      .single();
      
    if (prospectError || !prospect) {
      return new Response(JSON.stringify({ 
        error: 'Prospect not found or not signed',
        details: prospectError?.message 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Prospect found:', prospect.contact_email);

    // Generate temporary password
    const tempPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    console.log('👤 Creating user via official Supabase API...');
    
    // Try alternative approach using REST API directly
    console.log('🔄 Attempting user creation via REST API...');
    let authUser;
    let authError;
    
    try {
      const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: prospect.contact_email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: prospect.contact_name,
            phone: prospect.contact_phone,
            company_name: prospect.company_name
          }
        })
      });
      
      if (!authResponse.ok) {
        const errorText = await authResponse.text();
        console.error('❌ REST API Error:', errorText);
        throw new Error(`REST API failed: ${authResponse.status} - ${errorText}`);
      }
      
      authUser = { user: await authResponse.json() };
      console.log('✅ User created via REST API');
      
    } catch (restError) {
      console.log('⚠️ REST API failed, trying SDK method...', restError.message);
      
      // Fallback to SDK method
      const result = await serviceClient.auth.admin.createUser({
        email: prospect.contact_email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: prospect.contact_name,
          phone: prospect.contact_phone,
          company_name: prospect.company_name
        }
      });
      
      authUser = result.data;
      authError = result.error;
    }
    
    if (authError || !authUser?.user) {
      console.error('❌ Auth creation failed:', authError);
      return new Response(JSON.stringify({
        error: 'Failed to create user',
        details: authError?.message || 'Unknown error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = authUser.user.id;
    console.log('✅ Auth user created:', userId);

    // Create database records
    console.log('🏢 Creating company and user records...');
    const { data: dbResult, error: dbError } = await serviceClient.rpc('create_client_signup', {
      p_user_id: userId,
      p_prospect_data: prospect
    });
    
    if (dbError) {
      console.error('❌ Database creation failed:', dbError);
      // Cleanup: delete auth user
      await serviceClient.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({
        error: 'Failed to create client data',
        details: dbError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Database records created');

    // Force JWT refresh to include custom claims from database
    console.log('🔄 Triggering JWT hook to load custom claims...');
    try {
      // Update user metadata to trigger JWT hook refresh
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

    // Send welcome email via Brevo API
    console.log('📧 Sending welcome email via Brevo...');
    let inviteSent = false;
    
    try {
      // Brevo API configuration
      const brevoApiKey = Deno.env.get('BREVO_API_KEY');
      console.log('🔑 DEBUG - Brevo API Key check:', brevoApiKey ? `Found (${brevoApiKey.substring(0, 8)}...)` : 'NOT FOUND');
      console.log('🔑 DEBUG - All env vars:', Object.keys(Deno.env.toObject()));
      
      const loginUrl = supabaseUrl.includes('localhost') 
        ? 'http://app.localhost:4000/auth/login' 
        : 'https://app.elevalucro.com.br/auth/login';
      
      if (!brevoApiKey) {
        console.log('⚠️ Brevo API key not configured, skipping email');
      } else {
        const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: {
              name: 'ElevaLucro BPO',
              email: 'atendimento@elevalucro.com.br'
            },
            to: [{
              email: prospect.contact_email,
              name: prospect.contact_name
            }],
            subject: 'Bem-vindo ao ElevaLucro BPO - Acesso à Plataforma',
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">Bem-vindo ao ElevaLucro BPO!</h1>
                </div>
                
                <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; color: #374151;">Olá <strong>${prospect.contact_name}</strong>,</p>
                  
                  <p style="font-size: 16px; color: #374151;">
                    Sua conta foi criada com sucesso! Abaixo estão suas credenciais de acesso:
                  </p>
                  
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                    <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> ${prospect.contact_email}</p>
                    <p style="margin: 5px 0; color: #374151;"><strong>Senha provisória:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
                  </div>
                  
                  <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fcd34d;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      ⚠️ <strong>Importante:</strong> Por segurança, recomendamos que você altere sua senha no primeiro acesso.
                    </p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${loginUrl}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                      Acessar Plataforma
                    </a>
                  </div>
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">
                      <strong>Empresa:</strong> ${prospect.company_name}
                    </p>
                    <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">
                      <strong>Plano:</strong> ${prospect.plan.charAt(0).toUpperCase() + prospect.plan.slice(1)}
                    </p>
                  </div>
                  
                  <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                    Se você tiver alguma dúvida, nossa equipe de suporte está à disposição.
                  </p>
                  
                  <p style="font-size: 16px; color: #374151; margin-top: 20px;">
                    Atenciosamente,<br>
                    <strong>Equipe ElevaLucro BPO</strong>
                  </p>
                </div>
                
                <div style="text-align: center; padding: 20px; background: #f3f4f6;">
                  <p style="font-size: 12px; color: #6b7280; margin: 0;">
                    © 2025 ElevaLucro BPO. Todos os direitos reservados.
                  </p>
                </div>
              </div>
            `
          })
        });
        
        console.log('📤 DEBUG - Brevo API response status:', emailResponse.status);
        console.log('📤 DEBUG - Brevo API response headers:', Object.fromEntries(emailResponse.headers.entries()));
        
        if (emailResponse.ok) {
          const responseData = await emailResponse.json();
          console.log('✅ Welcome email sent via Brevo:', responseData);
          inviteSent = true;
        } else {
          const errorText = await emailResponse.text();
          console.log('⚠️ Brevo email failed - Status:', emailResponse.status, 'Response:', errorText);
        }
      }
    } catch (emailError) {
      console.log('⚠️ Email sending failed:', emailError.message);
    }

    console.log('🎉 Client signup completed successfully!');

    return new Response(JSON.stringify({
      success: true,
      message: 'Client created and invitation sent',
      data: {
        user_id: userId,
        email: prospect.contact_email,
        company: prospect.company_name,
        invitation_sent: inviteSent,
        temp_password: tempPassword // For debugging/manual access if needed
      }
    }), {
      status: 200,
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