"use client";

import { useState } from "react";
import { X, Building, Phone, Mail, UserCircle, ArrowRight } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: string;
  onSubmit?: (data: FormData) => void;
}

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  cargo: string;
  funcionarios: string;
  faturamento: string;
  principalDesafio: string;
  melhorHorario: string;
  plano: string;
}

export default function ContactModal({ isOpen, onClose, selectedPlan, onSubmit }: ContactModalProps) {
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    cargo: "",
    funcionarios: "",
    faturamento: "",
    principalDesafio: "",
    melhorHorario: "",
    plano: selectedPlan
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      onSubmit({ ...formData, plano: selectedPlan });
    } else {
      console.log("Dados do formulário:", { ...formData, plano: selectedPlan });
      alert("Obrigado pelo interesse! Em breve entraremos em contato.");
    }
    
    onClose();
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      empresa: "",
      cargo: "",
      funcionarios: "",
      faturamento: "",
      principalDesafio: "",
      melhorHorario: "",
      plano: ""
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-white/10 shadow-2xl">
        {/* Header do Modal */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-white/10 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
          <h3 className="text-2xl font-semibold text-white">
            Transforme sua empresa com o <span className="text-emerald-300">Plano {selectedPlan}</span>
          </h3>
          <p className="mt-2 text-slate-300/90">
            Preencha seus dados e nossa equipe entrará em contato em até 24h
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-emerald-300 flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Seus dados
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  required
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                  placeholder="João Silva"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cargo *
                </label>
                <select
                  name="cargo"
                  required
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                >
                  <option value="">Selecione...</option>
                  <option value="ceo">CEO / Fundador</option>
                  <option value="diretor">Diretor(a)</option>
                  <option value="gerente">Gerente</option>
                  <option value="socio">Sócio(a)</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  E-mail profissional *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                  placeholder="joao@empresa.com.br"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  name="telefone"
                  required
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                  placeholder="(11) 98765-4321"
                />
              </div>
            </div>
          </div>

          {/* Dados da Empresa */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-emerald-300 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Sobre sua empresa
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nome da empresa *
              </label>
              <input
                type="text"
                name="empresa"
                required
                value={formData.empresa}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                placeholder="Empresa Exemplo LTDA"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Número de funcionários
                </label>
                <select
                  name="funcionarios"
                  value={formData.funcionarios}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                >
                  <option value="">Selecione...</option>
                  <option value="1-10">1 a 10</option>
                  <option value="11-25">11 a 25</option>
                  <option value="26-50">26 a 50</option>
                  <option value="51-100">51 a 100</option>
                  <option value="100+">Mais de 100</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Faturamento mensal
                </label>
                <select
                  name="faturamento"
                  value={formData.faturamento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                >
                  <option value="">Selecione...</option>
                  <option value="0-50k">Até R$ 50 mil</option>
                  <option value="50k-100k">R$ 50 a 100 mil</option>
                  <option value="100k-300k">R$ 100 a 300 mil</option>
                  <option value="300k-500k">R$ 300 a 500 mil</option>
                  <option value="500k-1m">R$ 500 mil a 1 milhão</option>
                  <option value="1m+">Acima de R$ 1 milhão</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Principal desafio financeiro hoje
              </label>
              <textarea
                name="principalDesafio"
                value={formData.principalDesafio}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none"
                placeholder="Ex: Dificuldade com fluxo de caixa, falta de visibilidade dos números, muito tempo gasto com planilhas..."
              />
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-emerald-300 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Melhor horário para contato
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="melhorHorario"
                  value="manha"
                  onChange={handleInputChange}
                  className="text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-300">Manhã</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="melhorHorario"
                  value="tarde"
                  onChange={handleInputChange}
                  className="text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-300">Tarde</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="melhorHorario"
                  value="noite"
                  onChange={handleInputChange}
                  className="text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-300">Noite</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="melhorHorario"
                  value="qualquer"
                  onChange={handleInputChange}
                  className="text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-300">Qualquer</span>
              </label>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Enviar interesse
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}