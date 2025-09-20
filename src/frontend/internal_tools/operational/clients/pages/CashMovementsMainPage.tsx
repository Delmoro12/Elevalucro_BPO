'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CashMovementsTable } from '../components/cashMovements/CashMovementsTable';
import { CashMovementsModalSidebar } from '../components/cashMovements/CashMovementsModalSidebar';
import { CashMovement, CashMovementFormData, CashMovementTab } from '../types/cashMovements';
import { cashMovementsApi } from '../services/cashMovements.api';
import { useFinancialAccounts } from '../hooks/useFinancialConfig';
import { useCashMovementsIndicators } from '../hooks/useCashMovementsIndicators';
import { CashMovementsFilters } from '../types/indicators';
import { DataTable02DateFilter } from '../../../shared/components/DataTable02';

interface CashMovementsMainPageProps {
  companyId: string;
  onIndicatorsChange?: (indicators: any[]) => void;
}

export const CashMovementsMainPage: React.FC<CashMovementsMainPageProps> = ({ companyId, onIndicatorsChange }) => {
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedMovement, setSelectedMovement] = useState<CashMovement | null>(null);
  
  // Estado centralizado dos filtros
  const [filters, setFilters] = useState<CashMovementsFilters>({
    selectedAccountId: 'all',
    dateFilter: null,
    activeTab: 'all'
  });
  
  const { accounts: financialAccounts } = useFinancialAccounts(companyId);
  
  // Hook para indicadores
  const { indicators, loading: indicatorsLoading } = useCashMovementsIndicators(companyId, movements, filters);

  // Buscar movimentações
  const fetchMovements = useCallback(async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const data = await cashMovementsApi.getByCompany(companyId);
      setMovements(data);
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  // Notificar mudanças nos indicadores
  useEffect(() => {
    if (onIndicatorsChange && !indicatorsLoading) {
      onIndicatorsChange(indicators);
    }
  }, [indicators, indicatorsLoading, onIndicatorsChange]);

  // Handlers para CRUD
  const handleCreate = () => {
    setSelectedMovement(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (movement: CashMovement) => {
    setSelectedMovement(movement);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleView = (movement: CashMovement) => {
    setSelectedMovement(movement);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta movimentação?')) return;
    
    try {
      await cashMovementsApi.delete(id);
      fetchMovements();
    } catch (error) {
      console.error('Erro ao excluir movimentação:', error);
      alert('Erro ao excluir movimentação');
    }
  };

  const handleSave = async (formData: CashMovementFormData) => {
    console.log('🔍 MainPage handleSave - Dados recebidos:', formData);
    console.log('🔍 MainPage handleSave - Company ID:', companyId);
    console.log('🔍 MainPage handleSave - Modal Mode:', modalMode);
    
    try {
      if (modalMode === 'edit' && selectedMovement) {
        console.log('📝 Atualizando movimentação:', selectedMovement.id);
        await cashMovementsApi.update(selectedMovement.id, formData);
      } else {
        console.log('➕ Criando nova movimentação com company_id:', companyId);
        await cashMovementsApi.create(companyId, formData);
      }
      
      fetchMovements();
      setModalOpen(false);
    } catch (error) {
      console.error('❌ Erro ao salvar movimentação:', error);
      throw error;
    }
  };

  // Handlers para filtros
  const handleAccountChange = (accountId: string) => {
    setFilters(prev => ({ ...prev, selectedAccountId: accountId }));
  };

  const handleTabChange = (tab: CashMovementTab) => {
    setFilters(prev => ({ ...prev, activeTab: tab }));
  };

  const handleDateFilterChange = (dateFilter: DataTable02DateFilter | null) => {
    setFilters(prev => ({ ...prev, dateFilter }));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <CashMovementsTable
          movements={movements}
          financialAccounts={financialAccounts}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onRefresh={fetchMovements}
          selectedAccountId={filters.selectedAccountId}
          onAccountChange={handleAccountChange}
          onTabChange={handleTabChange}
          onDateFilterChange={handleDateFilterChange}
        />
      </div>

      <CashMovementsModalSidebar
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        movement={selectedMovement}
        mode={modalMode}
        financialAccounts={financialAccounts}
      />
    </div>
  );
};