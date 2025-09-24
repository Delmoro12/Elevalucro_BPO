"use client";

import { ArrowRight, CheckCircle } from "lucide-react";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  benefits?: string[];
}

const defaultBenefits = [
  "Sem fidelidade",
  "Garantia de 30 dias",
  "Onboarding incluído",
  "Suporte via WhatsApp"
];

export default function CTASection({
  title = "Eleve os resultados da sua empresa",
  subtitle = "Simplifique sua gestão financeira e ganhe tempo para o que realmente importa: fazer sua empresa crescer.",
  buttonText = "Quero organizar meu financeiro",
  onButtonClick,
  benefits = defaultBenefits
}: CTASectionProps) {
  
  const handleClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      const element = document.querySelector('#planos');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="contato" className="mx-auto max-w-6xl px-4 py-20">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-500/10 to-emerald-400/5 border border-emerald-500/20 p-12 text-center">
        <h2 className="text-4xl md:text-5xl font-semibold mb-6">
          {title.includes("resultados") ? (
            <>
              Eleve os <span className="text-emerald-300">resultados</span> da sua empresa
            </>
          ) : (
            title
          )}
        </h2>
        <p className="text-xl text-slate-300/90 mb-8 max-w-3xl mx-auto">
          {subtitle}
        </p>
        
        <button 
          onClick={handleClick}
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-xl font-semibold text-xl transition-colors mb-8"
        >
          {buttonText}
          <ArrowRight className="h-6 w-6" />
        </button>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-300">
          {benefits.map((benefit, index) => (
            <span key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-300" />
              {benefit}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}