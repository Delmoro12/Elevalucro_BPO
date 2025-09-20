import { useState, useEffect } from 'react';

export interface ClientSupplier {
  id: string;
  company_id: string;
  name: string;
  type: 'client' | 'supplier' | 'both';
  cpf?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export const useClientsSuppliers = (companyId?: string) => {
  const [clientsSuppliers, setClientsSuppliers] = useState<ClientSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientsSuppliers = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/elevalucro-bpo-app/clients-suppliers?company_id=${companyId}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Erro ao buscar clientes/fornecedores');
        }
        
        setClientsSuppliers(data.data || []);
      } catch (err) {
        console.error('Erro ao buscar clientes/fornecedores:', err);
        setError('Erro ao buscar clientes/fornecedores');
      } finally {
        setLoading(false);
      }
    };

    fetchClientsSuppliers();
  }, [companyId]);

  // Função helper para filtrar por tipo
  const getByType = (type: 'client' | 'supplier') => {
    if (type === 'client') {
      return clientsSuppliers.filter(cs => cs.type === 'client' || cs.type === 'both');
    } else {
      return clientsSuppliers.filter(cs => cs.type === 'supplier' || cs.type === 'both');
    }
  };

  return { 
    clientsSuppliers, 
    clients: getByType('client'),
    suppliers: getByType('supplier'),
    loading, 
    error 
  };
};