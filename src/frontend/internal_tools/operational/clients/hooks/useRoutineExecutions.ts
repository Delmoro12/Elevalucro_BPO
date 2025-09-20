import { useState, useCallback } from 'react';
import { supabase } from '../../../../../lib/supabase';

export interface ExecuteRoutineParams {
  company_routine_id: string;
  executed_at: string;
  status: 'completed' | 'partially_completed' | 'failed';
  notes?: string;
  time_spent_minutes?: number;
  attachments?: string[];
}

export interface RoutineExecution {
  id: string;
  company_routine_id: string;
  executed_at: string;
  executed_by: string | null;
  status: 'completed' | 'partially_completed' | 'failed';
  notes: string | null;
  attachments: string[] | null;
  time_spent_minutes: number | null;
  next_execution_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useRoutineExecutions = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeRoutine = useCallback(async (params: ExecuteRoutineParams): Promise<RoutineExecution | null> => {
    try {
      setIsExecuting(true);
      setError(null);

      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch('/api/routine-executions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao executar rotina');
      }

      const { execution } = await response.json();
      return execution;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao executar rotina';
      setError(errorMessage);
      console.error('Execute routine error:', err);
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const getExecutionsForPeriod = useCallback(async (
    companyRoutineId: string, 
    startDate: string, 
    endDate: string
  ): Promise<RoutineExecution[]> => {
    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('User not authenticated for fetching executions');
        return [];
      }

      const params = new URLSearchParams({
        company_routine_id: companyRoutineId,
        start_date: startDate,
        end_date: endDate
      });

      const response = await fetch(`/api/routine-executions?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        console.error('Error fetching executions:', response.statusText);
        return [];
      }

      const { executions } = await response.json();
      return executions || [];
    } catch (err) {
      console.error('Get executions error:', err);
      return [];
    }
  }, []);

  const deleteExecution = useCallback(async (executionId: string): Promise<boolean> => {
    try {
      setIsExecuting(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('routine_executions')
        .delete()
        .eq('id', executionId);

      if (deleteError) {
        console.error('Error deleting execution:', deleteError);
        throw new Error(deleteError.message);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar execução';
      setError(errorMessage);
      console.error('Delete execution error:', err);
      return false;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const updateExecution = useCallback(async (
    executionId: string, 
    updates: Partial<ExecuteRoutineParams>
  ): Promise<RoutineExecution | null> => {
    try {
      setIsExecuting(true);
      setError(null);

      const { data: execution, error: updateError } = await supabase
        .from('routine_executions')
        .update(updates)
        .eq('id', executionId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating execution:', updateError);
        throw new Error(updateError.message);
      }

      return execution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar execução';
      setError(errorMessage);
      console.error('Update execution error:', err);
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  return {
    executeRoutine,
    getExecutionsForPeriod,
    deleteExecution,
    updateExecution,
    isExecuting,
    error,
    clearError: () => setError(null)
  };
};