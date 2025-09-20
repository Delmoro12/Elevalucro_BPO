'use client';

import React, { useState } from 'react';
import { Users, AlertTriangle, CheckCircle, Clock, LayoutGrid, Table, MessageCircle } from 'lucide-react';
import { useCustomerSuccess } from '../hooks/useCustomerSuccess';
import { ClientsFilters } from '../components/ClientsFilters';
import { TicketsFilters } from '../components/TicketsFilters';
import { SupportChatPage } from './SupportChatPage';

export const CustomerSuccessListPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'overview' | 'clients' | 'tickets' | 'support'>('overview');

  // Configurações dinâmicas do cabeçalho
  const getHeaderConfig = () => {
    switch (viewMode) {
      case 'overview':
        return {
          title: 'Sucesso do Cliente',
          subtitle: 'Monitore a saúde dos clientes e gerencie tickets de suporte',
          icon: CheckCircle
        };
      case 'clients':
        return {
          title: 'Clientes',
          subtitle: 'Gerencie e monitore a saúde dos seus clientes',
          icon: Users
        };
      case 'tickets':
        return {
          title: 'Tickets de Suporte',
          subtitle: 'Acompanhe e resolva tickets de suporte dos clientes',
          icon: AlertTriangle
        };
      case 'support':
        return {
          title: 'Atendimento',
          subtitle: 'Chat integrado para atendimento aos clientes',
          icon: MessageCircle
        };
      default:
        return {
          title: 'Sucesso do Cliente',
          subtitle: 'Monitore a saúde dos clientes e gerencie tickets de suporte',
          icon: CheckCircle
        };
    }
  };

  const headerConfig = getHeaderConfig();
  const HeaderIcon = headerConfig.icon;
  
  const {
    clients,
    clientsLoading,
    clientsError,
    clientsFilters,
    updateClientsFilters,
    refreshClients,
    tickets,
    ticketsLoading,
    ticketsError,
    ticketsFilters,
    updateTicketsFilters,
    refreshTickets,
    updateClientHealthStatus,
    updateTicketStatus,
    deleteTicketById,
  } = useCustomerSuccess();

  // Calcular estatísticas dos clientes
  const clientStats = React.useMemo(() => {
    const total = clients.length;
    const healthy = clients.filter(c => c.health_status === 'healthy').length;
    const atRisk = clients.filter(c => c.health_status === 'at_risk').length;
    const critical = clients.filter(c => c.health_status === 'critical').length;
    const totalRevenue = clients.filter(c => c.status === 'ativo').reduce((sum, c) => sum + c.valor_mensal, 0);
    
    return { total, healthy, atRisk, critical, totalRevenue };
  }, [clients]);

  // Calcular estatísticas dos tickets
  const ticketStats = React.useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    const urgent = tickets.filter(t => t.prioridade === 'urgent').length;
    
    return { total, open, inProgress, resolved, urgent };
  }, [tickets]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Estatísticas dos Clientes */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          Saúde dos Clientes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{clientStats.total}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total de Clientes</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{clientStats.healthy}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Saudáveis</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{clientStats.atRisk}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Em Risco</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{clientStats.critical}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Críticos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              R$ {clientStats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Receita Mensal</div>
          </div>
        </div>
      </div>

      {/* Estatísticas dos Tickets */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          Tickets de Suporte
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{ticketStats.total}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total de Tickets</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{ticketStats.open}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Abertos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{ticketStats.inProgress}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Em Progresso</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{ticketStats.resolved}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Resolvidos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{ticketStats.urgent}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Urgentes</div>
          </div>
        </div>
      </div>

      {/* Lista de Clientes em Risco */}
      {clientStats.atRisk > 0 || clientStats.critical > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            Clientes que Precisam de Atenção
          </h3>
          
          <div className="space-y-3">
            {clients
              .filter(c => c.health_status === 'critical' || c.health_status === 'at_risk')
              .slice(0, 5)
              .map((client) => (
                <div 
                  key={client.id} 
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      client.health_status === 'critical' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {client.nome_empresa}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {client.nome_contato} • R$ {client.valor_mensal.toLocaleString()}/mês
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {client.ultimo_login ? 
                      `Último acesso: ${new Date(client.ultimo_login).toLocaleDateString('pt-BR')}` :
                      'Nunca acessou'
                    }
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );

  const renderClients = () => (
    <div className="space-y-4">
      <ClientsFilters
        filters={clientsFilters}
        onFiltersChange={updateClientsFilters}
        onRefresh={refreshClients}
      />
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          Lista de Clientes
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Tabela de clientes em desenvolvimento
        </p>
      </div>
    </div>
  );

  const renderTickets = () => (
    <div className="space-y-4">
      <TicketsFilters
        filters={ticketsFilters}
        onFiltersChange={updateTicketsFilters}
        onRefresh={refreshTickets}
      />
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          Lista de Tickets
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Tabela de tickets em desenvolvimento
        </p>
      </div>
    </div>
  );


  const renderSupport = () => (
    <SupportChatPage />
  );

  if (clientsLoading || ticketsLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col flex-1">
        <div className="p-8 text-center flex-1 flex flex-col justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
            <HeaderIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            {headerConfig.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {headerConfig.subtitle}
          </p>
        </div>

        {/* Toggle de visualização */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('overview')}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${viewMode === 'overview' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            <LayoutGrid className="h-4 w-4" />
            Visão Geral
          </button>
          <button
            onClick={() => setViewMode('clients')}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${viewMode === 'clients' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            <Users className="h-4 w-4" />
            Clientes
          </button>
          <button
            onClick={() => setViewMode('tickets')}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${viewMode === 'tickets' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            <AlertTriangle className="h-4 w-4" />
            Tickets
          </button>
          <button
            onClick={() => setViewMode('support')}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${viewMode === 'support' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            <MessageCircle className="h-4 w-4" />
            Atendimento
          </button>
        </div>
      </div>

      {/* Erro */}
      {(clientsError || ticketsError) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Erro ao carregar dados
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {clientsError || ticketsError}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'overview' && renderOverview()}
        {viewMode === 'clients' && renderClients()}
        {viewMode === 'tickets' && renderTickets()}
        {viewMode === 'support' && renderSupport()}
      </div>
    </div>
  );
};