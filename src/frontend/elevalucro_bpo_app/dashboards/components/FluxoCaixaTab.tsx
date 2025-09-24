'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, 
  ArrowDownRight, Calendar, AlertCircle 
} from 'lucide-react';
import { mockFluxoCaixaData, mockChartDataFluxo, mockKPICards } from '../utils/mockData';
import { formatCurrency } from '@/src/lib/utils';

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];

export const FluxoCaixaTab: React.FC = () => {
  const totalReceitas = mockFluxoCaixaData
    .filter(item => item.categoria === 'receita')
    .reduce((sum, item) => sum + item.valor, 0);
  
  const totalDespesas = Math.abs(mockFluxoCaixaData
    .filter(item => item.categoria === 'despesa')
    .reduce((sum, item) => sum + item.valor, 0));
  
  const saldoFinal = totalReceitas - totalDespesas;

  const pieData = [
    { name: 'Vendas', value: 35000 },
    { name: 'Fornecedores', value: 5000 },
    { name: 'Pessoal', value: 8000 },
    { name: 'Despesas Fixas', value: 3000 },
    { name: 'Tributos', value: 4500 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total de Receitas
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(totalReceitas)}
                </p>
                <div className="flex items-center mt-2 text-emerald-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">+12.5%</span>
                </div>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-lg">
                <ArrowUpRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total de Despesas
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(totalDespesas)}
                </p>
                <div className="flex items-center mt-2 text-red-600">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">-8.3%</span>
                </div>
              </div>
              <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-lg">
                <ArrowDownRight className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Saldo Final
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(saldoFinal)}
                </p>
                <div className="flex items-center mt-2 text-blue-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">+15.2%</span>
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Previsão 30 dias
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(45000)}
                </p>
                <div className="flex items-center mt-2 text-purple-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Otimista</span>
                </div>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/40 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Área - Evolução do Fluxo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evolução do Fluxo de Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockChartDataFluxo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="receitas" 
                  stackId="1" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                  name="Receitas"
                />
                <Area 
                  type="monotone" 
                  dataKey="despesas" 
                  stackId="1" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.6}
                  name="Despesas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Saldo Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Saldo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockChartDataFluxo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="saldo" fill="#3b82f6" name="Saldo" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição de Despesas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Linha - Tendência */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tendência de Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartDataFluxo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receitas" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Receitas"
                />
                <Line 
                  type="monotone" 
                  dataKey="despesas" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Despesas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimas Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-slate-700">
                  <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Data</th>
                  <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Descrição</th>
                  <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Tipo</th>
                  <th className="text-right p-2 font-medium text-slate-600 dark:text-slate-400">Valor</th>
                  <th className="text-right p-2 font-medium text-slate-600 dark:text-slate-400">Saldo</th>
                  <th className="text-center p-2 font-medium text-slate-600 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockFluxoCaixaData.slice(0, 5).map((item) => (
                  <tr key={item.id} className="border-b dark:border-slate-700">
                    <td className="p-2">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                    <td className="p-2">{item.descricao}</td>
                    <td className="p-2">{item.tipo}</td>
                    <td className={`p-2 text-right font-medium ${
                      item.categoria === 'receita' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Math.abs(item.valor))}
                    </td>
                    <td className="p-2 text-right font-medium">{formatCurrency(item.saldo)}</td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'realizado' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};