'use client';

import React, { useState, useEffect } from 'react';
import { User, Eye, EyeOff } from 'lucide-react';
import { ModalSidebar } from '../../shared/components';
import { BpoUser } from '../types/users';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: BpoUser | null;
  onSubmit: (userData: UserFormData) => Promise<void>;
}

export interface UserFormData {
  action: 'create' | 'update';
  email: string;
  full_name: string;
  password?: string;
  phone?: string;
  whatsapp?: string;
  profile_name: string;
  user_id?: string;
  is_active?: boolean;
}

const PROFILE_OPTIONS = [
  { value: 'BPO Operator', label: 'Operador BPO' },
  { value: 'Vendedor', label: 'Vendedor' },
  { value: 'Customer Success', label: 'Customer Success' },
  { value: 'Analista', label: 'Analista' },
  { value: 'Admin', label: 'Admin' },
];

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    action: 'create',
    email: '',
    full_name: '',
    password: '',
    phone: '',
    whatsapp: '',
    profile_name: 'BPO Operator',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isEditing = Boolean(user);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        action: 'create',
        email: '',
        full_name: '',
        password: '',
        phone: '',
        whatsapp: '',
        profile_name: 'BPO Operator',
        is_active: true,
      });
      setError(null);
      setShowPassword(false);
    } else {
      // Modal is opening
      if (user) {
        // Editing existing user
        setFormData({
          action: 'update',
          user_id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone || '',
          whatsapp: user.whatsapp || '',
          profile_name: user.profile_type || 'BPO Operator',
          is_active: user.is_active,
        });
      } else {
        // Creating new user - ensure fields are empty
        setFormData({
          action: 'create',
          email: '',
          full_name: '',
          password: '',
          phone: '',
          whatsapp: '',
          profile_name: 'BPO Operator',
          is_active: true,
        });
      }
      setError(null);
      setShowPassword(false);
    }
  }, [isOpen, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validations
      if (!formData.full_name || !formData.email || !formData.profile_name) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      if (formData.action === 'create' && !formData.password) {
        throw new Error('Senha é obrigatória para novos usuários');
      }

      if (formData.password && formData.password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }

      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  const title = isEditing ? 'Editar Usuário' : 'Novo Usuário';
  const subtitle = isEditing ? `Editando: ${user?.email}` : 'Criar novo usuário BPO';

  return (
    <ModalSidebar
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={User}
      width="xl"
      footer={
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="user-form"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <div className="text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Email - linha inteira */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isEditing}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white disabled:opacity-70"
              placeholder="usuario@exemplo.com"
            />
          </div>

          {/* Nome Completo - linha inteira */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="João da Silva"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              {/* Senha */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isEditing ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password || ''}
                    onChange={handleChange}
                    required={!isEditing}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder={isEditing ? 'Nova senha (opcional)' : 'Mínimo 6 caracteres'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              {/* Perfil */}
              <div>
                <label htmlFor="profile_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Perfil *
                </label>
                <select
                  id="profile_name"
                  name="profile_name"
                  value={formData.profile_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  {PROFILE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* WhatsApp */}
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Status Ativo (apenas para edição) */}
          {isEditing && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active || false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Usuário ativo
              </label>
            </div>
          )}
        </div>
      </form>
    </ModalSidebar>
  );
};