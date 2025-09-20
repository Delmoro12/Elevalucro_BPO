'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { OperationalClient } from '../types/clients';
import { ClientDetailHeader } from '../components/ClientDetailHeader';
import { ClientDetailTabs } from '../components/ClientDetailTabs';
import { getOperationalClientById } from '../services/clients.api';

interface ClientDetailPageProps {
  companyId: string;
}

export const ClientDetailPage: React.FC<ClientDetailPageProps> = ({ companyId }) => {
  const router = useRouter();
  const [client, setClient] = useState<OperationalClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar dados reais do cliente
        const clientData = await getOperationalClientById(companyId);
        
        if (!clientData) {
          setError('Cliente não encontrado');
          return;
        }
        
        setClient(clientData);
      } catch (err) {
        setError('Erro ao carregar dados do cliente');
        console.error('Error fetching client:', err);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchClient();
    }
  }, [companyId]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={handleBack}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex-1">
              <div className="animate-pulse">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={handleBack}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Erro
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {error || 'Cliente não encontrado'}
              </p>
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="text-red-800 dark:text-red-200">
              <strong>Erro:</strong> {error || 'Cliente não encontrado'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Tabs com as diferentes seções (inclui header dinâmico com botão voltar) */}
      <ClientDetailTabs client={client} />
    </div>
  );
};