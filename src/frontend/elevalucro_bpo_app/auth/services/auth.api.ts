import { supabase } from '../../../lib/supabase';

// API de autenticação
export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
}

export async function signOut() {
  try {
    console.log('🔓 Fazendo logout...');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
    
    console.log('✅ Logout realizado com sucesso');
    
    // Redirecionar para a página de login
    window.location.href = '/auth/login';
    
    return { success: true };
  } catch (error) {
    console.error('Erro inesperado no logout:', error);
    throw error;
  }
}