import OnboardingPresentation from '../components/OnboardingPresentation';

export default function OnboardingControlePage() {
  const planFeatures = [
    "Elaboração/revisão de categorias (despesas, receitas) e centros de custos",
    "Elaboração/revisão do budget anual de despesas fixas",
    "Lançamento e pagamentos de Contas a Pagar",
    "Lançamento e recebimentos de Contas a Receber",
    "Conciliação bancária (cartão, PIX, boletos)",
    "Organização e envio de documentos fiscais para contabilidade"
  ];

  return (
    <OnboardingPresentation 
      planName="Controle"
      planFeatures={planFeatures}
      monthlyPrice="R$ 1.200,00"
    />
  );
}