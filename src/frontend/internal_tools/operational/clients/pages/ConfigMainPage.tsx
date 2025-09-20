'use client';

import React, { useState, useMemo } from 'react';
import { ConfigTable } from '../components/config/ConfigTable';
import { ConfigModalSidebar } from '../components/config/ConfigModalSidebar';
import { 
  useFinancialCategories, 
  useDREGroups, 
  useFinancialAccounts 
} from '../hooks/useFinancialConfig';
import { 
  FinancialCategory, 
  FinancialCategoryFormData,
  DREGroup, 
  DREGroupFormData,
  FinancialAccount,
  FinancialAccountFormData,
  ConfigTabType
} from '../types/config';

interface ConfigMainPageProps {
  companyId: string;
  companyName: string;
}

export const ConfigMainPage: React.FC<ConfigMainPageProps> = ({
  companyId,
  companyName,
}) => {
  // Estados
  const [activeTab, setActiveTab] = useState<ConfigTabType>('categories');
  const [searchValue, setSearchValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FinancialCategory | DREGroup | FinancialAccount | null>(null);

  // Hooks para dados
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  } = useFinancialCategories(companyId);

  const {
    groups,
    loading: groupsLoading,
    error: groupsError,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup
  } = useDREGroups(companyId);

  const {
    accounts,
    loading: accountsLoading,
    error: accountsError,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount
  } = useFinancialAccounts(companyId);

  // Dados filtrados baseados na busca
  const filteredData = useMemo(() => {
    const searchLower = searchValue.toLowerCase();
    
    switch (activeTab) {
      case 'categories':
        return (categories || []).filter(cat => 
          cat.description.toLowerCase().includes(searchLower) ||
          cat.dre_group_name?.toLowerCase().includes(searchLower)
        );
      
      case 'groups':
        return (groups || []).filter(group => 
          group.description.toLowerCase().includes(searchLower)
        );
      
      case 'accounts':
        return (accounts || []).filter(account => 
          account.description.toLowerCase().includes(searchLower)
        );
      
      default:
        return [];
    }
  }, [activeTab, searchValue, categories, groups, accounts]);

  // Enriquecer categorias com nome do grupo
  const enrichedCategories = useMemo(() => {
    return (categories || []).map(cat => ({
      ...cat,
      dre_group_name: (groups || []).find(g => g.id === cat.dre_groups_id)?.description
    }));
  }, [categories, groups]);

  // Handlers
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as ConfigTabType);
    setSearchValue('');
    setSelectedItem(null);
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

  const handleCreateNew = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (item: any) => {
    const confirmMessage = `Tem certeza que deseja excluir "${item.description}"?`;
    
    if (!window.confirm(confirmMessage)) return;

    let success = false;
    
    switch (activeTab) {
      case 'categories':
        success = await deleteCategory(item.id);
        break;
      case 'groups':
        success = await deleteGroup(item.id);
        break;
      case 'accounts':
        success = await deleteAccount(item.id);
        break;
    }

    if (success) {
      console.log('Item excluído com sucesso');
    }
  };

  const handleModalSave = async (data: any): Promise<boolean> => {
    try {
      switch (activeTab) {
        case 'categories':
          if (selectedItem) {
            return await updateCategory(selectedItem.id, data as FinancialCategoryFormData);
          } else {
            const newCategory = await createCategory(data as FinancialCategoryFormData);
            return newCategory !== null;
          }
        
        case 'groups':
          if (selectedItem) {
            return await updateGroup(selectedItem.id, data as DREGroupFormData);
          } else {
            const newGroup = await createGroup(data as DREGroupFormData);
            return newGroup !== null;
          }
        
        case 'accounts':
          if (selectedItem) {
            return await updateAccount(selectedItem.id, data as FinancialAccountFormData);
          } else {
            const newAccount = await createAccount(data as FinancialAccountFormData);
            return newAccount !== null;
          }
        
        default:
          return false;
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      return false;
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
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

  // Obter título do modal
  const getModalTitle = () => {
    const action = selectedItem ? 'Editar' : 'Nova';
    switch (activeTab) {
      case 'categories':
        return `${action} Categoria`;
      case 'groups':
        return `${action} Grupo DRE`;
      case 'accounts':
        return `${action} Conta`;
      default:
        return action;
    }
  };

  return (
    <div className="space-y-6">
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
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <ConfigModalSidebar
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        title={getModalTitle()}
        type={activeTab}
        item={selectedItem}
        dreGroups={groups}
      />
    </div>
  );
};