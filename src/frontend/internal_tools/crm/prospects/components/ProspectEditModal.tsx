import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Save, 
  User, 
  Building2, 
  MapPin, 
  Settings, 
  Target,
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';
import { ProspectEditData, ProspectUpdatePayload, ProspectStatus } from '../types/prospects';

interface ProspectEditModalProps {
  isOpen: boolean;
  prospectData: ProspectEditData | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (data: ProspectUpdatePayload) => Promise<boolean>;
}

export const ProspectEditModal: React.FC<ProspectEditModalProps> = ({
  isOpen,
  prospectData,
  loading,
  saving,
  error,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ProspectUpdatePayload>({});
  const [activeTab, setActiveTab] = useState<'contato' | 'empresa' | 'endereco' | 'tecnico' | 'plano'>('contato');

  // Inicializa form data quando prospect data carrega
  useEffect(() => {
    if (prospectData) {
      setFormData({
        contact_name: prospectData.contact_name,
        contact_cpf: prospectData.contact_cpf,
        contact_email: prospectData.contact_email,
        contact_phone: prospectData.contact_phone || '',
        contact_role: prospectData.contact_role || '',
        company_name: prospectData.company_name,
        cnpj: prospectData.cnpj,
        address: prospectData.address || '',
        number: prospectData.number || '',
        neighborhood: prospectData.neighborhood || '',
        zip_code: prospectData.zip_code || '',
        city: prospectData.city || '',
        state: prospectData.state || '',
        segment: prospectData.segment || '',
        areas: prospectData.areas || [],
        banks: prospectData.banks || [],
        tools: prospectData.tools || [],
        suppliers: prospectData.suppliers || [],
        organization: prospectData.organization || [],
        reports: prospectData.reports || [],
        success_expectations: prospectData.success_expectations || '',
        plan: prospectData.plan,
        monthly_value: prospectData.monthly_value,
        status: prospectData.status,
        source: prospectData.source || '',
        notes: prospectData.notes || '',
      });
    }
  }, [prospectData]);

  // Definir áreas por plano
  const areasPorPlano = {
    controle: [
      "categorias_centros_custos",
      "budget_anual",
      "contas_pagar",
      "contas_receber",
      "conciliacao_bancaria",
      "organizacao_documentos"
    ],
    gerencial: [
      // Inclui todas do Controle
      "categorias_centros_custos",
      "budget_anual",
      "contas_pagar",
      "contas_receber",
      "conciliacao_bancaria",
      "organizacao_documentos",
      // Adiciona do Gerencial
      "cobranca_inadimplentes",
      "emissao_boletos",
      "relatorio_fluxo_caixa",
      "relatorios_entradas_saidas",
      "caixa_diario",
      "dre_indicadores"
    ],
    avancado: [
      // Inclui todas do Gerencial
      "categorias_centros_custos",
      "budget_anual",
      "contas_pagar",
      "contas_receber",
      "conciliacao_bancaria",
      "organizacao_documentos",
      "cobranca_inadimplentes",
      "emissao_boletos",
      "relatorio_fluxo_caixa",
      "relatorios_entradas_saidas",
      "caixa_diario",
      "dre_indicadores",
      // Adiciona do Avançado
      "analise_dre_consultor",
      "analise_margens_consultor",
      "analise_fluxo_consultor",
      "acoes_estrategicas"
    ]
  };

  // Definir valores por plano
  const valoresPorPlano = {
    controle: 950,
    gerencial: 1300,
    avancado: 1700
  };

  const handleInputChange = useCallback((field: keyof ProspectUpdatePayload, value: any) => {
    // Se está mudando o plano, atualizar automaticamente as áreas e valor
    if (field === 'plan' && (value === 'controle' || value === 'gerencial' || value === 'avancado')) {
      const novasAreas = areasPorPlano[value as keyof typeof areasPorPlano];
      const novoValor = valoresPorPlano[value as keyof typeof valoresPorPlano];
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        areas: novasAreas,
        monthly_value: novoValor
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  const handleCheckboxToggle = useCallback((field: 'banks' | 'tools' | 'organization', item: string) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      const newArray = currentArray.includes(item) 
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      return { ...prev, [field]: newArray };
    });
  }, []);

  const handleCheckboxClick = useCallback((e: React.MouseEvent, field: 'banks' | 'tools' | 'organization', item: string) => {
    e.preventDefault();
    e.stopPropagation();
    handleCheckboxToggle(field, item);
  }, [handleCheckboxToggle]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSave(formData);
    if (success) {
      onClose();
    }
  };

  const statusOptions: { value: ProspectStatus; label: string }[] = [
    { value: 'pending', label: 'Pendente' },
    { value: 'contacted', label: 'Contatado' },
    { value: 'contract_sent', label: 'Contrato Enviado' },
    { value: 'signed', label: 'Assinado' },
    { value: 'rejected', label: 'Rejeitado' },
  ];

  const planoOptions = [
    { value: 'controle', label: 'Controle' },
    { value: 'gerencial', label: 'Gerencial' },
    { value: 'avancado', label: 'Avançado' },
  ];

  const estadoOptions = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const tabs = [
    { id: 'contato', label: 'Contato', icon: User },
    { id: 'empresa', label: 'Empresa', icon: Building2 },
    { id: 'endereco', label: 'Endereço', icon: MapPin },
    { id: 'tecnico', label: 'Técnico', icon: Settings },
    { id: 'plano', label: 'Plano', icon: Target },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-slate-800 shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Editar Prospect
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {prospectData?.contact_name} - {prospectData?.company_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700 px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <span className="ml-2 text-slate-600 dark:text-slate-400">Carregando...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                {/* Erro */}
                {error && (
                  <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Tab Content: Contato */}
                {activeTab === 'contato' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          value={formData.contact_name || ''}
                          onChange={(e) => handleInputChange('contact_name', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          CPF *
                        </label>
                        <input
                          type="text"
                          value={formData.contact_cpf || ''}
                          onChange={(e) => handleInputChange('contact_cpf', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.contact_email || ''}
                          onChange={(e) => handleInputChange('contact_email', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          value={formData.contact_phone || ''}
                          onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Cargo
                        </label>
                        <input
                          type="text"
                          value={formData.contact_role || ''}
                          onChange={(e) => handleInputChange('contact_role', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content: Empresa */}
                {activeTab === 'empresa' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Nome da Empresa *
                        </label>
                        <input
                          type="text"
                          value={formData.company_name || ''}
                          onChange={(e) => handleInputChange('company_name', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          CNPJ *
                        </label>
                        <input
                          type="text"
                          value={formData.cnpj || ''}
                          onChange={(e) => handleInputChange('cnpj', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Segmento
                        </label>
                        <input
                          type="text"
                          value={formData.segment || ''}
                          onChange={(e) => handleInputChange('segment', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content: Endereço */}
                {activeTab === 'endereco' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Endereço
                        </label>
                        <input
                          type="text"
                          value={formData.address || ''}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Número
                        </label>
                        <input
                          type="text"
                          value={formData.number || ''}
                          onChange={(e) => handleInputChange('number', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={formData.neighborhood || ''}
                          onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          CEP
                        </label>
                        <input
                          type="text"
                          value={formData.zip_code || ''}
                          onChange={(e) => handleInputChange('zip_code', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Cidade
                        </label>
                        <input
                          type="text"
                          value={formData.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Estado
                        </label>
                        <select
                          value={formData.state || ''}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                          <option value="">Selecione...</option>
                          {estadoOptions.map(estado => (
                            <option key={estado} value={estado}>{estado}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content: Técnico */}
                {activeTab === 'tecnico' && (
                  <div className="space-y-8">
                    {/* Áreas */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                        Áreas de Atuação do Plano
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                        {[
                          // Plano Controle
                          { value: "categorias_centros_custos", label: "Elaboração/revisão de categorias e centros de custos" },
                          { value: "budget_anual", label: "Elaboração/revisão do budget anual de despesas fixas" },
                          { value: "contas_pagar", label: "Lançamento e pagamentos de Contas a Pagar" },
                          { value: "contas_receber", label: "Lançamento e recebimentos de Contas a Receber" },
                          { value: "conciliacao_bancaria", label: "Conciliação bancária (cartão, PIX, boletos)" },
                          { value: "organizacao_documentos", label: "Organização e envio de documentos fiscais" },
                          
                          // Plano Gerencial (adiciona aos do Controle)
                          { value: "cobranca_inadimplentes", label: "Cobrança de inadimplentes" },
                          { value: "emissao_boletos", label: "Emissão de boletos" },
                          { value: "relatorio_fluxo_caixa", label: "Relatório de fluxo de caixa" },
                          { value: "relatorios_entradas_saidas", label: "Relatórios de entradas e saídas" },
                          { value: "caixa_diario", label: "Caixa diário" },
                          { value: "dre_indicadores", label: "DRE e indicadores de receitas e despesas por categoria" },
                          
                          // Plano Avançado (adiciona aos do Gerencial)
                          { value: "analise_dre_consultor", label: "Análise mensal do DRE e indicadores com consultor" },
                          { value: "analise_margens_consultor", label: "Análise mensal de margens e lucratividade com consultor" },
                          { value: "analise_fluxo_consultor", label: "Análise mensal do fluxo de caixa com consultor" },
                          { value: "acoes_estrategicas", label: "Suporte para definição das ações estratégicas relacionadas às análises" },
                        ].map(area => (
                          <div key={area.value} className="flex items-center py-1">
                            {(formData.areas || []).includes(area.value) ? (
                              <Check className="w-4 h-4 text-emerald-500 mr-3 flex-shrink-0" />
                            ) : (
                              <div className="w-4 h-4 mr-3 flex-shrink-0" />
                            )}
                            <span className={`text-sm ${
                              (formData.areas || []).includes(area.value)
                                ? 'text-slate-900 dark:text-white' 
                                : 'text-slate-400 dark:text-slate-500 line-through'
                            }`}>
                              {area.label}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-700/30 rounded-lg p-3 mt-3">
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          <strong>Nota:</strong> As áreas são definidas automaticamente pelo plano selecionado.
                          Para alterar as áreas, mude o plano na aba "Plano".
                        </p>
                      </div>
                    </div>

                    {/* Bancos */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                        Bancos Utilizados
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          "Banco do Brasil", "Bradesco", "Itaú", "Santander", "Caixa",
                          "Sicoob", "Sicredi", "Inter", "Nubank", "C6 Bank",
                          "BTG Pactual", "Safra", "Outro"
                        ].map(banco => (
                          <div key={banco} 
                            onClick={(e) => handleCheckboxClick(e, 'banks', banco)}
                            className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-600/30 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-600 hover:border-emerald-500/30 transition-all duration-200"
                          >
                            <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                              (formData.banks || []).includes(banco)
                                ? 'border-emerald-400 bg-emerald-400' 
                                : 'border-slate-400 dark:border-slate-500'
                            }`}>
                              {(formData.bancos || []).includes(banco) && (
                                <Check className="w-2.5 h-2.5 text-white" />
                              )}
                            </div>
                            <span className="text-slate-900 dark:text-white text-sm">{banco}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ferramentas */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                        Ferramentas/Sistemas Utilizados
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          "Excel/Google Sheets", "ERP (SAP, TOTVS, etc)", "Conta Azul", "Omie",
                          "Bling", "Tiny", "NFCom", "EmiteAí", "Nenhum sistema"
                        ].map(ferramenta => (
                          <div key={ferramenta}
                            onClick={(e) => handleCheckboxClick(e, 'tools', ferramenta)}
                            className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-600/30 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-600 hover:border-emerald-500/30 transition-all duration-200"
                          >
                            <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                              (formData.tools || []).includes(ferramenta)
                                ? 'border-emerald-400 bg-emerald-400' 
                                : 'border-slate-400 dark:border-slate-500'
                            }`}>
                              {(formData.ferramentas || []).includes(ferramenta) && (
                                <Check className="w-2.5 h-2.5 text-white" />
                              )}
                            </div>
                            <span className="text-slate-900 dark:text-white text-sm">{ferramenta}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Organização */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                        Organização Financeira Atual
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          "Planilha Excel/Google Sheets",
                          "Sistema ERP integrado",
                          "Software de gestão financeira",
                          "Anotações em caderno/papel",
                          "Não tenho organização definida",
                          "Outro método"
                        ].map(org => (
                          <div key={org}
                            onClick={(e) => handleCheckboxClick(e, 'organization', org)}
                            className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-600/30 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-600 hover:border-emerald-500/30 transition-all duration-200"
                          >
                            <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                              (formData.organization || []).includes(org)
                                ? 'border-emerald-400 bg-emerald-400' 
                                : 'border-slate-400 dark:border-slate-500'
                            }`}>
                              {(formData.organizacao || []).includes(org) && (
                                <Check className="w-2.5 h-2.5 text-white" />
                              )}
                            </div>
                            <span className="text-slate-900 dark:text-white text-sm">{org}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expectativas */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Expectativas de Sucesso
                      </label>
                      <textarea
                        value={formData.success_expectations || ''}
                        onChange={(e) => handleInputChange('success_expectations', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        placeholder="Descreva suas expectativas e objetivos..."
                      />
                    </div>
                  </div>
                )}

                {/* Tab Content: Plano */}
                {activeTab === 'plano' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Plano *
                        </label>
                        <select
                          value={formData.plan || ''}
                          onChange={(e) => handleInputChange('plan', e.target.value as any)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          required
                        >
                          {planoOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          * Alterar o plano atualizará automaticamente as áreas incluídas
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Valor Mensal *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600 dark:text-slate-400">
                            R$
                          </span>
                          <input
                            type="text"
                            value={formData.monthly_value ? formData.monthly_value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                            readOnly
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          * Valor definido automaticamente pelo plano selecionado
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Status
                        </label>
                        <select
                          value={formData.status || ''}
                          onChange={(e) => handleInputChange('status', e.target.value as ProspectStatus)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Origem
                        </label>
                        <input
                          type="text"
                          value={formData.source || ''}
                          onChange={(e) => handleInputChange('source', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Observações
                        </label>
                        <textarea
                          value={formData.notes || ''}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};