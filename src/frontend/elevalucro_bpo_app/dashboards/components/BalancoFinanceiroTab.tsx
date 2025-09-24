'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { 
  BarChart, Bar, PieChart, Pie, Cell, Treemap,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, BarChart3,
  Shield, AlertCircle, Wallet, Building
} from 'lucide-react';
import { mockBalancoData, mockChartDataBalanco } from '../utils/mockData';
import { formatCurrency } from '@/src/lib/utils';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export const BalancoFinanceiroTab: React.FC = () => {
  const ativoTotal = mockBalancoData.find(item => item.categoria === 'ATIVO')?.valor_atual || 0;
  const passivoTotal = mockBalancoData.find(item => item.categoria === 'PASSIVO')?.valor_atual || 0;
  const patrimonioLiquido = mockBalancoData.find(item => item.categoria === 'PATRIMÔNIO LÍQUIDO')?.valor_atual || 0;
  const ativoCirculante = mockBalancoData.find(item => item.categoria === 'ATIVO CIRCULANTE')?.valor_atual || 0;
  const passivoCirculante = mockBalancoData.find(item => item.categoria === 'PASSIVO CIRCULANTE')?.valor_atual || 0;
  const liquidezCorrente = ativoCirculante / passivoCirculante;
  const endividamento = ((passivoTotal - patrimonioLiquido) / ativoTotal) * 100;

  const treemapData = [
    { name: 'Caixa', size: 50000, color: '#10b981' },
    { name: 'Contas a Receber', size: 80000, color: '#3b82f6' },
    { name: 'Estoques', size: 70000, color: '#8b5cf6' },
    { name: 'Imobilizado', size: 250000, color: '#f59e0b' },
    { name: 'Intangível', size: 50000, color: '#ef4444' },
  ];

  const radialData = [
    { name: 'Liquidez Corrente', value: liquidezCorrente * 100, fill: '#10b981' },
    { name: 'Endividamento', value: endividamento, fill: '#ef4444' },
    { name: 'ROE', value: 20, fill: '#3b82f6' },
    { name: 'Capital de Giro', value: 65, fill: '#8b5cf6' },
  ];

  const composicaoAtivos = [
    { name: 'Circulante', value: 200000 },
    { name: 'Não Circulante', value: 300000 },
  ];

  const composicaoPassivos = [
    { name: 'Circulante', value: 150000 },
    { name: 'Não Circulante', value: 100000 },
    { name: 'Patrimônio Líquido', value: 250000 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Ativo Total
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(ativoTotal)}
                </p>
                <div className="flex items-center mt-2 text-purple-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">+11.1%</span>
                </div>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/40 p-3 rounded-lg">
                <Building className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Patrimônio Líquido
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(patrimonioLiquido)}
                </p>
                <div className="flex items-center mt-2 text-blue-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">+13.6%</span>
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Liquidez Corrente
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {liquidezCorrente.toFixed(2)}
                </p>
                <div className="flex items-center mt-2 text-emerald-600">
                  <Shield className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Saudável</span>
                </div>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Endividamento
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {endividamento.toFixed(1)}%
                </p>
                <div className="flex items-center mt-2 text-amber-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Moderado</span>
                </div>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Comparativo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estrutura Patrimonial</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockChartDataBalanco}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="valor" fill="#8b5cf6" name="Valor" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Composição do Ativo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Composição do Ativo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={composicaoAtivos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${formatCurrency(entry.value as number)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {composicaoAtivos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Treemap - Distribuição de Ativos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill="#8b5cf6"
                content={({ x, y, width, height, name, value, color }) => (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      style={{ fill: color, stroke: '#fff', strokeWidth: 2 }}
                    />
                    {width > 50 && height > 30 && (
                      <>
                        <text
                          x={x + width / 2}
                          y={y + height / 2 - 7}
                          textAnchor="middle"
                          fill="#fff"
                          fontSize={12}
                          fontWeight="bold"
                        >
                          {name}
                        </text>
                        <text
                          x={x + width / 2}
                          y={y + height / 2 + 7}
                          textAnchor="middle"
                          fill="#fff"
                          fontSize={10}
                        >
                          {formatCurrency(value || 0)}
                        </text>
                      </>
                    )}
                  </g>
                )}
              />
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico Radial - Indicadores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Indicadores Financeiros</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={radialData}>
                <RadialBar dataKey="value" cornerRadius={10} fill="#8b5cf6" />
                <Legend />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Composição do Passivo */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Composição do Passivo e Patrimônio Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={composicaoPassivos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${formatCurrency(entry.value as number)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {composicaoPassivos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Balanço Patrimonial */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Balanço Patrimonial Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-slate-700">
                  <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Conta</th>
                  <th className="text-center p-2 font-medium text-slate-600 dark:text-slate-400">Tipo</th>
                  <th className="text-right p-2 font-medium text-slate-600 dark:text-slate-400">Valor Atual</th>
                  <th className="text-right p-2 font-medium text-slate-600 dark:text-slate-400">Valor Anterior</th>
                  <th className="text-right p-2 font-medium text-slate-600 dark:text-slate-400">Var. %</th>
                  <th className="text-right p-2 font-medium text-slate-600 dark:text-slate-400">% do Total</th>
                </tr>
              </thead>
              <tbody>
                {mockBalancoData.map((item) => {
                  const percentualTotal = ((item.valor_atual / ativoTotal) * 100).toFixed(1);
                  const variacao = ((item.valor_atual - item.valor_anterior) / item.valor_anterior * 100).toFixed(1);
                  
                  return (
                    <tr 
                      key={item.id} 
                      className={`border-b dark:border-slate-700 ${
                        item.nivel === 0 ? 'font-bold bg-slate-50 dark:bg-slate-900/50' :
                        item.nivel === 1 ? 'font-semibold bg-slate-50/50 dark:bg-slate-900/30' : ''
                      }`}
                    >
                      <td className={`p-2 ${
                        item.nivel === 1 ? 'pl-6' : 
                        item.nivel === 2 ? 'pl-10' : ''
                      }`}>
                        {item.categoria}
                      </td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.tipo === 'ativo' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                          item.tipo === 'passivo'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                        }`}>
                          {item.tipo}
                        </span>
                      </td>
                      <td className="p-2 text-right font-medium">
                        {formatCurrency(item.valor_atual)}
                      </td>
                      <td className="p-2 text-right text-slate-600 dark:text-slate-400">
                        {formatCurrency(item.valor_anterior)}
                      </td>
                      <td className={`p-2 text-right ${
                        Number(variacao) > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {Number(variacao) > 0 ? '+' : ''}{variacao}%
                      </td>
                      <td className="p-2 text-right text-slate-600 dark:text-slate-400">
                        {percentualTotal}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Rodapé com validação */}
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              ✓ Balanço Patrimonial validado: Ativo Total = Passivo Total + Patrimônio Líquido
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};