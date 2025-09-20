import { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { CashFlowIndicators } from '../types/cashFlow';
import { TabIndicator } from '../types/indicators';
import { cashFlowApi } from '../services/cashFlow.api';

export const useCashFlowIndicators = (companyId: string) => {
  const [indicators, setIndicators] = useState<CashFlowIndicators | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar indicadores
  useEffect(() => {
    const fetchIndicators = async () => {
      if (!companyId) {
        setIndicators(null);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await cashFlowApi.getIndicators(companyId);
        setIndicators(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        setIndicators(null);
      } finally {
        setLoading(false);
      }
    };

    fetchIndicators();
  }, [companyId]);

  // Converter para formato do header (4 indicadores principais)
  const tabIndicators = useMemo((): TabIndicator[] => {
    if (!indicators) return [];

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    const formatRatio = (value: number) => {
      if (value >= 999) return '∞';
      return value.toFixed(2);
    };

    return [
      {
        label: 'Saldo Realizado',
        value: formatCurrency(indicators.realized_balance),
        icon: DollarSign,
        color: indicators.realized_balance >= 0 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-red-600 dark:text-red-400'
      },
      {
        label: 'Liquidez',
        value: formatRatio(indicators.liquidity_ratio),
        icon: BarChart3,
        color: indicators.liquidity_ratio >= 1 
          ? 'text-blue-600 dark:text-blue-400' 
          : 'text-yellow-600 dark:text-yellow-400'
      },
      {
        label: 'Receitas Pendentes',
        value: formatCurrency(indicators.pending_income),
        icon: TrendingUp,
        color: 'text-green-600 dark:text-green-400'
      },
      {
        label: 'Despesas Pendentes',
        value: formatCurrency(indicators.pending_expenses),
        icon: TrendingDown,
        color: 'text-red-600 dark:text-red-400'
      }
    ];
  }, [indicators]);

  return {
    indicators: tabIndicators,
    rawIndicators: indicators,
    loading,
    error
  };
};