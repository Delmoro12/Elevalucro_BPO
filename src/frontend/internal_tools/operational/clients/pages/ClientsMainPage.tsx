'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { ClientFilters, OperationalClient } from '../types/clients';
import { ClientsFilters } from '../components/ClientsFilters';
import { ClientsTableView } from '../components/ClientsTableView';
import { useClients } from '../hooks/useClients';

export const ClientsMainPage: React.FC = () => {
  const [filters, setFilters] = useState<ClientFilters>({});
  const { clients, loading, error, fetchClients } = useClients();
  const router = useRouter();

  const handleFiltersChange = (newFilters: ClientFilters) => {
    setFilters(newFilters);
    fetchClients(newFilters);
  };

  const handleRefresh = () => {
    fetchClients(filters);
  };

  const handleClientClick = (client: OperationalClient) => {
    // Navegar para a página de detalhes do cliente
    router.push(`/operational-clients/${client.company_id}`);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Building2 className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Clientes Operacionais
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestão operacional e acompanhamento de clientes
          </p>
        </div>
      </div>

      {/* Filtros */}
      <ClientsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onRefresh={handleRefresh}
      />

      {/* Erro */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="text-red-800 dark:text-red-200">
              <strong>Erro:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Clientes */}
      <ClientsTableView
        clients={clients}
        loading={loading}
        onClientClick={handleClientClick}
      />
    </div>
  );
};