'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';
import { AuthUser, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to decode JWT token
const decodeJWT = (token: string): any => {
  try {
    let payload = token.split('.')[1];
    
    // Adicionar padding se necessário para base64
    const padding = payload.length % 4;
    if (padding) {
      payload += '='.repeat(4 - padding);
    }
    
    // Substituir caracteres URL-safe para base64 padrão
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [jwtClaims, setJwtClaims] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      // First, check if there are auth tokens in the URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        // If there's an access token in the URL, let Supabase handle it
        const { data, error } = await supabase.auth.getSession();
        if (!error && data.session) {
          console.log('Session restored from URL token');
        }
      }
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      } else if (session?.user) {
        setUser(session.user as AuthUser);
        
        // Decode JWT to get custom claims
        if (session.access_token) {
          const decoded = decodeJWT(session.access_token);
          if (decoded) {
            setJwtClaims(decoded.user_metadata || {});
            console.log('🔓 JWT claims extracted:', decoded.user_metadata);
          }
          
          // Set cookie for middleware
          document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax`;
          console.log('🍪 Auth context: Cookie set for existing session');
        }
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user as AuthUser);
          
          // Decode JWT to get custom claims on auth state changes
          if (session.access_token) {
            const decoded = decodeJWT(session.access_token);
            if (decoded) {
              setJwtClaims(decoded.user_metadata || {});
              console.log('🔓 JWT claims updated on auth change:', decoded.user_metadata);
            }
            
            // Set cookie for middleware
            document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax`;
            console.log('🍪 Auth state change: Cookie set for session');
          }
        } else {
          setUser(null);
          setJwtClaims(null);
          
          // Clear cookie on logout
          document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax';
          console.log('🍪 Auth state change: Cookie cleared on logout');
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    try {
      setLoading(true);
      
      // Always use app subdomain for password reset
      let redirectUrl = 'https://app.elevalucro.com.br/auth/reset-password';
      
      // Check if we're in local development
      if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
        redirectUrl = 'http://app.localhost:4000/auth/reset-password';
      }
      
      console.log('Password reset redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        console.error('Error sending password reset email:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Helper computed properties
  const isAuthenticated = !!user;
  // Get companyId from JWT claims (from custom JWT hook) instead of user_metadata
  const companyId = jwtClaims?.company_id || user?.user_metadata?.company_id || null;
  const profileId = jwtClaims?.profile_id || user?.user_metadata?.profile_id || null;
  const role = jwtClaims?.role || user?.user_metadata?.role || null;
  const subscriptionPlan = jwtClaims?.subscription_plan || user?.user_metadata?.subscription_plan || null;

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    resetPasswordForEmail,
    isAuthenticated,
    companyId,
    profileId,
    role,
    subscriptionPlan
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};