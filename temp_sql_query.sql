-- Query para listar todas as procedures/functions no banco
SELECT 
    routine_name,
    routine_type,
    specific_name
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_catalog = current_database()
    AND routine_name NOT LIKE 'pg_%'
ORDER BY routine_name;