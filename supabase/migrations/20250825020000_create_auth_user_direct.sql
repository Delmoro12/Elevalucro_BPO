-- Function to create auth user directly bypassing API issues
CREATE OR REPLACE FUNCTION public.create_auth_user_direct(
  user_id uuid,
  email text,
  password text
) 
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  encrypted_pw text;
BEGIN
  -- Generate password hash (basic approach)
  encrypted_pw := crypt(password, gen_salt('bf'));
  
  -- Insert directly into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    aud,
    role
  ) VALUES (
    user_id,
    '00000000-0000-0000-0000-000000000000'::uuid,
    email,
    encrypted_pw,
    NOW(),
    NOW(),
    NOW(),
    '',
    'authenticated',
    'authenticated'
  );
  
  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_id,
    jsonb_build_object('sub', user_id::text, 'email', email),
    'email',
    user_id::text,
    NOW(),
    NOW()
  );
  
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_auth_user_direct TO service_role;