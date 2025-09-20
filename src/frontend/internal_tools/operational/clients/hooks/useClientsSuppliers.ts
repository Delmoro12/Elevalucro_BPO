import { useState, useEffect } from 'react';
import { ClientSupplier, ClientSupplierFilters, ClientSupplierFormData } from '../types/clientsSuppliers';
import { 
  getClientsSuppliers, 
  createClientSupplier, 
  updateClientSupplier, 
  deleteClientSupplier,
  getClientSupplierById 
} from '../services/clientsSuppliers.api';

export const useClientsSuppliers = (companyId: string) => {
  const [clientsSuppliers, setClientsSuppliers] = useState<ClientSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchClientsSuppliers = async (filters: ClientSupplierFilters = {}) => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await getClientsSuppliers(companyId, filters);
      setClientsSuppliers(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes/fornecedores');
      console.error('Error fetching clients/suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNewClientSupplier = async (data: ClientSupplierFormData): Promise<ClientSupplier | null> => {
    if (!companyId) return null;
    
    try {
      const newClientSupplier = await createClientSupplier(companyId, data);
      setClientsSuppliers(prev => [newClientSupplier, ...prev]);
      setTotal(prev => prev + 1);
      return newClientSupplier;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar cliente/fornecedor');
      return null;
    }
  };

  const updateExistingClientSupplier = async (id: string, data: Partial<ClientSupplierFormData>): Promise<boolean> => {
    try {
      const updatedClientSupplier = await updateClientSupplier(id, data);
      setClientsSuppliers(prev => prev.map(item => 
        item.id === id ? updatedClientSupplier : item
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cliente/fornecedor');
      return false;
    }
  };

  const deleteExistingClientSupplier = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteClientSupplier(id);
      if (success) {
        setClientsSuppliers(prev => prev.filter(item => item.id !== id));
        setTotal(prev => prev - 1);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar cliente/fornecedor');
      return false;
    }
  };

  const getClientSupplier = async (id: string): Promise<ClientSupplier | null> => {
    try {
      return await getClientSupplierById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar cliente/fornecedor');
      return null;
    }
  };

  useEffect(() => {
    fetchClientsSuppliers();
  }, [companyId]);

  return {
    clientsSuppliers,
    loading,
    error,
    total,
    fetchClientsSuppliers,
    createClientSupplier: createNewClientSupplier,
    updateClientSupplier: updateExistingClientSupplier,
    deleteClientSupplier: deleteExistingClientSupplier,
    getClientSupplier,
  };
};