"use client";

import { X, CheckCircle } from "lucide-react";

interface ComparisonItem {
  before: string;
  after: string;
}

const defaultComparisons: ComparisonItem[] = [
  {
    before: "Planilhas confusas que nunca batem",
    after: "Sistema integrado com conciliação automática"
  },
  {
    before: "Decisões no escuro, sem dados confiáveis",
    after: "Dashboards e relatórios em tempo real"
  },
  {
    before: "Horas perdidas com tarefas operacionais",
    after: "2-3 minutos/dia para aprovar pagamentos"
  },
  {
    before: "Risco de erros e multas por atraso",
    after: "Equipe especializada cuidando de tudo"
  },
  {
    before: "Custo alto com funcionário CLT + encargos",
    after: "Mensalidade fixa e previsível"
  },
  {
    before: "Falta de governança e auditoria",
    after: "Processos documentados e rastreáveis"
  }
];

export default function ComparisonSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">
          A transformação que sua empresa <span className="text-emerald-300">merece</span>
        </h2>
        <p className="text-xl text-slate-300/90 max-w-3xl mx-auto">
          Veja como empresas saem do caos para o controle total em 30 dias
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-red-500/20 p-8 bg-red-500/5">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-red-400">
            <X className="h-6 w-6" />
            Antes da ElevaLucro
          </h3>
          <div className="space-y-4">
            {defaultComparisons.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                <p className="text-slate-300/90">{item.before}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 p-8 bg-emerald-500/5">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-emerald-300">
            <CheckCircle className="h-6 w-6" />
            Com a ElevaLucro
          </h3>
          <div className="space-y-4">
            {defaultComparisons.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300/90">{item.after}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-emerald-300 font-semibold">Resultado:</span>
          <span className="text-white">Mais controle, menos stress, melhores decisões</span>
        </div>
      </div>
    </section>
  );
}