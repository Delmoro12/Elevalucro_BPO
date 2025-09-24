"use client";

import { FileText, Users, Clock, BarChart3, TrendingUp, CheckCircle } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  text: string;
}

const defaultFeatures: Feature[] = [
  {
    icon: <FileText className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />,
    text: "Enviar documentos facilmente com IA para registro automático (notas fiscais, comprovantes, contratos)"
  },
  {
    icon: <Users className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />,
    text: "Tirar dúvidas com operadores ou gerente de conta, sem e-mails infinitos"
  },
  {
    icon: <Clock className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />,
    text: "Acompanhar o trabalho em tempo real"
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />,
    text: "Consultar indicadores financeiros prontos para análise"
  },
  {
    icon: <TrendingUp className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />,
    text: "Visualizar fluxo de caixa atualizado diariamente"
  },
  {
    icon: <CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />,
    text: "Ter visão clara do DRE com lucros e custos estruturados"
  }
];

interface InterfaceSectionProps {
  features?: Feature[];
}

export default function InterfaceSection({ features = defaultFeatures }: InterfaceSectionProps) {
  return (
    <section id="interface" className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">
          Uma <span className="text-emerald-300">interface exclusiva</span> feita para sua empresa
        </h2>
        <p className="text-slate-300/90 text-lg mb-12 max-w-3xl mx-auto">
          Não são planilhas! É um app moderno, intuitivo e desenvolvido especialmente para o controle financeiro empresarial
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <h3 className="text-2xl font-semibold mb-4">Tecnologia própria, não planilhas genéricas</h3>
          <p className="text-slate-300/90 mb-6">
            Enquanto outros BPOs usam planilhas Excel ou sistemas genéricos, nós desenvolvemos 
            uma plataforma exclusiva pensada em cada detalhe da gestão financeira empresarial.
          </p>
          <p className="text-slate-300/90">
            <span className="text-emerald-300 font-semibold">Resultado:</span> você tem mais 
            clareza, mais controle e mais tempo para focar no crescimento do seu negócio.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 p-8 bg-white/5">
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                {feature.icon}
                <p className="text-slate-300/90">{feature.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-xl bg-emerald-400/10 text-emerald-200 text-center">
            <p className="font-medium">Tudo em um só lugar, simples e confiável.</p>
          </div>
        </div>
      </div>
    </section>
  );
}