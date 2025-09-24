"use client";

import { Brain, Code2, Scale, Heart, GraduationCap, Megaphone, Calculator, Compass } from "lucide-react";

interface SolutionSectionProps {
  title: string;
  titleHighlight: string;
  description: string;
  highlightBox: {
    text: string;
    emphasis: string;
  };
}

const serviceExamples = [
  {
    icon: <Brain className="h-6 w-6 text-emerald-300" />,
    title: "Consultoria",
    description: "Empresas de consultoria e assessoria"
  },
  {
    icon: <Scale className="h-6 w-6 text-emerald-300" />,
    title: "Advocacia",
    description: "Escritórios de advocacia e jurídico"
  },
  {
    icon: <Code2 className="h-6 w-6 text-emerald-300" />,
    title: "Tecnologia",
    description: "Startups e empresas de software"
  },
  {
    icon: <Heart className="h-6 w-6 text-emerald-300" />,
    title: "Saúde",
    description: "Clínicas e consultórios médicos"
  },
  {
    icon: <GraduationCap className="h-6 w-6 text-emerald-300" />,
    title: "Educação",
    description: "Escolas e cursos profissionalizantes"
  },
  {
    icon: <Megaphone className="h-6 w-6 text-emerald-300" />,
    title: "Marketing",
    description: "Agências de marketing e publicidade"
  },
  {
    icon: <Calculator className="h-6 w-6 text-emerald-300" />,
    title: "Contabilidade",
    description: "Escritórios contábeis e fiscais"
  },
  {
    icon: <Compass className="h-6 w-6 text-emerald-300" />,
    title: "Outros serviços",
    description: "Arquitetura, engenharia, design e demais empresas de serviços profissionais"
  }
];

export default function SolutionSection({
  title,
  titleHighlight,
  description,
  highlightBox
}: SolutionSectionProps) {
  return (
    <section id="solucao" className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">
          {title.split(titleHighlight)[0]}
          <span className="text-emerald-300">{titleHighlight}</span>
          {title.split(titleHighlight)[1]}
        </h2>
        <p className="text-xl text-slate-300/90 max-w-4xl mx-auto mb-8">
          Com a ElevaLucro, você terceiriza toda a operação financeira para um time especializado em BPO financeiro para empresas de serviços:
        </p>
        
        {/* Cards de Exemplos de Serviços */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12">
          {serviceExamples.map((service, index) => (
            <div key={index} className="bg-slate-900/60 rounded-2xl p-3 md:p-4 border border-white/10 hover:border-emerald-500/30 transition-colors">
              <div className="flex flex-col items-center text-center">
                <div className="mb-2 md:mb-3">{service.icon}</div>
                <h3 className="font-semibold text-white mb-1 text-xs md:text-sm">{service.title}</h3>
                <p className="text-xs text-slate-400 leading-tight">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="rounded-2xl border border-emerald-500/20 p-8 bg-emerald-500/5 text-center">
        <p className="text-lg text-slate-300/90">
          {highlightBox.text.split(highlightBox.emphasis)[0]}
          <span className="text-emerald-300 font-semibold">{highlightBox.emphasis}</span>
          {highlightBox.text.split(highlightBox.emphasis)[1]}
        </p>
      </div>
    </section>
  );
}