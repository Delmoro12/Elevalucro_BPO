import OnboardingPresentation from '../components/OnboardingPresentation';

export default function OnboardingAvancadoPage() {
  const planFeatures = [
    "Todos os serviços do Plano Gerencial",
    "Análise mensal do DRE e indicadores com consultor",
    "Análise mensal de margens e lucratividade com consultor",
    "Análise mensal do fluxo de caixa com consultor",
    "Suporte para definição das ações estratégicas relacionadas às análises"
  ];

  return (
    <OnboardingPresentation 
      planName="Avançado"
      planFeatures={planFeatures}
      monthlyPrice="R$ 1.700,00"
    />
  );
}