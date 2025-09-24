'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { 
  BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Percent,
  AlertTriangle, CheckCircle, Activity
} from 'lucide-react';
import { mockDREData, mockChartDataDRE } from '../utils/mockData';
import { formatCurrency } from '@/src/lib/utils';

export const DRETab: React.FC = () => {
  const receitaBruta = mockDREData.find(item => item.categoria === 'RECEITA BRUTA')?.valor_atual || 0;
  const lucroLiquido = mockDREData.find(item => item.categoria === '(=) LUCRO LÍQUIDO')?.valor_atual || 0;
  const lucroOperacional = mockDREData.find(item => item.categoria === '(=) LUCRO OPERACIONAL')?.valor_atual || 0;
  const margemLiquida = (lucroLiquido / receitaBruta) * 100;
  const margemOperacional = (lucroOperacional / receitaBruta) * 100;

  const radarData = [
    { subject: 'Receita', A: 95, B: 88, fullMark: 100 },
    { subject: 'Custos', A: 75, B: 82, fullMark: 100 },
    { subject: 'Despesas', A: 68, B: 72, fullMark: 100 },
    { subject: 'Lucro Bruto', A: 85, B: 78, fullMark: 100 },
    { subject: 'Lucro Líquido', A: 80, B: 70, fullMark: 100 },
    { subject: 'Margem', A: 88, B: 80, fullMark: 100 },
  ];

  const evolutionData = [
    { mes: 'Jan', atual: 180000, anterior: 165000 },
    { mes: 'Fev', atual: 195000, anterior: 170000 },
    { mes: 'Mar', atual: 210000, anterior: 185000 },
    { mes: 'Abr', atual: 205000, anterior: 190000 },
    { mes: 'Mai', atual: 220000, anterior: 195000 },
    { mes: 'Jun', atual: 235000, anterior: 200000 },
    { mes: 'Jul', atual: 240000, anterior: 210000 },
    { mes: 'Ago', atual: 245000, anterior: 215000 },
    { mes: 'Set', atual: 250000, anterior: 220000 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Receita Bruta
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(receitaBruta)}
                </p>
                <div className="flex items-center mt-2 text-blue-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">+13.6%</span>
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Lucro Líquido
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(lucroLiquido)}
                </p>
                <div className="flex items-center mt-2 text-emerald-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">+35.1%</span>
                </div>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Margem Líquida
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {margemLiquida.toFixed(1)}%
                </p>
                <div className="flex items-center mt-2 text-purple-600">
                  <Percent className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">+3.5 p.p.</span>
                </div>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/40 p-3 rounded-lg">
                <Percent className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Margem Operacional
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {margemOperacional.toFixed(1)}%
                </p>
                <div className="flex items-center mt-2 text-amber-600">
                  <Activity className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">+4.2 p.p.</span>
                </div>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Cascata DRE */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cascata DRE</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockChartDataDRE}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="valor" fill="#3b82f6" name="Valor" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Linha - Evolução Receita */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evolução da Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="atual" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Ano Atual"
                />
                <Line 
                  type="monotone" 
                  dataKey="anterior" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Ano Anterior"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico Radar - Análise Comparativa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Análise Comparativa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar 
                  name="Período Atual" 
                  dataKey="A" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                />
                <Radar 
                  name="Período Anterior" 
                  dataKey="B" 
                  stroke="#94a3b8" 
                  fill="#94a3b8" 
                  fillOpacity={0.6}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Card de Análise */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Análise de Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium">Receita acima da meta</span>
              </div>
              <span className="text-sm font-bold text-emerald-600">+8.5%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium">Custos elevados</span>
              </div>
              <span className="text-sm font-bold text-amber-600">Atenção</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Eficiência operacional</span>
              </div>
              <span className="text-sm font-bold text-blue-600">85%</span>
            </div>
            
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <strong>Recomendação:</strong> Reduzir custos operacionais em 5% para atingir margem ideal de 25%.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela DRE Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Demonstração do Resultado do Exercício</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-slate-700">
                  <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Conta</th>
                  <th className="text-right p-2 font-medium text-slate-600 dark:text-slate-400">Período Atual</th>
                  <th className="text-right p-2 font-medium text-slate-600 dark:text-slate-400">Período Anterior</th>
                  <th className="text-right p-2 font-medium text-slate-600 dark:text-slate-400">Var. %</th>
                  <th className="text-right p-2 font-medium text-slate-600 dark:text-slate-400">% da Receita</th>
                </tr>
              </thead>
              <tbody>
                {mockDREData.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`border-b dark:border-slate-700 ${
                      item.nivel === 0 ? 'font-bold bg-slate-50 dark:bg-slate-900/50' : ''
                    }`}
                  >
                    <td className={`p-2 ${item.nivel === 1 ? 'pl-8' : ''}`}>
                      {item.categoria}
                    </td>
                    <td className={`p-2 text-right ${
                      item.valor_atual < 0 ? 'text-red-600' : 'text-slate-900 dark:text-white'
                    }`}>
                      {formatCurrency(Math.abs(item.valor_atual))}
                    </td>
                    <td className="p-2 text-right text-slate-600 dark:text-slate-400">
                      {formatCurrency(Math.abs(item.valor_anterior))}
                    </td>
                    <td className={`p-2 text-right ${
                      item.variacao_percentual > 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {item.variacao_percentual > 0 ? '+' : ''}{item.variacao_percentual.toFixed(1)}%
                    </td>
                    <td className="p-2 text-right text-slate-600 dark:text-slate-400">
                      {((Math.abs(item.valor_atual) / receitaBruta) * 100).toFixed(1)}%
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