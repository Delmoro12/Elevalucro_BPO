"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";

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
import BenefitsSection from "../components/sections/BenefitsSection";
import ComparisonSection from "../components/sections/ComparisonSection";
import ResultsSection from "../components/sections/ResultsSection";
import OnboardingSection from "../components/sections/OnboardingSection";
import FAQSection from "../components/sections/FAQSection";
import CTASection from "../components/sections/CTASection";

// Componente de planos existente
import PlanosGenericos from "../shared/PlanosGenericos";

export default function LandingGeneralRefactored() {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <HeroSection
        badge={{
          icon: <TrendingUp className="h-4 w-4" />,
          text: "BPO Financeiro Especializado"
        }}
        title="O financeiro da sua empresa nas mãos de"
        titleHighlight="especialistas"
        subtitle="Terceirize toda a operação financeira para quem entende do assunto. Nossa equipe cuida de lançamentos, pagamentos e relatórios enquanto você foca no que realmente importa: fazer sua empresa crescer."
        ctaText="Conhecer a solução"
      />

      {/* Pain Points Section */}
      <PainPointsSection
        title="Sua empresa precisa de"
        titleHighlight="estratégia"
        description="Empresários e gestores perdem tempo valioso com controles financeiros manuais que só geram dor de cabeça e riscos desnecessários:"
        painPoints={painPoints}
      />

      {/* Solution Section */}
      <SolutionSection
        title="A retaguarda financeira da sua empresa, nas mãos de especialistas"
        titleHighlight="retaguarda financeira"
        description=""
        highlightBox={{
          text: "BPO significa Business Process Outsourcing - terceirização de processos. Na prática: você não precisa mais se preocupar com lançamentos, pagamentos e conciliações. Nossa equipe especializada assume toda essa operação, com transparência e segurança total.",
          emphasis: "Nossa equipe especializada assume toda essa operação"
        }}
      />

      {/* Technology Differential Section - DIFERENCIAL PRINCIPAL */}
      <TechnologyDifferentialSection />

      {/* Operational Flow Section */}
      <OperationalFlowSection />

      {/* System Showcase Section */}
      <SystemShowcaseSection />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Comparison Section (Antes vs Depois) */}
      <ComparisonSection />

      {/* Results Section */}
      <ResultsSection />

      {/* Onboarding Section */}
      <OnboardingSection />

      {/* Pricing Section */}
      <section id="planos" className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Escolha o plano ideal para sua <span className="text-emerald-300">empresa</span>
          </h2>
          <p className="text-xl text-slate-300/90 max-w-3xl mx-auto">
            Comece com o que sua empresa precisa hoje e evolua conforme cresce
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 p-8 bg-white/5">
          <PlanosGenericos onSelectPlan={handleOpenModal} />
          <p className="mt-6 text-xs text-slate-400">
            * O escopo final é ajustado via SLA no onboarding. Valores para empresas de até R$ 500k/mês de faturamento.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section */}
      <CTASection
        onButtonClick={() => handleOpenModal("Gerencial")}
      />

      {/* Footer */}
      <Footer />

      {/* Contact Modal */}
      <ContactModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedPlan={selectedPlan}
      />
    </div>
  );
}