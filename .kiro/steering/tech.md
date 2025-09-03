# Technology Stack

## Core Technologies

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode enabled
- **Database**: Supabase (PostgreSQL) with Edge Functions
- **Authentication**: Supabase Auth with JWT tokens
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React hooks and context patterns
- **HTTP Client**: Axios for API calls
- **Validation**: Zod for schema validation
- **Date Handling**: Day.js for date manipulation

## UI Components & Libraries

- **Component Library**: Radix UI primitives with shadcn/ui
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit for kanban boards
- **Styling Utilities**: 
  - `clsx` and `tailwind-merge` for conditional classes
  - `class-variance-authority` for component variants
- **Animations**: tailwindcss-animate plugin

## AI & External Integrations

- **AI Services**: Anthropic Claude SDK, OpenAI SDK
- **Payment Gateway**: Asaas integration
- **Document Signing**: D4Sign integration

## Development Tools

- **Linting**: ESLint with Next.js config
- **CSS Processing**: PostCSS with Autoprefixer
- **Build Tool**: Next.js built-in bundler

## Common Commands

```bash
# Development
npm run dev              # Start dev server on port 4000
npm run dev:prod         # Dev with production env
npm run dev:local        # Dev with local env backup

# Production
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Dependencies
npm install              # Install all dependencies
```

## Environment Configuration

- `.env.local` - Local development
- `.env.production` - Production settings
- `.env.example` - Template for required variables

## Port Configuration

- Development server runs on port 4000 (not default 3000)
- Configured in package.json scripts