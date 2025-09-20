'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { 
  FinancialCategory, 
  FinancialCategoryFormData,
  DREGroup, 
  DREGroupFormData,
  FinancialAccount,
  FinancialAccountFormData,
  ConfigTabType
} from '../../types/config';

interface ConfigModalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<boolean>;
  title: string;
  type: ConfigTabType;
  item?: FinancialCategory | DREGroup | FinancialAccount | null;
  dreGroups?: DREGroup[];
}

export const ConfigModalSidebar: React.FC<ConfigModalSidebarProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  type,
  item,
  dreGroups = []
}) => {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form quando modal abre/fecha ou item muda
  useEffect(() => {
    if (isOpen && item) {
      if (type === 'categories') {
        const category = item as FinancialCategory;
        setFormData({
          description: category.description || '',
          dre_groups_id: category.dre_groups_id || ''
        });
      } else if (type === 'groups') {
        const group = item as DREGroup;
        setFormData({
          description: group.description || '',
          sort_order: group.sort_order || 0
        });
      } else if (type === 'accounts') {
        const account = item as FinancialAccount;
        setFormData({
          description: account.description || ''
        });
      }
    } else if (isOpen) {
      // Novo item
      if (type === 'categories') {
        setFormData({ description: '', dre_groups_id: '' });
      } else if (type === 'groups') {
        setFormData({ description: '', sort_order: 0 });
      } else {
        setFormData({ description: '' });
      }
    }
    setErrors({});
  }, [isOpen, item, type]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description?.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (type === 'groups' && (formData.sort_order === undefined || formData.sort_order === null)) {
      newErrors.sort_order = 'Ordem é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-slate-800 shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Descrição *
              </label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.description ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Digite a descrição..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Campo específico para Categorias - Grupo DRE */}
            {type === 'categories' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Grupo DRE
                </label>
                <select
                  value={formData.dre_groups_id || ''}
                  onChange={(e) => setFormData({ ...formData, dre_groups_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Selecione um grupo (opcional)</option>
                  {dreGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.description}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Campo específico para Grupos - Ordem */}
            {type === 'groups' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ordem de Exibição *
                </label>
                <input
                  type="number"
                  value={formData.sort_order || 0}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    errors.sort_order ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.sort_order && (
                  <p className="mt-1 text-sm text-red-500">{errors.sort_order}</p>
                )}
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Menor número aparece primeiro
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};