'use client';

import React from 'react';
import { TabIndicator } from '../types/indicators';

interface FinancialIndicatorsProps {
  indicators: TabIndicator[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
}

export const FinancialIndicators: React.FC<FinancialIndicatorsProps> = ({ 
  indicators, 
  loading = false,
  title,
  subtitle
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-6">
        {title && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
          </div>
        )}
        <div className="flex flex-wrap gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!indicators.length) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-6">
      {title && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
        </div>
      )}
      
      <div className="flex flex-wrap gap-6">
        {indicators.map((indicator, index) => (
          <div key={index} className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
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
    </div>
  );
};