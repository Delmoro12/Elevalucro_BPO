'use client';

import React from 'react';
import { FilterContainer, FilterField } from '../../../shared/components';
import { ClientFilters } from '../types/clients';

interface ClientsFiltersProps {
  filters: ClientFilters;
  onFiltersChange: (filters: ClientFilters) => void;
  onRefresh: () => void;
}

export const ClientsFilters: React.FC<ClientsFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
}) => {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined });
  };

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const filterFields: FilterField[] = [
    {
      key: 'status',
      label: 'Todos os status',
      type: 'select',
      options: [
        { value: 'ativo', label: 'Ativo' },
        { value: 'suspenso', label: 'Suspenso' },
        { value: 'cancelado', label: 'Cancelado' },
        { value: 'pendente', label: 'Pendente' },
      ],
    },
    {
      key: 'plano',
      label: 'Todos os planos',
      type: 'select',
      options: [
        { value: 'controle', label: 'Controle' },
        { value: 'gerencial', label: 'Gerencial' },
        { value: 'avancado', label: 'Avançado' },
      ],
    },
    {
      key: 'responsavel_operacional',
      label: 'Responsável',
      type: 'input',
      placeholder: 'Nome do responsável',
    },
  ];

  return (
    <FilterContainer
      searchValue={filters.search || ''}
      searchPlaceholder="Buscar por empresa, contato, email..."
      filters={filters}
      filterFields={filterFields}
      onSearchChange={handleSearchChange}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
      onRefresh={onRefresh}
    />
  );
};