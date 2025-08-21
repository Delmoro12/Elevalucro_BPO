import OnboardingPresentation from '../components/OnboardingPresentation';

export default function OnboardingGerencialPage() {
  const planFeatures = [
    "Todos os serviços do Plano Controle",
    "Cobrança de inadimplentes (contato ativo com clientes em atraso)",
    "Emissão de NF (quando aplicável)",
    "Emissão de boletos",
    "Relatório de fluxo de caixa",
    "Relatórios de entradas e saídas",
    "Caixa diário",
    "DRE e indicadores de receitas e despesas por categoria"
  ];

  return (
    <OnboardingPresentation 
      planName="Gerencial"
      planFeatures={planFeatures}
      monthlyPrice="R$ 1.300,00"
    />
  );
}