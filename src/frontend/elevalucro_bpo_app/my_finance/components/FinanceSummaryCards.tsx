'use client';

import React from 'react';
import { DollarSign, TrendingUp, PieChart, Calendar } from 'lucide-react';

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  iconBgColor: string;
  iconColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, title, value, iconBgColor, iconColor }) => (
  <div className="bg-white dark:bg-slate-800 p-4 lg:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
    <div className="flex items-center">
      <div className={`p-2 ${iconBgColor} rounded-lg flex-shrink-0`}>
        <div className={iconColor}>
          {icon}
        </div>
      </div>
      <div className="ml-3 lg:ml-4 min-w-0 flex-1">
        <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">{title}</p>
        <p className="text-lg lg:text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

export const FinanceSummaryCards: React.FC = () => {
  const summaryData = [
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Saldo Atual",
      value: "R$ 45.230",
      iconBgColor: "bg-emerald-100 dark:bg-emerald-900/50",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Receitas",
      value: "R$ 18.500",
      iconBgColor: "bg-blue-100 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: <PieChart className="h-6 w-6" />,
      title: "Despesas",
      value: "R$ 12.780",
      iconBgColor: "bg-red-100 dark:bg-red-900/50",
      iconColor: "text-red-600 dark:text-red-400"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Este Mês",
      value: "+R$ 5.720",
      iconBgColor: "bg-purple-100 dark:bg-purple-900/50",
      iconColor: "text-purple-600 dark:text-purple-400"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {summaryData.map((card, index) => (
        <SummaryCard
          key={index}
          icon={card.icon}
          title={card.title}
          value={card.value}
          iconBgColor={card.iconBgColor}
          iconColor={card.iconColor}
        />
      ))}
    </div>
  );
};