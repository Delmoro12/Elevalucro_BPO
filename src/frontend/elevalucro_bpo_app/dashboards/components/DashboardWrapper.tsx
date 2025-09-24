'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { Card } from './ui/Card';
import { DollarSign, TrendingUp, FileText } from 'lucide-react';
import { FluxoCaixaTab } from './FluxoCaixaTab';
import { DRETab } from './DRETab';
import { BalancoFinanceiroTab } from './BalancoFinanceiroTab';

export const DashboardWrapper: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fluxo-caixa');

  return (
    <div className="w-full space-y-6">
      <Card className="border-0 shadow-none">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-14">
            <TabsTrigger 
              value="fluxo-caixa" 
              className="flex items-center gap-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/20 dark:data-[state=active]:text-emerald-400"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Fluxo de Caixa</span>
              <span className="sm:hidden">Fluxo</span>
            </TabsTrigger>
            <TabsTrigger 
              value="dre"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400"
            >
              <TrendingUp className="w-4 h-4" />
              <span>DRE</span>
            </TabsTrigger>
            <TabsTrigger 
              value="balanco"
              className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/20 dark:data-[state=active]:text-purple-400"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Balanço Financeiro</span>
              <span className="sm:hidden">Balanço</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="fluxo-caixa" className="mt-6">
            <FluxoCaixaTab />
          </TabsContent>
          
          <TabsContent value="dre" className="mt-6">
            <DRETab />
          </TabsContent>
          
          <TabsContent value="balanco" className="mt-6">
            <BalancoFinanceiroTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};