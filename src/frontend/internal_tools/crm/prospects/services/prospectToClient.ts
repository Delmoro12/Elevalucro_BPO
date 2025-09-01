/**
 * Service para gerenciar prospects e automatizar o processo de signup
 */

export class ProspectService {
  private supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  private serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  /**
   * Chama a edge function de signup quando prospect é marcado como 'signed'
   */
  async triggerAutoSignup(prospectId: string): Promise<{ success: boolean; message?: string; error?: string; resetLink?: string }> {
    console.log('🎯 ProspectService: Iniciando auto signup para prospect:', prospectId);
    
    if (!this.supabaseUrl) {
      console.error('❌ SUPABASE_URL não configurada');
      return { success: false, error: 'Configuração inválida' };
    }
    
    try {
      const edgeFunctionUrl = `${this.supabaseUrl}/functions/v1/client-signup`;
      
      console.log('📤 Chamando edge function:', edgeFunctionUrl);
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prospect_id: prospectId })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Erro na edge function:', result);
        return { 
          success: false, 
          error: result.error || 'Erro ao processar signup automático' 
        };
      }
      
      console.log('✅ Auto signup executado com sucesso:', result);
      
      // In development, log the reset link for manual access
      if (result.data?.reset_link) {
        console.log('🔗 ==============================================');
        console.log('🔗 LINK DE PRIMEIRO ACESSO (copie e envie ao cliente):');
        console.log('🔗', result.data.reset_link);
        console.log('🔗 ==============================================');
      }
      
      return { 
        success: true, 
        message: result.message || 'Cliente criado com sucesso',
        resetLink: result.data?.reset_link 
      };
      
    } catch (error) {
      console.error('❌ Erro ao chamar edge function:', error);
      return { 
        success: false, 
        error: 'Erro de comunicação com o servidor' 
      };
    }
  }
}

export const prospectService = new ProspectService();