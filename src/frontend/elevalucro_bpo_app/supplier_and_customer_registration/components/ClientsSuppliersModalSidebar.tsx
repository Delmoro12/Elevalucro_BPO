'use client';

import React, { useState, useEffect } from 'react';
import { Save, UserPlus } from 'lucide-react';
import { ModalSidebar } from '../../shared/components/ModalSidebar';
import { ClientSupplier, ClientSupplierFormData } from '../types/clientsSuppliers';

interface ClientsSuppliersModalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClientSupplierFormData) => Promise<boolean>;
  clientSupplier?: ClientSupplier | null;
  mode?: 'create' | 'edit' | 'view';
  companyId: string;
}

export const ClientsSuppliersModalSidebar: React.FC<ClientsSuppliersModalSidebarProps> = ({
  isOpen,
  onClose,
  onSave,
  clientSupplier,
  mode = 'create',
  companyId,
}) => {
  const [formData, setFormData] = useState<ClientSupplierFormData>({
    name: '',
    type: 'client',
    cnpj: '',
    cpf: '',
    email_billing: '',
    whatsapp: '',
    phone: '',
    pix: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    observations: '',
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';

  useEffect(() => {
    if (clientSupplier) {
      setFormData({
        name: clientSupplier.name,
        type: clientSupplier.type,
        cnpj: clientSupplier.cnpj || '',
        cpf: clientSupplier.cpf || '',
        email_billing: clientSupplier.email_billing || '',
        whatsapp: clientSupplier.whatsapp || '',
        phone: clientSupplier.phone || '',
        pix: clientSupplier.pix || '',
        address: clientSupplier.address || '',
        city: clientSupplier.city || '',
        state: clientSupplier.state || '',
        zip_code: clientSupplier.zip_code || '',
        observations: clientSupplier.observations || '',
        is_active: clientSupplier.is_active,
      });
    } else {
      setFormData({
        name: '',
        type: 'client',
        cnpj: '',
        cpf: '',
        email_billing: '',
        whatsapp: '',
        phone: '',
        pix: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        observations: '',
        is_active: true,
      });
    }
    setErrors({});
  }, [clientSupplier, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.type) {
      newErrors.type = 'Tipo é obrigatório';
    }

    if (!formData.cnpj?.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    }

    if (formData.email_billing && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_billing)) {
      newErrors.email_billing = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isViewMode) return;
    
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
      console.error('Error saving client/supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funções de máscara
  const maskCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const maskCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const handleInputChange = (field: keyof ClientSupplierFormData, value: string | boolean) => {
    if (isViewMode) return;
    
    if (typeof value === 'string') {
      let maskedValue = value;
      
      switch (field) {
        case 'cnpj':
          maskedValue = maskCNPJ(value);
          break;
        case 'cpf':
          maskedValue = maskCPF(value);
          break;
        case 'whatsapp':
        case 'phone':
          maskedValue = maskPhone(value);
          break;
        case 'zip_code':
          maskedValue = maskCEP(value);
          break;
        case 'state':
          maskedValue = value.toUpperCase().slice(0, 2);
          break;
      }
      
      setFormData(prev => ({ ...prev, [field]: maskedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getTitle = () => {
    if (isViewMode) return 'Visualizar Cliente/Fornecedor';
    if (isEditMode) return 'Editar Cliente/Fornecedor';
    return 'Novo Cliente/Fornecedor';
  };

  const getSubtitle = () => {
    if (isViewMode) return 'Informações do cadastro';
    if (isEditMode) return 'Atualize as informações do cadastro';
    return 'Preencha os dados para criar um novo cadastro';
  };

  const footerContent = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600"
      >
        {isViewMode ? 'Fechar' : 'Cancelar'}
      </button>
      {!isViewMode && (
        <button
          type="submit"
          form="client-supplier-form"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      )}
    </div>
  );

  return (
    <ModalSidebar
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      subtitle={getSubtitle()}
      icon={UserPlus}
      width="lg"
      footer={footerContent}
    >
      <div className="p-6">
        <form id="client-supplier-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Informações Básicas
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome/Razão Social *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } ${isViewMode ? 'bg-gray-50 dark:bg-slate-600' : ''}`}
                  placeholder="Digite o nome ou razão social"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as 'client' | 'supplier')}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  } ${isViewMode ? 'bg-gray-50 dark:bg-slate-600' : ''}`}
                >
                  <option value="client">Cliente</option>
                  <option value="supplier">Fornecedor</option>
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    disabled={isViewMode}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Ativo
                </label>
              </div>
            </div>
          </div>

          {/* Documentos */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Documentos
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CNPJ *
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  disabled={isViewMode}
                  maxLength={18}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.cnpj ? 'border-red-500' : 'border-gray-300'
                  } ${isViewMode ? 'bg-gray-50 dark:bg-slate-600' : ''}`}
                  placeholder="00.000.000/0000-00"
                />
                {errors.cnpj && <p className="text-red-500 text-xs mt-1">{errors.cnpj}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  disabled={isViewMode}
                  maxLength={14}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white border-gray-300 ${
                    isViewMode ? 'bg-gray-50 dark:bg-slate-600' : ''
                  }`}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
          </div>

          {/* Contatos */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Contatos
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email para Cobrança
                </label>
                <input
                  type="email"
                  value={formData.email_billing}
                  onChange={(e) => handleInputChange('email_billing', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                    errors.email_billing ? 'border-red-500' : 'border-gray-300'
                  } ${isViewMode ? 'bg-gray-50 dark:bg-slate-600' : ''}`}
                  placeholder="email@exemplo.com"
                />
                {errors.email_billing && <p className="text-red-500 text-xs mt-1">{errors.email_billing}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white border-gray-300 ${
                    isViewMode ? 'bg-gray-50 dark:bg-slate-600' : ''
                  }`}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white border-gray-300 ${
                    isViewMode ? 'bg-gray-50 dark:bg-slate-600' : ''
                  }`}
                  placeholder="(00) 0000-0000"
                />
              </div>
            </div>
          </div>

          {/* Informações Financeiras */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Informações Financeiras
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                PIX
              </label>
              <input
                type="text"
                value={formData.pix}
                onChange={(e) => handleInputChange('pix', e.target.value)}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white border-gray-300 ${
                  isViewMode ? 'bg-gray-50 dark:bg-slate-600' : ''
                }`}
                placeholder="CPF, CNPJ, email ou telefone"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Endereço
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white border-gray-300 ${
                    isViewMode ? 'bg-gray-50 dark:bg-slate-600' : ''
                  }`}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white border-gray-300 ${
                    isViewMode ? 'bg-gray-50 dark:bg-slate-600' : ''
                  }`}
                  placeholder="Nome da cidade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  disabled={isViewMode}
                  maxLength={2}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white border-gray-300 ${
                    isViewMode ? 'bg-gray-50 dark:bg-slate-600' : ''
                  }`}
                  placeholder="SP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  disabled={isViewMode}
                  maxLength={9}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white border-gray-300 ${
                    isViewMode ? 'bg-gray-50 dark:bg-slate-600' : ''
                  }`}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Observações
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observações Gerais
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
                disabled={isViewMode}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white border-gray-300 ${
                  isViewMode ? 'bg-gray-50 dark:bg-slate-600' : ''
                }`}
                placeholder="Informações adicionais sobre o cliente/fornecedor"
              />
            </div>
          </div>
        </form>
      </div>
    </ModalSidebar>
  );
};