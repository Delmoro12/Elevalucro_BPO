import { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Calendar } from 'lucide-react';
import type { CashMovement } from '../types/cashMovements';

// Interfaces para indicadores
interface AccountBalance {
  company_id: string;
  financial_account_id: string;
  account_name: string;
  current_balance: number;
}

interface CashMovementsFilters {
  selectedAccountId?: string;
  dateFilter?: any;
  activeTab?: string;
}

interface CashMovementsIndicators {
  totalBalance: number;
  totalCredits: number;
  totalDebits: number;
  accountsCount: number;
  selectedAccountBalance?: number;
  selectedAccountName?: string;
  lastMovementDate?: string;
}

interface TabIndicator {
  label: string;
  value: string | number;
  icon?: React.ComponentType<any>;
  color?: string;
}

// API Base URL - Específica para BPO-APP
const API_BASE = '/api/elevalucro-bpo-app/account-balances';

export const useCashMovementsIndicators = (
  companyId: string, 
  movements: CashMovement[], 
  filters: CashMovementsFilters = {}
) => {
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar saldos das contas
  useEffect(() => {
    const fetchAccountBalances = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const url = new URL(API_BASE, window.location.origin);
        
        // Adicionar company_id apenas se fornecido
        if (companyId) {
          url.searchParams.append('company_id', companyId);
        }

        const response = await fetch(url.toString());
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao buscar saldos das contas');
        }

        if (result.success) {
          console.log('🔍 BPO-APP: Account Balances fetched:', result.data);
          setAccountBalances(result.data || []);
        } else {
          setAccountBalances([]);
        }
      } catch (error) {
        console.error('❌ BPO-APP: Erro ao buscar saldos das contas:', error);
        setAccountBalances([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountBalances();
  }, [companyId, movements]);

  // Filtrar movimentações baseado nos filtros atuais
  const filteredMovements = useMemo(() => {
    let filtered = movements || [];

    // Filtro por conta
    if (filters.selectedAccountId && filters.selectedAccountId !== 'all') {
      filtered = filtered.filter(m => m.financial_account_id === filters.selectedAccountId);
    }

    // Filtro por data
    if (filters.dateFilter) {
      filtered = filtered.filter(movement => {
        if (!movement.date) return false;
        
        const movementDate = new Date(movement.date);
        const movementDateStr = movement.date;
        
        switch (filters.dateFilter.type) {
          case 'month':
            if (filters.dateFilter.month) {
              const [year, month] = filters.dateFilter.month.split('-');
              const movementYear = movementDate.getFullYear().toString();
              const movementMonth = String(movementDate.getMonth() + 1).padStart(2, '0');
              return movementYear === year && movementMonth === month;
            }
            break;
            
          case 'specific':
            if (filters.dateFilter.specificDate) {
              return movementDateStr === filters.dateFilter.specificDate;
            }
            break;
            
          case 'range':
            if (filters.dateFilter.startDate && filters.dateFilter.endDate) {
              return movementDateStr >= filters.dateFilter.startDate && movementDateStr <= filters.dateFilter.endDate;
            }
            break;
        }
        
        return true;
      });
    }

    // Filtro por tipo (tab)
    if (filters.activeTab === 'credits') {
      filtered = filtered.filter(m => m.type === 'credit');
    } else if (filters.activeTab === 'debits') {
      filtered = filtered.filter(m => m.type === 'debit');
    }

    return filtered;
  }, [movements, filters]);

  // Calcular indicadores baseado nos dados filtrados
  const indicators = useMemo((): CashMovementsIndicators => {
    const totalCredits = filteredMovements
      .filter(m => m.type === 'credit')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    
    const totalDebits = filteredMovements
      .filter(m => m.type === 'debit')
      .reduce((sum, m) => sum + (m.amount || 0), 0);

    console.log('🔍 BPO-APP: Indicator calculation:', {
      filteredMovements: filteredMovements.length,
      totalCredits,
      totalDebits,
      accountBalances: accountBalances.length,
      selectedAccountId: filters.selectedAccountId
    });

    let result: CashMovementsIndicators = {
      totalBalance: 0,
      totalCredits,
      totalDebits,
      accountsCount: accountBalances.length,
    };

    if (filters.selectedAccountId === 'all' || !filters.selectedAccountId) {
      // Mostrar saldo total de todas as contas
      result.totalBalance = accountBalances.reduce((sum, balance) => sum + balance.current_balance, 0);
      console.log('🔍 BPO-APP: Total balance calculation:', result.totalBalance);
    } else {
      // Mostrar dados da conta específica
      const selectedAccount = accountBalances.find(b => b.financial_account_id === filters.selectedAccountId);
      console.log('🔍 BPO-APP: Selected account:', selectedAccount);
      if (selectedAccount) {
        result.selectedAccountBalance = selectedAccount.current_balance;
        result.selectedAccountName = selectedAccount.account_name;
      }
      
      // Última movimentação da conta
      const accountMovements = movements.filter(m => m.financial_account_id === filters.selectedAccountId);
      if (accountMovements.length > 0) {
        const lastMovement = accountMovements.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        result.lastMovementDate = lastMovement.date || lastMovement.created_at;
      }
    }

    return result;
  }, [filteredMovements, accountBalances, filters.selectedAccountId, movements]);

  // Converter para formato do header
  const tabIndicators = useMemo((): TabIndicator[] => {
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    const formatDate = (dateString: string) => {
      try {
        return new Date(dateString).toLocaleDateString('pt-BR');
      } catch {
        return '-';
      }
    };

    if (filters.selectedAccountId === 'all' || !filters.selectedAccountId) {
      // Indicadores para "Todas as contas"
      return [
        {
          label: 'Saldo Total',
          value: formatCurrency(indicators.totalBalance),
          icon: DollarSign,
          color: indicators.totalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        },
        {
          label: 'Entradas',
          value: formatCurrency(indicators.totalCredits),
          icon: TrendingUp,
          color: 'text-green-600 dark:text-green-400'
        },
        {
          label: 'Saídas',
          value: formatCurrency(indicators.totalDebits),
          icon: TrendingDown,
          color: 'text-red-600 dark:text-red-400'
        },
        {
          label: 'Contas',
          value: indicators.accountsCount,
          icon: CreditCard,
          color: 'text-blue-600 dark:text-blue-400'
        }
      ];
    } else {
      // Indicadores para conta específica
      const baseIndicators: TabIndicator[] = [
        {
          label: indicators.selectedAccountName || 'Conta',
          value: formatCurrency(indicators.selectedAccountBalance || 0),
          icon: DollarSign,
          color: (indicators.selectedAccountBalance || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        },
        {
          label: 'Entradas',
          value: formatCurrency(indicators.totalCredits),
          icon: TrendingUp,
          color: 'text-green-600 dark:text-green-400'
        },
        {
          label: 'Saídas',
          value: formatCurrency(indicators.totalDebits),
          icon: TrendingDown,
          color: 'text-red-600 dark:text-red-400'
        }
      ];

      if (indicators.lastMovementDate) {
        baseIndicators.push({
          label: 'Última Mov.',
          value: formatDate(indicators.lastMovementDate),
          icon: Calendar,
          color: 'text-gray-600 dark:text-gray-400'
        });
      }

      return baseIndicators;
    }
  }, [indicators, filters.selectedAccountId]);

  return {
    indicators: tabIndicators,
    loading
  };
};