'use client';

import React, { useState, useEffect } from 'react';
import { Target, Save, Loader2, User, Building2, Thermometer, Navigation } from 'lucide-react';
import { LeadEditData, LeadUpdatePayload, LeadKanbanStage, User as UserType } from '../types/leads';
import { ModalSidebar } from '../../../shared/components/ModalSidebar';
import { getBpoSideUsers } from '../services/usersService';

interface LeadEditModalProps {
  isOpen: boolean;
  leadData: LeadEditData | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (data: LeadUpdatePayload) => Promise<boolean>;
  isCreating?: boolean;
}

export const LeadEditModal: React.FC<LeadEditModalProps> = ({
  isOpen,
  leadData,
  loading,
  saving,
  error,
  onClose,
  onSave,
  isCreating = false,
}) => {
  const [formData, setFormData] = useState<LeadUpdatePayload>({});
  const [activeTab, setActiveTab] = useState<'contato' | 'empresa' | 'config'>('contato');
  const [bpoUsers, setBpoUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Inicializa form data
  useEffect(() => {
    if (!isOpen) {
      // Limpar dados quando modal fechar
      setFormData({});
      setActiveTab('contato');
      return;
    }

    if (isCreating) {
      // Valores padrão para criação
      setFormData({
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        contact_role: '',
        company_name: '',
        segment: '',
        kanban_stage: 'new',
        temperature: 'cold',
        lead_source: '',
        additional_contact_email: '',
        additional_contact_phone: '',
        notes: '',
        assigned_salesperson_id: '',
        city: '',
        state: '',
      });
    } else if (leadData) {
      // Dados existentes para edição
      setFormData({
        contact_name: leadData.contact_name || '',
        contact_email: leadData.contact_email || '',
        contact_phone: leadData.contact_phone || '',
        contact_role: leadData.contact_role || '',
        company_name: leadData.company_name || '',
        segment: leadData.segment || '',
        kanban_stage: leadData.kanban_stage || 'new',
        temperature: leadData.temperature || 'cold',
        lead_source: leadData.lead_source || '',
        additional_contact_email: leadData.additional_contact_email || '',
        additional_contact_phone: leadData.additional_contact_phone || '',
        notes: leadData.notes || '',
        assigned_salesperson_id: leadData.assigned_salesperson_id || '',
        city: leadData.city || '',
        state: leadData.state || '',
      });
    }
  }, [leadData, isCreating, isOpen]);

  // Carregar usuários BPO ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      loadBpoUsers();
    }
  }, [isOpen]);

  const loadBpoUsers = async () => {
    setLoadingUsers(true);
    try {
      console.log('🔍 Carregando usuários BPO...');
      const users = await getBpoSideUsers();
      console.log('✅ Usuários BPO carregados:', users);
      setBpoUsers(users);
    } catch (error) {
      console.error('❌ Erro ao carregar usuários BPO:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSave(formData);
    if (success) {
      onClose();
    }
  };

  const updateFormData = (field: keyof LeadUpdatePayload, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'contato' as const, label: 'Contato', icon: User },
    { id: 'empresa' as const, label: 'Empresa', icon: Building2 },
    { id: 'config' as const, label: 'Configurações', icon: Thermometer },
  ];

  const footer = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        disabled={saving}
        className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="lead-form"
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {isCreating ? 'Criar Lead' : 'Salvar Alterações'}
      </button>
    </div>
  );

  return (
    <ModalSidebar
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? 'Novo Lead' : 'Editar Lead'}
      subtitle={isCreating ? 'Criar um novo lead no funil' : 'Editar informações do lead'}
      icon={Target}
      footer={footer}
      width="lg"
    >
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <form id="lead-form" onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Error */}
          {error && (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Tab Content */}
          <div className="flex-1 p-6 space-y-6">
            {activeTab === 'contato' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Informações de Contato
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nome do Contato *
                    </label>
                    <input
                      type="text"
                      value={formData.contact_name || ''}
                      onChange={(e) => updateFormData('contact_name', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email || ''}
                      onChange={(e) => updateFormData('contact_email', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>


                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_phone || ''}
                        onChange={(e) => updateFormData('contact_phone', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Cargo
                      </label>
                      <input
                        type="text"
                        value={formData.contact_role || ''}
                        onChange={(e) => updateFormData('contact_role', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        placeholder="Ex: Gerente, Diretor"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Email Adicional
                      </label>
                      <input
                        type="email"
                        value={formData.additional_contact_email || ''}
                        onChange={(e) => updateFormData('additional_contact_email', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Telefone Adicional
                      </label>
                      <input
                        type="tel"
                        value={formData.additional_contact_phone || ''}
                        onChange={(e) => updateFormData('additional_contact_phone', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'empresa' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Informações da Empresa
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nome da Empresa *
                    </label>
                    <input
                      type="text"
                      value={formData.company_name || ''}
                      onChange={(e) => updateFormData('company_name', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      required
                    />
                  </div>


                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Segmento
                      </label>
                      <input
                        type="text"
                        value={formData.segment || ''}
                        onChange={(e) => updateFormData('segment', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        placeholder="Ex: Tecnologia, Varejo, Saúde"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        placeholder="Ex: São Paulo"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.state || ''}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="">Selecione o estado</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'config' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Configurações do Lead
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Estágio
                      </label>
                      <select
                        value={formData.kanban_stage || 'new'}
                        onChange={(e) => updateFormData('kanban_stage', e.target.value as LeadKanbanStage)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      >
                        <option value="new">Oportunidades</option>
                        <option value="contacted">Contatados</option>
                        <option value="qualified">Qualificados</option>
                        <option value="scheduled">Agendados</option>
                        <option value="lost">Perdidos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Temperatura
                      </label>
                      <select
                        value={formData.temperature || 'cold'}
                        onChange={(e) => updateFormData('temperature', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      >
                        <option value="cold">❄️ Frio</option>
                        <option value="warm">🌡️ Morno</option>
                        <option value="hot">🔥 Quente</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Fonte do Lead
                    </label>
                    <select
                      value={formData.lead_source || ''}
                      onChange={(e) => updateFormData('lead_source', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="">Selecione a fonte</option>
                      <option value="site">Site</option>
                      <option value="indicacao">Indicação</option>
                      <option value="redes_sociais">Redes Sociais</option>
                      <option value="evento">Evento</option>
                      <option value="telemarketing">Telemarketing</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Responsável
                    </label>
                    <div className="relative">
                      <select
                        value={formData.assigned_salesperson_id || ''}
                        onChange={(e) => updateFormData('assigned_salesperson_id', e.target.value)}
                        disabled={loadingUsers}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-50"
                      >
                        <option value="">
                          {loadingUsers ? 'Carregando usuários...' : 'Selecione o responsável'}
                        </option>
                        {bpoUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                      {loadingUsers && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                        </div>
                      )}
                    </div>
                    {!loadingUsers && bpoUsers.length === 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        Nenhum usuário BPO encontrado. Verifique se existem usuários ativos com role 'bpo_side'.
                      </p>
                    )}
                    {!loadingUsers && bpoUsers.length > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {bpoUsers.length} usuário{bpoUsers.length !== 1 ? 's' : ''} encontrado{bpoUsers.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Observações
                    </label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => updateFormData('notes', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      placeholder="Adicione observações sobre o lead..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      )}
    </ModalSidebar>
  );
};