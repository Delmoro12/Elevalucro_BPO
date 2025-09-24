"use client";

import { Shield, TrendingUp, CheckCircle, Clock, Users, BarChart3, Target, Brain } from "lucide-react";

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const defaultBenefits: Benefit[] = [
  {
    icon: <Target className="h-8 w-8 text-emerald-300" />,
    title: "Foco no core business",
    description: "Mais tempo para focar no que você faz de melhor"
  },
  {
    icon: <Shield className="h-8 w-8 text-emerald-300" />,
    title: "Segurança total",
    description: "Processos auditáveis com você no controle dos pagamentos"
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-emerald-300" />,
    title: "Economia garantida",
    description: "Mais barato que contratar um funcionário CLT especializado"
  },
  {
    icon: <Brain className="h-8 w-8 text-emerald-300" />,
    title: "Expertise especializada",
    description: "Time com anos de experiência em BPO financeiro"
  },
  {
    icon: <Clock className="h-8 w-8 text-emerald-300" />,
    title: "Transparência 24/7",
    description: "Acompanhe tudo em tempo real pelo app"
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-emerald-300" />,
    title: "Decisões inteligentes",
    description: "Relatórios e indicadores para crescer com dados"
  }
];

interface BenefitsSectionProps {
  benefits?: Benefit[];
}

export default function BenefitsSection({ benefits = defaultBenefits }: BenefitsSectionProps) {
  return (
    <section id="beneficios" className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">
          Por que empresas <span className="text-emerald-300">inteligentes</span> escolhem a ElevaLucro
        </h2>
        <p className="text-xl text-slate-300/90 max-w-3xl mx-auto">
          Não é só terceirização. É ter um parceiro estratégico para elevar seus resultados.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <div key={index} className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/30 transition-colors">
            <div className="mb-4">{benefit.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
            <p className="text-sm text-slate-300/90">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}