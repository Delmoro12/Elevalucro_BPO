CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE CHECK (name IN ('bpo_side', 'client_side')),
  description TEXT
);

CREATE INDEX idx_roles_name ON roles(name);