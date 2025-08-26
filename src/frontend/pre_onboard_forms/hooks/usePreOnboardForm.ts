import { useState } from 'react';
import { FormData, PlanConfig } from '../types';
import { createProspect, convertFormDataToProspect } from '../services/prospectService';

export function usePreOnboardForm(planConfig: PlanConfig) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    bancosOutro: "",
    ferramentas: [],
    ferramentasOutro: "",
    fornecedores: [],
    organizacao: [],
    relatorios: [],
    
    // Expectativas e objetivos
    expectativasSucesso: "",
    
    // Plano
    plano: planConfig.name,
    valorMensal: planConfig.value
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const handleMaskedInputChange = (field: keyof FormData, value: string, maskFunction?: (value: string) => string) => {
    const maskedValue = maskFunction ? maskFunction(value) : value;
    setFormData(prev => ({ ...prev, [field]: maskedValue }));
  };

  const nextStep = () => {
    if (currentStep < 6) { // 7 steps total (0-6)
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('=== DEBUG: Iniciando submit ===');
      console.log('FormData original:', formData);
      
      // Converter dados do formulário para formato da API
      const prospectData = convertFormDataToProspect(formData, 'site');
      console.log('ProspectData convertido:', prospectData);
      
      // Salvar via API
      console.log('Chamando createProspect...');
      const result = await createProspect(prospectData);
      console.log('Resultado da API:', result);
      
      if (result.success) {
        console.log(`Prospect criado com sucesso - Plano ${planConfig.displayName}:`, result.data);
        
        // Redirecionar para página de obrigado com dados do plano
        const params = new URLSearchParams({
          plano: planConfig.displayName,
          valor: planConfig.value.toString(),
          nome: formData.nomeContato,
          empresa: formData.nomeEmpresa
        });
        
        window.location.href = `/obrigado?${params.toString()}`;
        
        return { success: true, data: result.data };
      } else {
        console.error('Erro ao criar prospect:', result.error);
        alert(`Erro ao enviar formulário: ${result.error}\n\nTente novamente ou entre em contato conosco.`);
        
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      alert('Erro inesperado ao enviar formulário. Tente novamente.');
      
      return { success: false, error: 'Erro inesperado' };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // State
    currentStep,
    formData,
    isSubmitting,
    
    // Actions
    setCurrentStep,
    handleInputChange,
    handleCheckboxChange,
    handleRadioChange,
    handleMaskedInputChange,
    nextStep,
    prevStep,
    handleSubmit
  };
}