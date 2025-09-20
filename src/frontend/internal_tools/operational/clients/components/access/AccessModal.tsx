'use client';

import React, { useState, useEffect } from 'react';
import { Save, Key, Eye, EyeOff } from 'lucide-react';
import { ModalSidebar } from '../../../../shared/components/ModalSidebar';
import { ClientAccess, ClientAccessFormData } from '../../types/access';

interface AccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClientAccessFormData) => Promise<boolean>;
  access?: ClientAccess | null;
  title?: string;
}

export const AccessModal: React.FC<AccessModalProps> = ({
  isOpen,
  onClose,
  onSave,
  access,
  title,
}) => {
  const [formData, setFormData] = useState<ClientAccessFormData>({
    description: '',
    login: '',
    password: '',
    url: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (access) {
      setFormData({
        description: access.description,
        login: access.login,
        password: access.password,
        url: access.url || '',
      });
    } else {
      setFormData({
        description: '',
        login: '',
        password: '',
        url: '',
      });
    }
    setErrors({});
    setShowPassword(false);
  }, [access, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.login.trim()) {
      newErrors.login = 'Login é obrigatório';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }

    if (formData.url && !isValidUrl(formData.url)) {
      newErrors.url = 'URL inválida (deve começar com http:// ou https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving access:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ClientAccessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const footerContent = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="access-form"
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </div>
  );

  return (
    <ModalSidebar
      isOpen={isOpen}
      onClose={onClose}
      title={title || (access ? 'Editar Acesso' : 'Novo Acesso')}
      subtitle={access ? 'Atualize as informações do acesso' : 'Preencha os dados para criar um novo acesso'}
      icon={Key}
      width="lg"
      footer={footerContent}
    >
      <div className="p-6">
        <form id="access-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do Acesso */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Informações do Acesso
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Portal do Banco, Sistema Contábil, etc."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Login/Usuário *
                </label>
                <input
                  type="text"
                  value={formData.login}
                  onChange={(e) => handleInputChange('login', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.login ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Digite o login ou usuário"
                />
                {errors.login && <p className="text-red-500 text-xs mt-1">{errors.login}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Senha *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite a senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL (Opcional)
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.url ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://exemplo.com"
                />
                {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}
              </div>
            </div>
          </div>
        </form>
      </div>
    </ModalSidebar>
  );
};