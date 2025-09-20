'use client';

import React from 'react';
import { TabIndicator } from '../../types/indicators';

interface CashFlowIndicatorsProps {
  indicators: TabIndicator[];
  loading?: boolean;
}

export const CashFlowIndicators: React.FC<CashFlowIndicatorsProps> = ({ 
  indicators, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center lg:text-right">
            <div className="flex items-center justify-center lg:justify-end space-x-2 mb-2">
              <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!indicators.length) {
    return (
      <div className="text-center py-4">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Nenhum indicador disponível
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-6">
      {indicators.map((indicator, index) => (
        <div key={index} className="text-center lg:text-right">
          <div className="flex items-center justify-center lg:justify-end space-x-2 mb-1">
            {indicator.icon && <indicator.icon className="h-4 w-4 text-slate-400" />}
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
              {indicator.label}
            </span>
          </div>
          <p className={`text-lg font-bold ${indicator.color || 'text-slate-900 dark:text-slate-100'}`}>
            {indicator.value}
          </p>
        </div>
      ))}
    </div>
  );
};