'use client';

import React from 'react';
import { FinanceTabsContent } from '../components/FinanceTabsContent';
import { FinanceSummaryCards } from '../components/FinanceSummaryCards';

const MyFinancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <FinanceSummaryCards />
      <FinanceTabsContent />
    </div>
  );
};
export default MyFinancePage;
