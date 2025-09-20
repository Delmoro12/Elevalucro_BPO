-- Seed data for ElevaLucro BPO system

-- Insert roles
INSERT INTO roles (name, description) 
VALUES 
  ('bpo_side', 'Equipe interna do BPO - operadores, supervisores e administradores'),
  ('client_side', 'Clientes do BPO - empresas que contratam os serviços')
ON CONFLICT (name) DO NOTHING;

-- Show the IDs for reference
SELECT 'Roles created:' as info;
SELECT id, name, description FROM roles ORDER BY name;