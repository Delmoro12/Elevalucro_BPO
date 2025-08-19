import { ENV_CONFIG } from '../common/env'

export const SUPABASE_CONFIG = {
  // Configurações do Supabase (serão preenchidas quando você fornecer)
  URL: ENV_CONFIG.SUPABASE.URL,
  ANON_KEY: ENV_CONFIG.SUPABASE.ANON_KEY,
  SERVICE_ROLE_KEY: ENV_CONFIG.SUPABASE.SERVICE_ROLE_KEY,
  
  // Configurações de tabelas
  TABLES: {
    USERS: 'users',
    COMPANIES: 'companies',
    CONTRACTS: 'contracts',
    PAYMENTS: 'payments',
    PRE_CONTRACTS: 'pre_contracts'
  },
  
  // Configurações de storage
  STORAGE: {
    DOCUMENTS: 'documents',
    AVATARS: 'avatars'
  }
}

export default SUPABASE_CONFIG