-- Seed data for roles table
-- IDs fixos para garantir consistência

INSERT INTO roles (id, name, description)
VALUES 
  (
    '1619d85e-ba76-44e4-aabe-ac804df89b8f',
    'client_side',
    'Cliente - Usuário do lado cliente com acesso às funcionalidades básicas'
  ),
  (
    'a3ac4409-99ab-4b01-936b-d3ef18be0a3f',
    'bpo_side',
    'Operador BPO - Usuário interno da ElevaLucro com acesso operacional'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;