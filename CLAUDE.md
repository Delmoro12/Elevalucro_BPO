# Claude Code - Instruções do Projeto ElevaLucro-BPO

## ⛔ REGRAS CRÍTICAS - BANCO DE DADOS

### JAMAIS executar sem permissão expressa:
- `supabase db reset`
- `supabase stop`
- `docker stop` em containers do banco
- Qualquer comando que pare ou resete o banco de dados
- DROP DATABASE, DROP TABLE ou comandos destrutivos
- TRUNCATE em tabelas de produção


## Comandos do projeto
```bash
# Desenvolvimento
npm run dev

# Supabase
supabase start
supabase status
supabase functions serve

# Database (seguros)
supabase db diff
supabase migration new
```

## Notas importantes
- O banco de dados deve permanecer rodando durante toda a sessão
- Sempre fazer backup antes de alterações estruturais
- Confirmar explicitamente antes de qualquer ação destrutiva