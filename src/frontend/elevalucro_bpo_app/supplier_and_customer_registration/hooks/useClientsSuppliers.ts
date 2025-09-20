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
    if (!companyId) {
      console.warn('No companyId provided to useClientsSuppliers');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await getClientsSuppliers(companyId, filters);
      if (response.success) {
        setClientsSuppliers(response.data);
        setTotal(response.total);
      } else {
        throw new Error(response.error || 'Erro ao carregar clientes/fornecedores');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes/fornecedores');
      console.error('Error fetching clients/suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNewClientSupplier = async (data: ClientSupplierFormData): Promise<ClientSupplier | null> => {
    if (!companyId) {
      setError('Company ID não encontrado');
      return null;
    }
    
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
      await deleteClientSupplier(id);
      setClientsSuppliers(prev => prev.filter(item => item.id !== id));
      setTotal(prev => prev - 1);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir cliente/fornecedor');
      return false;
    }
  };

  const getById = async (id: string): Promise<ClientSupplier | null> => {
    try {
      return await getClientSupplierById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar cliente/fornecedor');
      return null;
    }
  };

  // Função helper para filtrar por tipo
  const getByType = (type: 'client' | 'supplier') => {
    return clientsSuppliers.filter(cs => cs.type === type);
  };

  // Auto-fetch na inicialização
  useEffect(() => {
    if (companyId) {
      fetchClientsSuppliers();
    }
  }, [companyId]);

  return { 
    clientsSuppliers, 
    clients: getByType('client'),
    suppliers: getByType('supplier'),
    loading, 
    error,
    total,
    fetchClientsSuppliers,
    createClientSupplier: createNewClientSupplier,
    updateClientSupplier: updateExistingClientSupplier,
    deleteClientSupplier: deleteExistingClientSupplier,
    getClientSupplierById: getById,
    refetch: fetchClientsSuppliers
  };
};