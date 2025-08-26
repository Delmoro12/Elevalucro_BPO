-- Habilitando provider de email para magic links
UPDATE auth.providers
SET enabled = true
WHERE provider_id = 'email';

-- Confirmando emails existentes (se houver)
UPDATE auth.identities
SET identity_data = jsonb_set(identity_data, '{email_confirmed_at}', '"' || NOW() || '"')
WHERE provider_id = 'email' AND identity_data->>'email_confirmed_at' IS NULL;
