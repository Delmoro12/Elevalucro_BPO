"use client";

import { Workflow, Wallet, Banknote, BarChart3, ShieldCheck } from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
}

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface HowItWorksSectionProps {
  steps?: Step[];
  services?: Service[];
}

const defaultSteps: Step[] = [
  {
    number: "1",
    title: "Recebemos seus documentos",
    description: "Notas fiscais, boletos e comprovantes via nossa interface"
  },
  {
    number: "2",
    title: "Processamos e organizamos",
    description: "Lançamentos, conciliação bancária e preparação dos pagamentos"
  },
  {
    number: "3",
    title: "Notificamos via WhatsApp",
    description: "Enviamos diariamente link para aprovação no nosso app exclusivo"
  },
  {
    number: "4",
    title: "Você aprova com segurança",
    description: "Acessa o app, revisa e aprova - só você tem essa autorização"
  }
];

const defaultServices: Service[] = [
  {
    icon: <Wallet className="h-8 w-8 text-emerald-300" />,
    title: "Contas a Pagar/Receber",
    description: "Lançamentos, atualizações e lembretes"
  },
  {
    icon: <Banknote className="h-8 w-8 text-emerald-300" />,
    title: "Conciliação Bancária",
    description: "Integrações e revisão humana"
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-emerald-300" />,
    title: "Relatórios Gerenciais",
    description: "DRE, fluxo de caixa e indicadores"
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-emerald-300" />,
    title: "Governança",
    description: "Processos auditáveis e seguros"
  }
];

export default function HowItWorksSection({
  steps = defaultSteps,
  services = defaultServices
}: HowItWorksSectionProps) {
  return (
    <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6 flex items-center justify-center gap-2">
          <Workflow className="h-8 w-8 text-emerald-300"/>
          Como funciona na <span className="text-emerald-300 ml-2">prática</span>
        </h2>
        <p className="text-xl text-slate-300/90 max-w-3xl mx-auto">
          Um processo simples e seguro em 4 etapas
        </p>
      </div>

      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-8 text-center">Nossa rotina diária com sua empresa:</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xl mb-4">
                  {step.number}
                </div>
                <h4 className="font-semibold text-emerald-300 mb-2">{step.title}</h4>
                <p className="text-sm text-slate-300/90">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-full">
                  <div className="border-t-2 border-dotted border-emerald-500/30 w-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 p-8 bg-white/5">
        <h3 className="text-xl font-semibold mb-6">O que nossa equipe especializada cuida para você:</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto mb-3">{service.icon}</div>
              <h4 className="font-semibold mb-2">{service.title}</h4>
              <p className="text-xs text-slate-300/90">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}