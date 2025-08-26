import { useState, useCallback } from 'react';
import { ProspectEditData, ProspectUpdatePayload } from '../types/prospects';
import { getProspectById, updateProspect } from '../services/prospects.api';

export interface UseProspectEditReturn {
  isOpen: boolean;
  prospectData: ProspectEditData | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  openModal: (prospectId: string) => Promise<void>;
  closeModal: () => void;
  saveProspect: (data: ProspectUpdatePayload) => Promise<boolean>;
}

export function useProspectEdit(): UseProspectEditReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [prospectData, setProspectData] = useState<ProspectEditData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = useCallback(async (prospectId: string) => {
    setIsOpen(true);
    setLoading(true);
    setError(null);
    
    try {
      const data = await getProspectById(prospectId);
      setProspectData(data);
    } catch (err) {
      console.error('Erro ao carregar prospect:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setProspectData(null);
    setError(null);
  }, []);

  const saveProspect = useCallback(async (data: ProspectUpdatePayload): Promise<boolean> => {
    if (!prospectData) {
      console.error('❌ useProspectEdit: Nenhum prospect data disponível');
      return false;
    }

    console.log('🔄 useProspectEdit: Iniciando salvamento...', { prospectId: prospectData.id, data });
    setSaving(true);
    setError(null);

    try {
      const success = await updateProspect(prospectData.id, data);
      
      if (success) {
        console.log('✅ useProspectEdit: Prospect salvo com sucesso');
        // Atualiza os dados locais com as mudanças
        setProspectData(prev => prev ? { ...prev, ...data } : null);
        return true;
      } else {
        console.error('❌ useProspectEdit: Falha ao salvar prospect');
        setError('Falha ao salvar as alterações');
        return false;
      }
    } catch (err) {
      console.error('❌ useProspectEdit: Erro ao salvar prospect:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
      return false;
    } finally {
      setSaving(false);
    }
  }, [prospectData]);

  return {
    isOpen,
    prospectData,
    loading,
    saving,
    error,
    openModal,
    closeModal,
    saveProspect,
  };
}