# ElevaLucro BPO Product Overview

ElevaLucro BPO is a comprehensive financial management BPO system with multi-tenant architecture supporting both client-facing applications and internal tools.

## Core Features

- **Multi-tenant Architecture**: Separate subdomains for clients (`app.`) and internal tools (`tools.`)
- **Pre-onboarding Forms**: Three plan tiers (Controle, Gerencial, Avançado) with customized onboarding flows
- **Financial Management**: Dashboards, approvals, document management, and ERP integrations
- **CRM & Customer Success**: Internal tools for prospect management, customer success tracking, and employee management
- **Payment Integration**: Asaas payment gateway with automated subscription management
- **Document Automation**: D4Sign integration for automated contract generation

## User Types

- **Clients** (`client_side`): Access financial dashboards, documents, approvals via `app.` subdomain
- **BPO Operators** (`bpo_side`): Manage prospects, customer success, onboarding via `tools.` subdomain

## Architecture

- **Frontend**: Next.js 14 with App Router, feature-first organization
- **Backend**: Supabase with Edge Functions, PostgreSQL database
- **Authentication**: Supabase Auth with role-based access control
- **Styling**: Tailwind CSS with shadcn/ui components, dark mode support