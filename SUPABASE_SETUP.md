# Setup Seguro do Supabase Local - ElevaLucro BPO

## ⚠️ AVISO IMPORTANTE
**NUNCA execute `supabase db reset` sem backup ou permissão expressa!**
Este comando APAGA TODOS OS DADOS do banco local.

## Estrutura do Projeto

### Configuração Principal
- **config.toml**: Configurações do Supabase local
  - Porta API: 54321
  - Porta DB: 54322
  - Porta Studio: 54323
  - Auth hook JWT customizado habilitado
  - Seed automático habilitado

### Organização dos Arquivos SQL

```
supabase/
├── database/
│   ├── schemas/        # Estrutura das tabelas
│   ├── procedures/     # Stored procedures e functions
│   ├── views/          # Views para dashboards
│   ├── seeds/          # Dados iniciais
│   └── storages/       # Configuração de buckets
├── migrations/         # Migrations aplicadas
├── functions/          # Edge functions
└── seed.sql           # Seed principal (roles básicos)
```

## Processo Seguro de Inicialização

### 1. Verificar Status do Docker
```bash
# Verificar se o Supabase está rodando
supabase status

# Se não estiver rodando, iniciar
supabase start
```

### 2. Aplicar Schemas (SEM resetar)
```bash
# Aplicar schemas individualmente na ordem correta
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f supabase/database/schemas/001_companies.sql
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f supabase/database/schemas/002_users.sql
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f supabase/database/schemas/003_roles.sql
# ... continuar com os outros schemas em ordem numérica
```

### 3. Aplicar Procedures
```bash
# Aplicar procedures na ordem
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f supabase/database/procedures/001_create_client_signup.sql
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f supabase/database/procedures/002_jwt_access_token_hook.sql
# ... continuar com as outras procedures
```

### 4. Aplicar Views
```bash
# Aplicar views
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f supabase/database/views/003_companies_routines_summary.sql
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f supabase/database/views/004_company_routines_details.sql
# ... continuar com as outras views
```

### 5. Aplicar Seeds (se necessário)
```bash
# Seeds básicos
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f supabase/seed.sql
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f supabase/database/seeds/onboarding_checklist_seed.sql
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f supabase/database/seeds/routines_seed.sql
```

## Backup e Restore

### Fazer Backup
```bash
# Backup completo do banco
pg_dump -h 127.0.0.1 -p 54322 -U postgres -d postgres > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar Backup
```bash
# Restaurar de um backup
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres < backup_arquivo.sql
```

## Comandos Úteis e Seguros

### Verificar estrutura
```bash
# Ver todas as tabelas
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "\dt"

# Ver estrutura de uma tabela
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "\d nome_da_tabela"

# Contar registros
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "SELECT COUNT(*) FROM nome_da_tabela"
```

### Monitorar logs
```bash
# Ver logs do Supabase
supabase logs

# Ver logs de uma função específica
supabase functions logs nome_da_funcao
```

## ❌ NUNCA FAZER

1. **NUNCA** executar `supabase db reset` sem backup
2. **NUNCA** executar `supabase stop` durante operações críticas
3. **NUNCA** executar `DROP DATABASE` ou `DROP TABLE` em produção
4. **NUNCA** executar `TRUNCATE` sem WHERE clause
5. **NUNCA** commitar secrets ou API keys no código

## 📝 Notas Importantes

- O banco usa PostgreSQL 15
- JWT customizado via hook `custom_access_token_hook`
- Seeds são aplicados automaticamente no reset (por isso evite reset!)
- Migrations são incrementais e devem ser aplicadas em ordem
- Sempre faça backup antes de mudanças estruturais

## Em caso de problemas

1. Verificar status: `supabase status`
2. Verificar logs: `supabase logs`
3. Fazer backup imediato se possível
4. **NÃO resetar** - tentar recuperar incrementalmente
5. Consultar backup mais recente se necessário