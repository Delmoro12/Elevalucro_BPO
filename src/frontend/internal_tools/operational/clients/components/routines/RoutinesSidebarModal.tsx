'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, Save, X, Clock, Calendar, User, AlertTriangle, Info } from 'lucide-react';
import { ModalSidebar } from '../../../../shared/components/ModalSidebar';
import { CreateRoutineData, UpdateRoutineData, RoutineTemplate } from '../../services/routinesCrud';

interface RoutinesSidebarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRoutineData | UpdateRoutineData) => Promise<boolean>;
  mode: 'create' | 'edit';
  companyId: string;
  routineData?: any;
  templates: RoutineTemplate[];
  users: Array<{id: string, name: string, email: string}>;
  loading?: boolean;
  saving?: boolean;
  error?: string | null;
}

interface FormData {
  routine_id?: string;
  custom_name: string;
  custom_description: string;
  custom_instructions: string;
  custom_frequency: string;
  assigned_to: string;
  day_of_week: number | null;
  day_of_month: number | null;
  month_of_year: number | null;
}

export const RoutinesSidebarModal: React.FC<RoutinesSidebarModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  companyId,
  routineData,
  templates,
  users,
  loading = false,
  saving = false,
  error
}) => {
  const [formData, setFormData] = useState<FormData>({
    routine_id: '',
    custom_name: '',
    custom_description: '',
    custom_instructions: '',
    custom_frequency: 'monthly',
    assigned_to: '',
    day_of_week: null,
    day_of_month: null,
    month_of_year: null
  });

  const [selectedTemplate, setSelectedTemplate] = useState<RoutineTemplate | null>(null);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && routineData) {
        // Edit mode: populate with existing data
        setFormData({
          routine_id: routineData.routine_id || '',
          custom_name: routineData.custom_name || routineData.routine?.name || '',
          custom_description: routineData.custom_description || routineData.routine?.description || '',
          custom_instructions: routineData.custom_instructions || routineData.routine?.instructions || '',
          custom_frequency: routineData.custom_frequency || 'monthly',
          assigned_to: routineData.assigned_to || '',
          day_of_week: routineData.day_of_week,
          day_of_month: routineData.day_of_month,
          month_of_year: routineData.month_of_year
        });
      } else {
        // Create mode: reset to default values
        setFormData({
          routine_id: '',
          custom_name: '',
          custom_description: '',
          custom_instructions: '',
          custom_frequency: 'monthly',
          assigned_to: '',
          day_of_week: null,
          day_of_month: null,
          month_of_year: null
        });
        setSelectedTemplate(null);
      }
    }
  }, [isOpen, mode, routineData]);

  // When template is selected, populate form with template data
  useEffect(() => {
    if (selectedTemplate && mode === 'create') {
      setFormData(prev => ({
        ...prev,
        routine_id: selectedTemplate.id,
        custom_name: selectedTemplate.name,
        custom_description: selectedTemplate.description,
        custom_instructions: selectedTemplate.instructions
      }));
    }
  }, [selectedTemplate, mode]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (template: RoutineTemplate) => {
    setSelectedTemplate(template);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.custom_name.trim()) {
      return;
    }

    let dataToSave;

    if (mode === 'edit') {
      dataToSave = {
        ...formData,
        id: routineData.id,
        company_id: companyId,
        routine_id: formData.routine_id || null,
        assigned_to: formData.assigned_to || null,
        custom_frequency: formData.custom_frequency || null,
        custom_description: formData.custom_description || null,
        custom_instructions: formData.custom_instructions || null,
      } as UpdateRoutineData;
    } else {
      dataToSave = {
        ...formData,
        company_id: companyId,
        routine_id: formData.routine_id || null,
        assigned_to: formData.assigned_to || null,
        custom_frequency: formData.custom_frequency || null,
        custom_description: formData.custom_description || null,
        custom_instructions: formData.custom_instructions || null,
        start_date: new Date().toISOString().split('T')[0]
      } as CreateRoutineData;
    }

    const success = await onSave(dataToSave);
    if (success) {
      onClose();
    }
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'biweekly', label: 'Quinzenal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' }
  ];


  if (loading) {
    return (
      <ModalSidebar
        isOpen={isOpen}
        onClose={onClose}
        title={mode === 'create' ? 'Nova Rotina' : 'Editar Rotina'}
        icon={RotateCcw}
        width="lg"
      >
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
            <span className="text-slate-600 dark:text-slate-400">Carregando...</span>
          </div>
        </div>
      </ModalSidebar>
    );
  }

  return (
    <ModalSidebar
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Nova Rotina' : 'Editar Rotina'}
      subtitle={
        mode === 'create' 
          ? 'Crie uma nova rotina para a empresa' 
          : routineData?.created_at 
            ? `Criada em ${new Date(routineData.created_at).toLocaleDateString('pt-BR')}`
            : 'Edite os detalhes da rotina'
      }
      icon={RotateCcw}
      width="lg"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {error && (
              <>
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="routine-form"
              disabled={saving || !formData.custom_name.trim()}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </div>
      }
    >
      <form id="routine-form" onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Template Selection (only in create mode) */}
        {mode === 'create' && templates.length > 0 && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Modelo de Rotina (Opcional)
            </label>
            <select
              value={selectedTemplate?.id || ''}
              onChange={(e) => {
                const template = templates.find(t => t.id === e.target.value);
                setSelectedTemplate(template || null);
              }}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Criar rotina personalizada</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            {selectedTemplate && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">{selectedTemplate.name}</p>
                    <p>{selectedTemplate.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
            Informações Básicas
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nome da Rotina *
            </label>
            <input
              type="text"
              value={formData.custom_name}
              onChange={(e) => handleInputChange('custom_name', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ex: Conciliação Bancária Mensal"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.custom_description}
              onChange={(e) => handleInputChange('custom_description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Descreva o objetivo desta rotina..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Instruções Detalhadas
            </label>
            <textarea
              value={formData.custom_instructions}
              onChange={(e) => handleInputChange('custom_instructions', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Passo a passo de como executar esta rotina..."
            />
          </div>
        </div>

        {/* Schedule Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Agendamento</span>
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Frequência
            </label>
            <select
              value={formData.custom_frequency}
              onChange={(e) => handleInputChange('custom_frequency', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {frequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignment */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Atribuição</span>
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Responsável
            </label>
            <select
              value={formData.assigned_to}
              onChange={(e) => handleInputChange('assigned_to', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Selecionar usuário...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

        </div>


        {/* Advanced Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
            Configurações Avançadas
          </h3>
          

          {/* Specific Period Settings */}
          {(formData.custom_frequency === 'weekly' || formData.custom_frequency === 'biweekly') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Dia da Semana (1-7, onde 1 = Segunda)
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={formData.day_of_week || ''}
                onChange={(e) => handleInputChange('day_of_week', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {formData.custom_frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Dia do Mês (1-31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.day_of_month || ''}
                onChange={(e) => handleInputChange('day_of_month', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {formData.custom_frequency === 'yearly' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Mês do Ano (1-12)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.month_of_year || ''}
                  onChange={(e) => handleInputChange('month_of_year', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Dia do Mês (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.day_of_month || ''}
                  onChange={(e) => handleInputChange('day_of_month', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

      </form>
    </ModalSidebar>
  );
};