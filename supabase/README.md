# Supabase Project Structure

## Organization

```
supabase/
├── config.toml                 # Supabase configuration
├── database/                   # Pure database structure definitions
│   ├── schemas/               # Table definitions (001-009 numbered)
│   ├── rls/                   # Row Level Security policies
│   ├── views/                 # Database views
│   └── seeds/                 # Seed data
├── functions/                  # SQL functions (procedures, JWT hooks)
├── migrations/                 # Database migrations (for Supabase CLI)
└── edge-functions/            # Edge Functions TypeScript (deploy ready)
    ├── client-signup.ts       # Client registration edge function
    ├── README.md              # Edge functions documentation
    └── [function-name].ts     # Other edge functions

```

## Workflow

### 1. Database Changes
- Edit files in `database/` folders (schemas, functions, etc.)
- Run build script to generate migration
- Test locally with `npx supabase db reset`
- Deploy to production with `npx supabase db push`

### 2. Edge Functions
- Edit TypeScript files in `src/edge_functions/`
- Copy to `functions/` for deployment
- Deploy with `npx supabase functions deploy [function-name]`

## Important Notes

- **Never edit migrations directly** - they are generated from `database/` files
- **Keep `functions/` folder** - required for Supabase edge function deployment
- **`database/` is source of truth** - all SQL code lives here organized by type