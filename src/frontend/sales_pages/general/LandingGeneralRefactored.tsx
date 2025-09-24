"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { useLocale } from '@/src/i18n/useLocale';
import { useTranslation } from '@/src/i18n';

// Componentes comuns
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import ContactModal from "../components/common/ContactModal";

// Seções
import HeroSection from "../components/sections/HeroSection";
import PainPointsSection from "../components/sections/PainPointsSection";
import SolutionSection from "../components/sections/SolutionSection";
import TechnologyDifferentialSection from "../components/sections/TechnologyDifferentialSection";
import OperationalFlowSection from "../components/sections/OperationalFlowSection";
import SystemShowcaseSection from "../components/sections/SystemShowcaseSection";
import InterfaceSection from "../components/sections/InterfaceSection";
import BenefitsSection from "../components/sections/BenefitsSection";
import ComparisonSection from "../components/sections/ComparisonSection";
import ResultsSection from "../components/sections/ResultsSection";
import OnboardingSection from "../components/sections/OnboardingSection";
import FAQSection from "../components/sections/FAQSection";
import CTASection from "../components/sections/CTASection";

// Componente de planos existente
import PlanosGenericos from "../shared/PlanosGenericos";

export default function LandingGeneralRefactored() {
  const { locale, changeLocale, isClient } = useLocale();
  const { t } = useTranslation(locale);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  const handleOpenModal = (planName: string) => {
    setSelectedPlan(planName);
    setShowModal(true);
  };

  // Dados específicos da landing genérica
  const painPoints = [
    { text: "Planilhas confusas que nunca batem e geram retrabalho" },
    { text: "Falta de visibilidade sobre fluxo de caixa e saúde financeira" },
    { text: "Decisões importantes tomadas sem números confiáveis" },
    { text: "Risco de erros, multas e atrasos em pagamentos" },
    { text: "Tempo perdido com tarefas operacionais ao invés de estratégia" },
    { text: "Custo alto para ter um financeiro interno competente" }
  ];

  // Show loading while client-side hydration happens
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-emerald-300">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <Header locale={locale} onLocaleChange={changeLocale} />

      {/* Hero Section */}
      <HeroSection
        locale={locale}
        badgeIcon={<TrendingUp className="h-4 w-4" />}
      />

      {/* Pain Points Section */}
      <PainPointsSection locale={locale} />

      {/* Solution Section */}
      <SolutionSection locale={locale} />

      {/* Technology Differential Section - DIFERENCIAL PRINCIPAL */}
      <TechnologyDifferentialSection locale={locale} />

      {/* Operational Flow Section */}
      <OperationalFlowSection />

      {/* System Showcase Section */}
      <SystemShowcaseSection />

      {/* Interface Section */}
      <InterfaceSection locale={locale} />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Comparison Section (Antes vs Depois) */}
      <ComparisonSection />

      {/* Results Section */}
      <ResultsSection locale={locale} />

      {/* Onboarding Section */}
      <OnboardingSection />

      {/* Pricing Section */}
      <section id="planos" className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            {t('pricing.title').split(t('pricing.titleHighlight'))[0]}
            <span className="text-emerald-300">{t('pricing.titleHighlight')}</span>
            {t('pricing.title').split(t('pricing.titleHighlight'))[1]}
          </h2>
          <p className="text-xl text-slate-300/90 max-w-3xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 p-8 bg-white/5">
          <PlanosGenericos onSelectPlan={handleOpenModal} locale={locale} />
          <p className="mt-6 text-xs text-slate-400">
            {t('pricing.disclaimer')}
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection locale={locale} />

      {/* Final CTA Section */}
      <CTASection
        locale={locale}
        onButtonClick={() => handleOpenModal("Gerencial")}
      />

      {/* Footer */}
      <Footer locale={locale} />

      {/* Contact Modal */}
      <ContactModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedPlan={selectedPlan}
      />
    </div>
  );
}