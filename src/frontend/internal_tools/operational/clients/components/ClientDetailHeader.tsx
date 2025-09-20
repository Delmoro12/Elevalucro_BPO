'use client';

import React from 'react';
import { Building2, Phone, Mail, Calendar, User, CreditCard, FileText, MapPin, RotateCcw, AlertCircle, Clock, CheckCircle, Timer, ArrowLeft, MessageSquare } from 'lucide-react';
import { OperationalClient } from '../types/clients';
import { useRouter } from 'next/navigation';

interface TabIndicator {
  label: string;
  value: string | number;
  icon?: React.ComponentType<any>;
  color?: string;
}

interface ClientDetailHeaderProps {
  client: OperationalClient;
  activeTab?: string;
  tabTitle?: string;
  tabSubtitle?: string;
  indicators?: TabIndicator[];
}

export const ClientDetailHeader: React.FC<ClientDetailHeaderProps> = ({ 
  client, 
  activeTab,
  tabTitle,
  tabSubtitle,
  indicators = []
}) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };
  const getStatusBadge = (status: string) => {
    const colors = {
      ativo: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      suspenso: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      pendente: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[status as keyof typeof colors] || colors.pendente}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPlanBadge = (plano: string) => {
    const colors = {
      avancado: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      gerencial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      controle: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[plano as keyof typeof colors] || colors.controle}`}>
        {plano.charAt(0).toUpperCase() + plano.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      {/* Header principal - título com botão voltar e badges */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBack}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {tabTitle || client.nome_empresa}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tabSubtitle || `Cliente desde ${new Date(client.data_inicio).toLocaleDateString('pt-BR')}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusBadge(client.status)}
          {getPlanBadge(client.plano)}
        </div>
      </div>

      {/* Layout flexível: informações de contato à esquerda, indicadores à direita */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        {/* Informações de contato (sempre visíveis à esquerda) */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Contato Principal */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contato Principal</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {client.nome_contato || 'Aguardando definição'}
            </p>
            {client.email_contato && (
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <a href={`mailto:${client.email_contato}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {client.email_contato}
                </a>
              </p>
            )}
            {client.telefone_contato && (
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <a href={`tel:${client.telefone_contato.replace(/\D/g, '')}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {client.telefone_contato}
                </a>
              </p>
            )}
          </div>

          {/* Informações da Empresa */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Empresa</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {client.nome_empresa}
            </p>
            {client.cnpj && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                CNPJ: {client.cnpj}
              </p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cliente desde {new Date(client.data_inicio).toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Informações do Plano */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Plano & Valor</span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                R$ {client.valor_mensal?.toLocaleString('pt-BR') || '0'}
              </p>
              <span className="text-xs text-gray-500">/mês</span>
            </div>
            {client.responsavel_operacional && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Operador: {client.responsavel_operacional}
              </p>
            )}
          </div>
        </div>

        {/* Indicadores específicos da tab (à direita) */}
        {indicators.length > 0 && (
          <div className="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-6">
            {indicators.map((indicator, index) => (
              <div key={index} className="text-center lg:text-right">
                <div className="flex items-center justify-center lg:justify-end space-x-2 mb-1">
                  {indicator.icon && <indicator.icon className="h-4 w-4 text-gray-400" />}
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {indicator.label}
                  </span>
                </div>
                <p className={`text-lg font-bold ${indicator.color || 'text-gray-900 dark:text-gray-100'}`}>
                  {indicator.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};