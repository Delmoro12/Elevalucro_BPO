'use client';

import React from 'react';
import { CheckSquare } from 'lucide-react';

const ApprovalsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center mb-4">
          <CheckSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-3" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Aprovações
          </h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Gerencie workflows de aprovação e processos pendentes.
          Esta é uma página em desenvolvimento.
        </p>
      </div>
    </div>
  );
};
export default ApprovalsPage;
