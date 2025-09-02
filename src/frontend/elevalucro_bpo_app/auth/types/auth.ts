import { User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthUser extends SupabaseUser {
  user_metadata: {
    company_id?: string;
    profile_id?: string;
    role?: 'client_side' | 'bpo_side';
    subscription_plan?: 'controle' | 'gerencial' | 'avancado';
    subscription_status?: 'active' | 'cancelled' | 'suspended';
    full_name?: string;
    phone?: string;
    company_name?: string;
    jwt_hook_executed?: boolean;
    jwt_hook_version?: string;
  };
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  isAuthenticated: boolean;
  companyId: string | null;
  profileId: string | null;
  role: string | null;
  subscriptionPlan: string | null;
}

export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}