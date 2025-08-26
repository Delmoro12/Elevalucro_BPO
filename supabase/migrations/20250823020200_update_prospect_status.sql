-- Update prospect status to 'signed' for testing
UPDATE prospects 
SET status = 'signed', updated_at = NOW()
WHERE email_contato = 'delmoro123@gmail.com';

-- Show updated prospect
SELECT id, nome_contato, email_contato, nome_empresa, status, updated_at 
FROM prospects 
WHERE email_contato = 'delmoro123@gmail.com';