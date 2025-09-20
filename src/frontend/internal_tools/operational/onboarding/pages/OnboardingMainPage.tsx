'use client';

import React from 'react';
import { OnboardingKanban } from '../components/OnboardingKanban';
import { UserCheck } from 'lucide-react';

export const OnboardingMainPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserCheck className="h-8 w-8 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Onboarding Operacional
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Acompanhe o progresso de onboarding dos novos clientes
            </p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <OnboardingKanban />
    </div>
  );
};