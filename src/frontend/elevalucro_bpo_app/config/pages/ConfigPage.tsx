'use client';

import React, { useState, useMemo } from 'react';
import { ConfigTable } from '../components/ConfigTable';
import { 
  useFinancialCategories, 
  useDREGroups, 
  useFinancialAccounts 
} from '../hooks/useFinancialConfig';
import { 
  FinancialCategory, 
  DREGroup, 
  FinancialAccount,
  ConfigTabType
} from '../types/config';
import { useAuth } from '../../auth/contexts/AuthContext';

export const ConfigPage: React.FC = () => {
  const { companyId, user, loading: authLoading, isAuthenticated } = useAuth();
  const companyName = user?.user_metadata?.company_name || user?.user_metadata?.full_name || 'Sua Empresa';
  // Estados
  const [activeTab, setActiveTab] = useState<ConfigTabType>('categories');
  const [searchValue, setSearchValue] = useState('');

  // Hooks para dados (só executam se tiver companyId)
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    fetchCategories
  } = useFinancialCategories(companyId || '');

  const {
    groups,
    loading: groupsLoading,
    error: groupsError,
    fetchGroups
  } = useDREGroups(companyId || '');

  const {
    accounts,
    loading: accountsLoading,
    error: accountsError,
    fetchAccounts
  } = useFinancialAccounts(companyId || '');

  // Dados filtrados baseados na busca
  const filteredData = useMemo(() => {
    const searchLower = searchValue.toLowerCase();
    
    switch (activeTab) {
      case 'categories':
        return categories.filter(cat => 
          cat.description.toLowerCase().includes(searchLower) ||
          cat.dre_group_name?.toLowerCase().includes(searchLower)
        );
      
      case 'groups':
        return groups.filter(group => 
          group.description.toLowerCase().includes(searchLower)
        );
      
      case 'accounts':
        return accounts.filter(account => 
          account.description.toLowerCase().includes(searchLower)
        );
      
      default:
        return [];
    }
  }, [activeTab, searchValue, categories, groups, accounts]);

  // Enriquecer categorias com nome do grupo
  const enrichedCategories = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      dre_group_name: groups.find(g => g.id === cat.dre_groups_id)?.description
    }));
  }, [categories, groups]);

  // Handlers
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as ConfigTabType);
    setSearchValue('');
  };

  const handleRefresh = () => {
    switch (activeTab) {
      case 'categories':
        fetchCategories();
        break;
      case 'groups':
        fetchGroups();
        break;
      case 'accounts':
        fetchAccounts();
        break;
    }
  };

  // Obter dados, loading e error atuais
  const getCurrentData = () => {
    switch (activeTab) {
      case 'categories':
        return {
          data: enrichedCategories,
          loading: categoriesLoading,
          error: categoriesError
        };
      case 'groups':
        return {
          data: groups,
          loading: groupsLoading,
          error: groupsError
        };
      case 'accounts':
        return {
          data: accounts,
          loading: accountsLoading,
          error: accountsError
        };
      default:
        return {
          data: [],
          loading: false,
          error: null
        };
    }
  };

  const currentState = getCurrentData();

  // Loading de autenticação
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Usuário não autenticado
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">
          Você precisa estar logado para visualizar as configurações.
        </p>
      </div>
    );
  }

  // Company ID não encontrado
  if (!companyId) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">
          Empresa não encontrada. Verifique se você tem permissão para acessar as configurações.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Configurações Financeiras
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Visualize as configurações financeiras de {companyName}
            </p>
          </div>
        </div>
      </div>

      {/* Erro */}
      {currentState.error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{currentState.error}</p>
        </div>
      )}

      {/* Tabela com Tabs */}
      <ConfigTable
        type={activeTab}
        data={currentState.data}
        loading={currentState.loading}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onRefresh={handleRefresh}
      />
    </div>
  );
};