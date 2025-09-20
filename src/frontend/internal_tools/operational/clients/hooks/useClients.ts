import { useState, useEffect } from 'react';
import { OperationalClient, ClientFilters } from '../types/clients';
import { getOperationalClients, updateOperationalClient, deleteOperationalClient } from '../services/clients.api';

export const useClients = () => {
  const [clients, setClients] = useState<OperationalClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchClients = async (filters: ClientFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getOperationalClients(filters);
      setClients(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (clientId: string, data: any): Promise<boolean> => {
    try {
      const success = await updateOperationalClient(clientId, data);
      if (success) {
        // Atualizar lista local
        setClients(prev => prev.map(client => 
          client.id === clientId ? { ...client, ...data } : client
        ));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cliente');
      return false;
    }
  };

  const deleteClient = async (clientId: string): Promise<boolean> => {
    try {
      const success = await deleteOperationalClient(clientId);
      if (success) {
        // Remover da lista local
        setClients(prev => prev.filter(client => client.id !== clientId));
        setTotal(prev => prev - 1);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar cliente');
      return false;
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    error,
    total,
    fetchClients,
    updateClient,
    deleteClient,
  };
};