import { useState, useEffect, useMemo } from 'react';
import { DollarSign, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { accountsReceivableApi } from '../services/accountsReceivable.api';
import { AccountsReceivableSummary } from '../types/accountsReceivable';
import { TabIndicator } from '../types/indicators';

export const useAccountsReceivableIndicators = (companyId: string) => {
  const [summary, setSummary] = useState<AccountsReceivableSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar dados do resumo
  useEffect(() => {
    const fetchSummary = async () => {
      if (!companyId) return;
      
      setLoading(true);
      try {
        const data = await accountsReceivableApi.getSummary(companyId);
        console.log('🔍 Accounts Receivable Summary fetched:', data);
        setSummary(data);
      } catch (error) {
        console.error('Erro ao buscar resumo de contas a receber:', error);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [companyId]);

  // Converter para formato do header
  const tabIndicators = useMemo((): TabIndicator[] => {
    if (!summary) return [];

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    return [
      {
        label: 'Total',
        value: formatCurrency(summary.valor_total),
        icon: DollarSign,
        color: 'text-blue-600 dark:text-blue-400'
      },
      {
        label: 'Vencidas',
        value: formatCurrency(summary.valor_vencido),
        icon: AlertTriangle,
        color: 'text-red-600 dark:text-red-400'
      },
      {
        label: 'Vence em Breve',
        value: formatCurrency(summary.valor_vence_breve),
        icon: Clock,
        color: 'text-yellow-600 dark:text-yellow-400'
      },
      {
        label: 'Em Dia',
        value: formatCurrency(summary.valor_em_dia),
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400'
      }
    ];
  }, [summary]);

  return {
    indicators: tabIndicators,
    summary,
    loading
  };
};