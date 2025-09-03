# Project Structure & Organization

## Root Structure

```
├── app/                    # Next.js App Router pages
├── src/frontend/           # Feature-first frontend organization
├── src/lib/               # Shared utilities and configurations
├── supabase/              # Database schemas, functions, migrations
├── scripts/               # Database and utility scripts
└── public/                # Static assets
```

## App Router Organization

The `app/` directory uses Next.js 13+ App Router with route groups:

- `(elevalucro_bpo_app)/` - Client-facing application routes
- `(internal_tools)/` - Internal BPO operator tools
- `(onboarding)/` - Onboarding flow pages
- `(pre_onboarding)/` - Pre-onboarding form pages
- `(sales_pages)/` - Landing pages for different segments

## Frontend Architecture (Feature-First)

Located in `src/frontend/`, organized by application domain:

```
src/frontend/
├── elevalucro_bpo_app/     # Client application features
├── internal_tools/         # BPO operator tools
├── onboarding/            # Onboarding flows
├── pre_onboard_forms/     # Pre-onboarding forms
├── sales_pages/           # Marketing landing pages
└── styles/                # Global CSS
```

## Feature Structure Pattern

Each feature follows a consistent structure:

```
feature_name/
├── components/            # React components
├── hooks/                # Custom React hooks
├── pages/                # Page components
├── services/             # API calls and business logic
├── types/                # TypeScript type definitions
└── utils/                # Feature-specific utilities
```

## Shared Code Organization

- `src/lib/` - Shared utilities (auth, supabase client, utils)
- `shared/` folders within each app - Reusable components and hooks
- `index.ts` files for clean imports

## Database Structure

```
supabase/
├── database/
│   ├── schemas/          # Table definitions
│   ├── procedures/       # Stored procedures
│   ├── functions/        # Database functions
│   ├── views/           # Database views
│   └── seeds/           # Initial data
├── functions/           # Edge Functions
└── migrations/          # Database migrations
```

## Routing Conventions

- **Subdomain-based routing**: Handled by middleware.ts
  - `app.domain.com` → Client application
  - `tools.domain.com` → Internal tools
  - `domain.com` → Marketing pages
- **Route groups** in App Router for logical organization
- **Dynamic routes** use `[id]` folder naming

## Import Conventions

- Use `@/` alias for root-level imports
- Prefer index.ts files for clean feature exports
- Import shared components from feature's shared folder
- Use relative imports within the same feature

## Component Naming

- **Pages**: `FeaturePage.tsx` (e.g., `DashboardPage.tsx`)
- **Components**: PascalCase descriptive names
- **Hooks**: `useFeatureName.ts` pattern
- **Services**: `feature.api.ts` or `featureService.ts`

## File Organization Rules

- Keep related files close together (feature-first)
- Use consistent folder structure across features
- Separate concerns: components, hooks, services, types
- Group by feature, not by file type