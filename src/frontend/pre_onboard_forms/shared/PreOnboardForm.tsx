"use client";

import { ChevronLeft, ChevronRight, Check, Building2, CreditCard, Settings, FileText, Target, Users, User, MapPin } from "lucide-react";
import { PlanConfig, FormData } from "../types";
import { usePreOnboardForm } from "../hooks/usePreOnboardForm";

interface PreOnboardFormProps {
  planConfig: PlanConfig;
}

export default function PreOnboardForm({ planConfig }: PreOnboardFormProps) {
  const {
    currentStep,
    formData,
    isSubmitting,
    setCurrentStep,
    handleInputChange,
    handleCheckboxChange,
    handleRadioChange,
    handleMaskedInputChange,
    nextStep,
    prevStep,
    handleSubmit
  } = usePreOnboardForm(planConfig);

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

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Dados Pessoais
        return formData.nomeContato && formData.cpfContato && formData.emailContato && formData.cargoContato;
      case 1: // Dados da Empresa
        return formData.nomeEmpresa && formData.cnpj && formData.endereco && formData.cidade && formData.estado;
      case 2: // Segmento
        return formData.segmento;
      case 3: // Áreas
        return formData.areas && formData.areas.length > 0;
      case 4: // Bancos & Ferramentas
        return true; // Opcional
      case 5: // Organização
        return true; // Opcional
      case 6: // Finalizar
        return formData.expectativasSucesso;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
      
      <div className="relative max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Pré-Onboarding {planConfig.displayName}
          </h1>
          <p className="text-xl text-slate-300 mb-2">
            Valor: <span className="text-emerald-400 font-bold">R$ {planConfig.value.toLocaleString()}/mês</span>
          </p>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Vamos conhecer melhor sua empresa e necessidades para personalizar nossos serviços.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${index < currentStep 
                    ? 'bg-emerald-500 text-white' 
                    : index === currentStep 
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30' 
                      : 'bg-slate-700 text-slate-400'
                  }
                `}>
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-sm font-medium ${
                    index <= currentStep ? 'text-white' : 'text-slate-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className={`text-xs mt-1 ${
                    index <= currentStep ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {step.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="w-full bg-slate-800 rounded-full h-2 mb-8">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 mb-8">
          
          {/* Step 0: Dados Pessoais */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <User className="w-6 h-6 text-emerald-400" />
                Dados Pessoais do Contato
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome Completo <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nomeContato}
                    onChange={(e) => handleInputChange("nomeContato", e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
                
                <div>
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
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.emailContato}
                    onChange={(e) => handleInputChange("emailContato", e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.telefoneContato}
                    onChange={(e) => handleMaskedInputChange("telefoneContato", e.target.value, maskPhone)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cargo na Empresa <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.cargoContato}
                  onChange={(e) => handleInputChange("cargoContato", e.target.value)}
                  placeholder="Ex: Diretor, Sócio, Gerente..."
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Step 1: Dados da Empresa */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-emerald-400" />
                Dados da Empresa
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Razão Social / Nome da Empresa <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nomeEmpresa}
                    onChange={(e) => handleInputChange("nomeEmpresa", e.target.value)}
                    placeholder="Nome da sua empresa"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    CNPJ <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => handleMaskedInputChange("cnpj", e.target.value, maskCNPJ)}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => handleMaskedInputChange("cep", e.target.value, maskCEP)}
                    placeholder="00000-000"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Endereço <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange("endereco", e.target.value)}
                    placeholder="Rua, Avenida..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Número
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => handleInputChange("numero", e.target.value)}
                    placeholder="Número"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={formData.bairro}
                    onChange={(e) => handleInputChange("bairro", e.target.value)}
                    placeholder="Bairro"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cidade <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange("cidade", e.target.value)}
                    placeholder="Cidade"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Estado <span className="text-emerald-400">*</span>
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => handleInputChange("estado", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  >
                    <option value="">Selecione o estado</option>
                    {estadosBrasil.map(estado => (
                      <option key={estado.value} value={estado.value}>{estado.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Segmento */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Target className="w-6 h-6 text-emerald-400" />
                Segmento da Empresa
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-4">
                  Em qual segmento sua empresa atua? <span className="text-emerald-400">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Comércio", "Serviços", "Indústria", "Agronegócio", 
                    "Saúde", "Educação", "Construção Civil", "Tecnologia",
                    "Alimentação", "Transporte", "Consultoria", "Outro"
                  ].map(segment => (
                    <label key={segment} className="flex items-center p-4 bg-slate-800/30 hover:bg-slate-700/30 rounded-lg cursor-pointer border border-slate-600 hover:border-emerald-500/30 transition-all duration-200">
                      <input
                        type="radio"
                        name="segmento"
                        value={segment}
                        checked={formData.segmento === segment}
                        onChange={(e) => handleRadioChange("segmento", e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 transition-all duration-200 ${
                        formData.segmento === segment 
                          ? 'border-emerald-400 bg-emerald-400' 
                          : 'border-slate-400'
                      }`}>
                        {formData.segmento === segment && (
                          <div className="w-full h-full rounded-full bg-emerald-400 scale-50"></div>
                        )}
                      </div>
                      <span className="text-white">{segment}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Áreas */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Settings className="w-6 h-6 text-emerald-400" />
                Áreas de Atuação - {planConfig.displayName}
              </h2>
              
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
                <p className="text-emerald-200 text-sm">
                  <strong>Plano {planConfig.displayName}</strong> - R$ {planConfig.value.toLocaleString()}/mês
                  <br />
                  {planConfig.name === "AVANÇADO" 
                    ? "Todas as áreas estão incluídas neste plano."
                    : "Selecione as áreas que deseja incluir no seu plano."
                  }
                </p>
              </div>
              
              <div className="space-y-4">
                {todasAreas.map((area) => {
                  const isEnabled = planConfig.enabledAreas.includes(area.value);
                  const isSelected = formData.areas.includes(area.value);
                  const isDisabled = !isEnabled || planConfig.name === "AVANÇADO";
                  
                  return (
                    <label 
                      key={area.value}
                      className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        isEnabled
                          ? isSelected 
                            ? 'bg-emerald-500/20 border-emerald-500/50 hover:border-emerald-400'
                            : 'bg-slate-800/30 border-slate-600 hover:border-emerald-500/30'
                          : 'bg-slate-800/20 border-slate-700 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => handleCheckboxChange("areas", area.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 mr-4 mt-0.5 flex items-center justify-center transition-all duration-200 ${
                        isSelected 
                          ? 'border-emerald-400 bg-emerald-400' 
                          : isEnabled 
                            ? 'border-slate-400' 
                            : 'border-slate-600'
                      }`}>
                        {isSelected && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm ${isEnabled ? 'text-white' : 'text-slate-500'}`}>
                          {area.label}
                        </span>
                        {!isEnabled && (
                          <span className="text-xs text-amber-400 block mt-1">
                            Disponível nos planos superiores
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Bancos & Ferramentas */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-emerald-400" />
                Bancos & Ferramentas
              </h2>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-4">
                    Quais bancos a empresa utiliza? (Opcional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      "Banco do Brasil", "Bradesco", "Itaú", "Santander", "Caixa",
                      "Sicoob", "Sicredi", "Inter", "Nubank", "C6 Bank",
                      "BTG Pactual", "Safra", "Outro"
                    ].map(banco => (
                      <label key={banco} className="flex items-center p-3 bg-slate-800/30 hover:bg-slate-700/30 rounded-lg cursor-pointer border border-slate-600 hover:border-emerald-500/30 transition-all duration-200">
                        <input
                          type="checkbox"
                          checked={formData.bancos.includes(banco)}
                          onChange={() => handleCheckboxChange("bancos", banco)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                          formData.bancos.includes(banco) 
                            ? 'border-emerald-400 bg-emerald-400' 
                            : 'border-slate-400'
                        }`}>
                          {formData.bancos.includes(banco) && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                        <span className="text-white text-sm">{banco}</span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Campo "Outros" para bancos */}
                  {formData.bancos.includes('Outro') && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Especifique outros bancos:
                      </label>
                      <input
                        type="text"
                        value={formData.bancosOutro}
                        onChange={(e) => handleInputChange("bancosOutro", e.target.value)}
                        placeholder="Digite os nomes dos outros bancos..."
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-4">
                    Quais ferramentas/sistemas já utiliza? (Opcional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Excel/Google Sheets", "ERP (SAP, TOTVS, etc)", "Conta Azul", "Omie",
                      "Bling", "Tiny", "NFCom", "EmiteAí", "Nenhum sistema", "Outro"
                    ].map(ferramenta => (
                      <label key={ferramenta} className="flex items-center p-3 bg-slate-800/30 hover:bg-slate-700/30 rounded-lg cursor-pointer border border-slate-600 hover:border-emerald-500/30 transition-all duration-200">
                        <input
                          type="checkbox"
                          checked={formData.ferramentas.includes(ferramenta)}
                          onChange={() => handleCheckboxChange("ferramentas", ferramenta)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                          formData.ferramentas.includes(ferramenta) 
                            ? 'border-emerald-400 bg-emerald-400' 
                            : 'border-slate-400'
                        }`}>
                          {formData.ferramentas.includes(ferramenta) && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                        <span className="text-white text-sm">{ferramenta}</span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Campo "Outro" para ferramentas */}
                  {formData.ferramentas.includes('Outro') && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Especifique outras ferramentas:
                      </label>
                      <input
                        type="text"
                        value={formData.ferramentasOutro}
                        onChange={(e) => handleInputChange("ferramentasOutro", e.target.value)}
                        placeholder="Digite os nomes das outras ferramentas/sistemas..."
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Organização */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FileText className="w-6 h-6 text-emerald-400" />
                Organização Financeira Atual
              </h2>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-4">
                    Como organiza as informações financeiras hoje? (Opcional)
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      "Planilha Excel/Google Sheets",
                      "Sistema ERP integrado",
                      "Software de gestão financeira",
                      "Anotações em caderno/papel",
                      "Não tenho organização definida",
                      "Outro método"
                    ].map(organizacao => (
                      <label key={organizacao} className="flex items-center p-4 bg-slate-800/30 hover:bg-slate-700/30 rounded-lg cursor-pointer border border-slate-600 hover:border-emerald-500/30 transition-all duration-200">
                        <input
                          type="checkbox"
                          checked={formData.organizacao.includes(organizacao)}
                          onChange={() => handleCheckboxChange("organizacao", organizacao)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                          formData.organizacao.includes(organizacao) 
                            ? 'border-emerald-400 bg-emerald-400' 
                            : 'border-slate-400'
                        }`}>
                          {formData.organizacao.includes(organizacao) && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                        <span className="text-white">{organizacao}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Step 6: Finalizar */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Check className="w-6 h-6 text-emerald-400" />
                Finalizar - {planConfig.displayName}
              </h2>
              
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-emerald-200 mb-4">Resumo do seu plano:</h3>
                <div className="space-y-2 text-emerald-200">
                  <p><strong>Plano:</strong> {planConfig.displayName}</p>
                  <p><strong>Valor:</strong> R$ {planConfig.value.toLocaleString()}/mês</p>
                  <p><strong>Contato:</strong> {formData.nomeContato} ({formData.emailContato})</p>
                  <p><strong>Empresa:</strong> {formData.nomeEmpresa}</p>
                  <p><strong>Segmento:</strong> {formData.segmento}</p>
                  <p><strong>Áreas selecionadas:</strong> {formData.areas.length} área(s)</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-4">
                  O que você espera alcançar com nossos serviços? <span className="text-emerald-400">*</span>
                </label>
                <textarea
                  value={formData.expectativasSucesso}
                  onChange={(e) => handleInputChange("expectativasSucesso", e.target.value)}
                  placeholder="Descreva suas expectativas e objetivos..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 resize-none"
                />
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-300 text-sm">
                  Ao finalizar, você receberá um contato da nossa equipe em até 24 horas para agendarmos uma reunião de alinhamento e início dos trabalhos.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-600">
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
                disabled={!isStepValid() || isSubmitting}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all duration-200
                  ${isStepValid() && !isSubmitting
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Finalizar Plano {planConfig.displayName}
                  </>
                )}
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