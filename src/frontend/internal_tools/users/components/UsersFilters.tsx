'use client';

import React from 'react';
import { FilterContainer, FilterField } from '../../shared/components';
import { UserFilters } from '../types/users';

interface UsersFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onRefresh: () => void;
}

export const UsersFilters: React.FC<UsersFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
}) => {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined });
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters };
    
    if (value === '') {
      delete newFilters[key as keyof UserFilters];
    } else {
      if (key === 'is_verified') {
        (newFilters as any)[key] = value === 'true';
      } else {
        (newFilters as any)[key] = value;
      }
    }
    
    onFiltersChange(newFilters);
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
        { value: 'active', label: 'Ativo' },
        { value: 'inactive', label: 'Inativo' },
        { value: 'suspended', label: 'Suspenso' },
      ],
    },
    {
      key: 'profile_type',
      label: 'Todos os perfis',
      type: 'select',
      options: [
        { value: 'BPO Operator', label: 'Operador BPO' },
        { value: 'Vendedor', label: 'Vendedor' },
        { value: 'Customer Success', label: 'Customer Success' },
        { value: 'Analista', label: 'Analista' },
        { value: 'Admin', label: 'Admin' },
      ],
    },
    {
      key: 'is_verified',
      label: 'Verificação',
      type: 'select',
      options: [
        { value: 'true', label: 'Verificados' },
        { value: 'false', label: 'Não Verificados' },
      ],
    },
  ];

  return (
    <FilterContainer
      searchValue={filters.search || ''}
      searchPlaceholder="Buscar por nome ou email..."
      filters={filters}
      filterFields={filterFields}
      onSearchChange={handleSearchChange}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
      onRefresh={onRefresh}
    />
  );
};