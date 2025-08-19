"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Building2, CreditCard, Settings, FileText, Target, Users, User, MapPin } from "lucide-react";

interface FormData {
  // Dados pessoais e da empresa
  nomeContato: string;
  cpfContato: string;
  emailContato: string;
  telefoneContato: string;
  cargoContato: string;
  nomeEmpresa: string;
  cnpj: string;
  endereco: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  
  // Dados técnicos
  segmento: string;
  areas: string[];
  bancos: string[];
  ferramentas: string[];
  fornecedores: string[];
  organizacao: string[];
  relatorios: string[];
  
  // Expectativas e objetivos
  expectativasSucesso: string;
  
  // Plano selecionado
  plano: string;
  valorMensal: number;
}

interface PlanConfig {
  name: string;
  value: number;
  displayName: string;
  enabledAreas: string[];
  subtitle: string;
}

interface PreOnboardFormProps {
  planConfig: PlanConfig;
}

export default function PreOnboardForm({ planConfig }: PreOnboardFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    // Dados pessoais e da empresa
    nomeContato: "",
    cpfContato: "",
    emailContato: "",
    telefoneContato: "",
    cargoContato: "",
    nomeEmpresa: "",
    cnpj: "",
    endereco: "",
    numero: "",
    bairro: "",
    cep: "",
    cidade: "",
    estado: "",
    
    // Dados técnicos
    segmento: "",
    // Pré-selecionar todas as áreas habilitadas para cada plano
    areas: planConfig.enabledAreas,
    bancos: [],
    ferramentas: [],
    fornecedores: [],
    organizacao: [],
    relatorios: [],
    
    // Expectativas e objetivos
    expectativasSucesso: "",
    
    // Plano
    plano: planConfig.name,
    valorMensal: planConfig.value
  });

  const steps = [
    { title: "Dados Pessoais", icon: User, subtitle: "Informações do contato" },
    { title: "Dados da Empresa", icon: Building2, subtitle: "Informações da empresa" },
    { title: "Segmento", icon: Target, subtitle: "Área de atuação" },
    { title: "Operações", icon: Settings, subtitle: planConfig.subtitle },
    { title: "Bancos & Ferramentas", icon: CreditCard, subtitle: "Sistemas que você já utiliza" },
    { title: "Organização", icon: FileText, subtitle: "Como organiza seu financeiro hoje" },
    { title: "Finalizar", icon: Check, subtitle: `Confirmar ${planConfig.displayName}` }
  ];

  // Todas as áreas disponíveis baseadas nos planos de vendas
  const todasAreas = [
    // Plano Controle
    { value: "categorias_centros_custos", label: "Elaboração/revisão de categorias (despesas, receitas) e centros de custos" },
    { value: "budget_anual", label: "Elaboração/revisão do budget anual de despesas fixas" },
    { value: "contas_pagar", label: "Lançamento e pagamentos de Contas a Pagar" },
    { value: "contas_receber", label: "Lançamento e recebimentos de Contas a Receber" },
    { value: "conciliacao_bancaria", label: "Conciliação bancária (cartão, PIX, boletos)" },
    { value: "organizacao_documentos", label: "Organização e envio de documentos fiscais para contabilidade" },
    
    // Plano Gerencial (adiciona aos do Controle)
    { value: "cobranca_inadimplentes", label: "Cobrança de inadimplentes (contato ativo com clientes em atraso)" },
    { value: "emissao_nf", label: "Emissão de NF (quando aplicável)" },
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
  ];

  const handleCheckboxChange = (field: keyof FormData, value: string) => {
    // Só permite seleção se a área estiver habilitada para este plano
    if (field === 'areas' && !planConfig.enabledAreas.includes(value)) {
      return; // Não faz nada se a área não estiver habilitada
    }

    // Se for plano Avançado e campo áreas, não permite desmarcar
    if (field === 'areas' && planConfig.name === "AVANÇADO") {
      return; // Não permite alteração no plano Avançado
    }

    setFormData(prev => ({
      ...prev,
      [field]: Array.isArray(prev[field])
        ? (prev[field] as string[]).includes(value)
          ? (prev[field] as string[]).filter(item => item !== value)
          : [...(prev[field] as string[]), value]
        : [value]
    }));
  };

  const handleRadioChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Máscaras para formatação
  const maskCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const maskCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2')
      .slice(0, 14);
  };

  const handleMaskedInputChange = (field: keyof FormData, value: string, maskFunction?: (value: string) => string) => {
    const maskedValue = maskFunction ? maskFunction(value) : value;
    setFormData(prev => ({ ...prev, [field]: maskedValue }));
  };

  const estadosBrasil = [
    { value: 'AC', label: 'AC - Acre' },
    { value: 'AL', label: 'AL - Alagoas' },
    { value: 'AP', label: 'AP - Amapá' },
    { value: 'AM', label: 'AM - Amazonas' },
    { value: 'BA', label: 'BA - Bahia' },
    { value: 'CE', label: 'CE - Ceará' },
    { value: 'DF', label: 'DF - Distrito Federal' },
    { value: 'ES', label: 'ES - Espírito Santo' },
    { value: 'GO', label: 'GO - Goiás' },
    { value: 'MA', label: 'MA - Maranhão' },
    { value: 'MT', label: 'MT - Mato Grosso' },
    { value: 'MS', label: 'MS - Mato Grosso do Sul' },
    { value: 'MG', label: 'MG - Minas Gerais' },
    { value: 'PA', label: 'PA - Pará' },
    { value: 'PB', label: 'PB - Paraíba' },
    { value: 'PR', label: 'PR - Paraná' },
    { value: 'PE', label: 'PE - Pernambuco' },
    { value: 'PI', label: 'PI - Piauí' },
    { value: 'RJ', label: 'RJ - Rio de Janeiro' },
    { value: 'RN', label: 'RN - Rio Grande do Norte' },
    { value: 'RS', label: 'RS - Rio Grande do Sul' },
    { value: 'RO', label: 'RO - Rondônia' },
    { value: 'RR', label: 'RR - Roraima' },
    { value: 'SC', label: 'SC - Santa Catarina' },
    { value: 'SP', label: 'SP - São Paulo' },
    { value: 'SE', label: 'SE - Sergipe' },
    { value: 'TO', label: 'TO - Tocantins' }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log(`Dados do formulário - Plano ${planConfig.displayName}:`, formData);
    alert(`Formulário do Plano ${planConfig.displayName} enviado com sucesso! 
    
    Plano: ${formData.plano}
    Valor: R$ ${formData.valorMensal.toLocaleString()},00/mês
    
    Entraremos em contato em breve.`);
  };

  const renderProgressBar = () => {
    const progress = ((currentStep + 1) / steps.length) * 100;
    return (
      <div className="w-full bg-slate-800 rounded-full h-2 mb-8">
        <div 
          className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8 overflow-x-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full transition-all duration-300
                ${index <= currentStep 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-800 text-slate-500 border border-slate-700'}
              `}>
                <Icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-8 md:w-12 h-0.5 transition-all duration-300
                  ${index < currentStep ? 'bg-emerald-500' : 'bg-slate-700'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const CheckboxOption = ({ field, value, label }: { field: keyof FormData, value: string, label: string }) => {
    const isChecked = Array.isArray(formData[field]) && (formData[field] as string[]).includes(value);
    const isEnabled = field !== 'areas' || planConfig.enabledAreas.includes(value);
    const isAdvancedPlan = planConfig.name === "AVANÇADO";
    const isAdvancedArea = field === 'areas' && isAdvancedPlan && isEnabled;
    
    return (
      <label className={`
        flex items-center p-4 rounded-xl border-2 transition-all duration-200 
        ${isEnabled && !isAdvancedArea ? 'cursor-pointer hover:border-emerald-400/50' : 'cursor-default'}
        ${!isEnabled ? 'opacity-60' : ''}
        ${isAdvancedArea ? 'cursor-default' : ''}
        ${isChecked && isEnabled ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800/50'}
      `}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => handleCheckboxChange(field, value)}
          disabled={!isEnabled || isAdvancedArea}
          className="sr-only"
        />
        <div className={`
          w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200
          ${isChecked && isEnabled ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'}
          ${!isEnabled ? 'border-slate-700 bg-slate-800' : ''}
        `}>
          {isChecked && isEnabled && <Check className="w-3 h-3 text-white" />}
          {!isEnabled && <span className="text-xs text-slate-500">✕</span>}
        </div>
        <span className={`${isChecked && isEnabled ? 'text-white' : 'text-slate-300'} ${!isEnabled ? 'text-slate-500' : ''}`}>
          {label}
          {!isEnabled && <span className="ml-2 text-xs">(Não disponível neste plano)</span>}
          {isAdvancedArea && <span className="ml-2 text-xs text-emerald-400">(Incluído automaticamente)</span>}
        </span>
      </label>
    );
  };

  const RadioOption = ({ field, value, label }: { field: keyof FormData, value: string, label: string }) => {
    const isChecked = formData[field] === value;
    
    return (
      <label className={`
        flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-emerald-400/50
        ${isChecked ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800/50'}
      `}>
        <input
          type="radio"
          checked={isChecked}
          onChange={() => handleRadioChange(field, value)}
          className="sr-only"
        />
        <div className={`
          w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200
          ${isChecked ? 'border-emerald-500' : 'border-slate-600'}
        `}>
          {isChecked && <div className="w-3 h-3 rounded-full bg-emerald-500" />}
        </div>
        <span className={`${isChecked ? 'text-white' : 'text-slate-300'}`}>{label}</span>
      </label>
    );
  };

  const isStepValid = () => {
    // Desabilitar validação para facilitar navegação durante testes
    return true;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-emerald-300 mb-4">Informações de contato</h3>
            <p className="text-slate-400 mb-6">Preencha seus dados para contato</p>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome completo <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nomeContato}
                    onChange={(e) => handleInputChange("nomeContato", e.target.value)}
                    placeholder="João Silva"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    CPF <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cpfContato}
                    onChange={(e) => handleMaskedInputChange("cpfContato", e.target.value, maskCPF)}
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    E-mail corporativo <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.emailContato}
                    onChange={(e) => handleInputChange("emailContato", e.target.value)}
                    placeholder="joao@empresa.com.br"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Telefone/WhatsApp <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.telefoneContato}
                    onChange={(e) => handleMaskedInputChange("telefoneContato", e.target.value, maskPhone)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cargo <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cargoContato}
                    onChange={(e) => handleInputChange("cargoContato", e.target.value)}
                    placeholder="Diretor Financeiro"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-emerald-300 mb-4">Dados da empresa</h3>
            <p className="text-slate-400 mb-6">Informações necessárias para elaboração do contrato</p>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Razão social ou nome da empresa <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nomeEmpresa}
                    onChange={(e) => handleInputChange("nomeEmpresa", e.target.value)}
                    placeholder="Empresa LTDA"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    CNPJ <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => handleMaskedInputChange("cnpj", e.target.value, maskCNPJ)}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    CEP <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => handleMaskedInputChange("cep", e.target.value, maskCEP)}
                    placeholder="00000-000"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cidade <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange("cidade", e.target.value)}
                    placeholder="São Paulo"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Endereço <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange("endereco", e.target.value)}
                    placeholder="Rua das Flores"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Número <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => handleInputChange("numero", e.target.value)}
                    placeholder="123"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bairro <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bairro}
                    onChange={(e) => handleInputChange("bairro", e.target.value)}
                    placeholder="Centro"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Estado <span className="text-emerald-400">*</span>
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => handleInputChange("estado", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  >
                    <option value="">Selecione</option>
                    {estadosBrasil.map(estado => (
                      <option key={estado.value} value={estado.value}>{estado.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-emerald-300 mb-4">Segmento de atuação da sua empresa</h3>
            <p className="text-slate-400 mb-6">Escolha apenas um segmento principal</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RadioOption field="segmento" value="agencia" label="Agência de Marketing" />
              <RadioOption field="segmento" value="clinica" label="Clínica (médica, odontológica, estética, etc.)" />
              <RadioOption field="segmento" value="hotelaria" label="Hotelaria" />
              <RadioOption field="segmento" value="petshop" label="Pet Shop" />
              <RadioOption field="segmento" value="loja" label="Loja Física" />
              <RadioOption field="segmento" value="ecommerce" label="Comércio Eletrônico" />
              <RadioOption field="segmento" value="servicos" label="Escritório de Serviços (advocacia, contabilidade, arquitetura, etc.)" />
              <RadioOption field="segmento" value="restaurante" label="Restaurante/Alimentação" />
              <RadioOption field="segmento" value="consultoria" label="Consultoria" />
              <RadioOption field="segmento" value="outros" label="Outros Serviços" />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-emerald-300 mb-4">Áreas da empresa para incluir no BPO</h3>
            <p className="text-slate-400 mb-6">
              {planConfig.name === "AVANÇADO" 
                ? "No plano Avançado, todas as áreas estão incluídas automaticamente. Você terá acesso completo a todos os serviços disponíveis."
                : "Selecione as áreas que deseja terceirizar."
              }
              <span className="text-emerald-400 font-semibold"> 
                {planConfig.name === "AVANÇADO" 
                  ? " Plano mais completo com todos os serviços!"
                  : ` Áreas disponíveis no seu plano ${planConfig.displayName.toUpperCase()}`
                }
              </span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todasAreas.map((area) => (
                <CheckboxOption 
                  key={area.value}
                  field="areas" 
                  value={area.value} 
                  label={area.label} 
                />
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-emerald-300 mb-4">Bancos e ferramentas utilizadas</h3>
            <div className="space-y-6">
              <div>
                <p className="text-slate-400 mb-4">Quais bancos sua empresa utiliza?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CheckboxOption field="bancos" value="banco_brasil" label="Banco do Brasil" />
                  <CheckboxOption field="bancos" value="bradesco" label="Bradesco" />
                  <CheckboxOption field="bancos" value="caixa" label="Caixa Econômica" />
                  <CheckboxOption field="bancos" value="itau" label="Itaú" />
                  <CheckboxOption field="bancos" value="santander" label="Santander" />
                  <CheckboxOption field="bancos" value="inter" label="Inter" />
                  <CheckboxOption field="bancos" value="nubank" label="Nubank" />
                  <CheckboxOption field="bancos" value="outros" label="Outros" />
                </div>
              </div>
              <div>
                <p className="text-slate-400 mb-4">Quais ferramentas de gestão utiliza?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CheckboxOption field="ferramentas" value="excel" label="Excel/Planilhas" />
                  <CheckboxOption field="ferramentas" value="contaazul" label="Conta Azul" />
                  <CheckboxOption field="ferramentas" value="omie" label="Omie" />
                  <CheckboxOption field="ferramentas" value="tiny" label="Tiny" />
                  <CheckboxOption field="ferramentas" value="bling" label="Bling" />
                  <CheckboxOption field="ferramentas" value="nenhuma" label="Nenhuma ferramenta" />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-emerald-300 mb-4">Como sua empresa organiza o financeiro hoje?</h3>
            <div className="space-y-6">
              <div>
                <p className="text-slate-400 mb-4">Estrutura atual</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CheckboxOption field="organizacao" value="funcionario_interno" label="Funcionário interno" />
                  <CheckboxOption field="organizacao" value="socio_faz" label="Sócio/proprietário faz" />
                  <CheckboxOption field="organizacao" value="contador_externo" label="Contador externo" />
                  <CheckboxOption field="organizacao" value="sem_organizacao" label="Sem organização estruturada" />
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-emerald-300 mb-4">Confirmação do Plano {planConfig.displayName}</h3>
            
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-emerald-300 mb-2">Plano Selecionado: {planConfig.displayName.toUpperCase()}</h4>
              <p className="text-2xl font-bold text-white mb-2">R$ {planConfig.value.toLocaleString()},00/mês</p>
              <p className="text-slate-300">Plano {planConfig.displayName} com todas as funcionalidades disponíveis</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-200">Resumo dos seus dados:</h4>
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-2 text-sm">
                <p className="text-slate-300"><span className="text-slate-400">Empresa:</span> {formData.nomeEmpresa || "Não preenchido"}</p>
                <p className="text-slate-300"><span className="text-slate-400">CNPJ:</span> {formData.cnpj || "Não preenchido"}</p>
                <p className="text-slate-300"><span className="text-slate-400">Contato:</span> {formData.nomeContato || "Não preenchido"}</p>
                <p className="text-slate-300"><span className="text-slate-400">Segmento:</span> {formData.segmento || "Não preenchido"}</p>
                <p className="text-slate-300"><span className="text-slate-400">Áreas selecionadas:</span> {formData.areas.length} áreas</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-200">Medindo o sucesso da parceria:</h4>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Como você saberia que a parceria com a ElevaLucro foi um sucesso?
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  Descreva os resultados concretos que indicariam que os objetivos foram atingidos. O que mudaria na sua empresa?
                </p>
                <textarea
                  value={formData.expectativasSucesso}
                  onChange={(e) => handleInputChange("expectativasSucesso", e.target.value)}
                  placeholder="Ex: Quando eu conseguir dedicar 80% do meu tempo ao comercial ao invés do administrativo, quando tiver relatórios financeiros atualizados em tempo real, quando não precisar mais me preocupar com conciliação bancária, quando conseguir tomar decisões baseadas em dados precisos do DRE..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 resize-none"
                />
              </div>
            </div>

            <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <h4 className="font-semibold text-emerald-300 mb-3">🎉 Quase pronto!</h4>
              <p className="text-slate-300 text-sm">
                Você escolheu o plano {planConfig.displayName}! 
                Clique em "Finalizar" para enviar suas informações e nossa equipe entrará em contato para finalizar o contrato e iniciar os serviços.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
      
      <div className="relative max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Formulário de Pré-Onboarding
            <span className="block text-2xl text-emerald-400 mt-2">Plano {planConfig.displayName}</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Complete o formulário abaixo para iniciar sua jornada com o BPO Financeiro.
          </p>
        </div>

        {/* Progress Bar */}
        {renderProgressBar()}
        
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Form Card */}
        <div className="bg-slate-900/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-8">
          {/* Step Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white">{steps[currentStep].title}</h2>
            <p className="text-slate-400 text-sm mt-1">{steps[currentStep].subtitle}</p>
          </div>

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200
                ${currentStep === 0 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-slate-700 hover:bg-slate-600 text-white'}
              `}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid()}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all duration-200
                  ${isStepValid()
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                <Check className="w-4 h-4" />
                Finalizar Plano {planConfig.displayName}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200
                  ${isStepValid()
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}