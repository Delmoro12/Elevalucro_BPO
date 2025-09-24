"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: "Como funciona a segurança dos pagamentos?",
    answer: "Nossa equipe NÃO tem acesso às suas contas bancárias. Nós organizamos tudo e enviamos para sua aprovação via app. Só você tem autorização para aprovar ou rejeitar pagamentos. É 100% seguro."
  },
  {
    question: "Quanto tempo leva para estar 100% operacional?",
    answer: "Em 30 dias seu financeiro estará completamente organizado e operacional. Temos um processo de onboarding estruturado semana a semana, com acompanhamento dedicado."
  },
  {
    question: "É mais barato que contratar um funcionário?",
    answer: "Sim! Um analista financeiro CLT custa em média R$ 3.500 + encargos (total ~R$ 7.000). Nossos planos começam em R$ 1.200/mês com uma equipe inteira cuidando do seu financeiro."
  },
  {
    question: "Preciso mudar meu contador?",
    answer: "Não! Nós cuidamos da gestão financeira (fluxo de caixa, pagamentos, recebimentos). Seu contador continua cuidando da parte fiscal e contábil. Na verdade, facilitamos o trabalho dele com documentos organizados."
  },
  {
    question: "Como funciona o app de aprovação?",
    answer: "Você recebe uma notificação diária no WhatsApp com um link seguro. Ao clicar, acessa nosso app onde vê todos os pagamentos do dia com detalhes. Em 2-3 minutos você aprova ou rejeita cada um."
  },
  {
    question: "E se eu não gostar do serviço?",
    answer: "Temos garantia de satisfação de 30 dias. Se não ficar satisfeito, devolvemos 100% do valor pago. Mas isso nunca aconteceu - 100% dos nossos clientes renovam."
  },
  {
    question: "Vocês atendem empresas de qual porte?",
    answer: "Atendemos desde pequenas empresas faturando R$ 50 mil/mês até empresas de médio porte com faturamento acima de R$ 1 milhão/mês. Temos planos adequados para cada necessidade."
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Não temos fidelidade. Você pode cancelar quando quiser, apenas avisando com 30 dias de antecedência."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/10 text-emerald-300 text-sm font-medium mb-6">
          <HelpCircle className="h-4 w-4" />
          Tire suas dúvidas
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">
          Perguntas <span className="text-emerald-300">frequentes</span>
        </h2>
        <p className="text-xl text-slate-300/90 max-w-3xl mx-auto">
          Tudo que você precisa saber antes de começar
        </p>
      </div>

      <div className="space-y-4">
        {defaultFAQs.map((faq, index) => (
          <div 
            key={index}
            className="rounded-xl border border-white/10 bg-slate-900/60 overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <span className="font-medium text-white pr-4">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 text-emerald-300 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-emerald-300 flex-shrink-0" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4">
                <p className="text-slate-300/90">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
        <p className="text-lg text-white mb-2">Ainda tem dúvidas?</p>
        <p className="text-slate-300/90">
          Fale com nosso time de especialistas pelo WhatsApp e tire todas as suas dúvidas
        </p>
        <button className="mt-4 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          Falar com especialista
        </button>
      </div>
    </section>
  );
}