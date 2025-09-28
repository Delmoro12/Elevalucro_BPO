'use client';

import React from 'react';
import { Eye, Trash2, ArrowRight, Mail, Phone, Thermometer } from 'lucide-react';
import { LeadListItem, LeadKanbanStage } from '../types/leads';

interface LeadsTableProps {
  leads: LeadListItem[];
  loading: boolean;
  onDelete: (id: string) => Promise<boolean>;
  onStageChange: (id: string, newStage: LeadKanbanStage) => Promise<boolean>;
  onConvert: (id: string) => Promise<boolean>;
  onEdit: (id: string) => void;
  onLeadUpdate?: () => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  loading,
  onDelete,
  onStageChange,
  onConvert,
  onEdit,
  onLeadUpdate,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTemperatureIcon = (temperature: string) => {
    switch (temperature) {
      case 'hot':
        return '🔥';
      case 'warm':
        return '🌡️';
      case 'cold':
        return '❄️';
      default:
        return '🌡️';
    }
  };

  const getStageColor = (stage: LeadKanbanStage) => {
    switch (stage) {
      case 'new':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'qualified':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'scheduled':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'lost':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getStageDisplayName = (stage: LeadKanbanStage) => {
    switch (stage) {
      case 'new':
        return 'Oportunidades';
      case 'contacted':
        return 'Contatados';
      case 'qualified':
        return 'Qualificados';
      case 'scheduled':
        return 'Agendados';
      case 'lost':
        return 'Perdidos';
      default:
        return stage;
    }
  };

  const handleEdit = (leadId: string) => {
    onEdit(leadId);
  };

  const handleDelete = async (leadId: string) => {
    const success = await onDelete(leadId);
    if (success && onLeadUpdate) {
      onLeadUpdate();
    }
  };

  const handleConvert = async (leadId: string) => {
    const success = await onConvert(leadId);
    if (success && onLeadUpdate) {
      onLeadUpdate();
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex-1">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Lead
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Plano
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Temp.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Estágio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Criado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {lead.contact_name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {lead.contact_email}
                      </div>
                      {lead.contact_phone && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {lead.contact_phone}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900 dark:text-slate-100">{lead.company_name}</div>
                  {lead.cnpj && <div className="text-sm text-slate-500 dark:text-slate-400">{lead.cnpj}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {lead.plan ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {lead.plan.charAt(0).toUpperCase() + lead.plan.slice(1)}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3" />
                    <span className="text-sm">
                      {getTemperatureIcon(lead.temperature)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={lead.kanban_stage}
                    onChange={(e) => onStageChange(lead.id, e.target.value as LeadKanbanStage)}
                    className={`text-xs px-2 py-1 rounded-full border-0 ${getStageColor(lead.kanban_stage)}`}
                  >
                    <option value="new">Novo</option>
                    <option value="contacted">Contatado</option>
                    <option value="qualified">Qualificado</option>
                    <option value="lost">Perdido</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                  R$ {lead.monthly_value ? lead.monthly_value.toLocaleString() : '0'}/mês
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {formatDate(lead.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(lead.id)}
                      className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
                      title="Editar lead"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleConvert(lead.id)}
                      className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                      title="Converter para prospect"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Excluir lead"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leads.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-slate-500 dark:text-slate-400">
            Nenhum lead encontrado
          </div>
        </div>
      )}
    </div>
  );
};