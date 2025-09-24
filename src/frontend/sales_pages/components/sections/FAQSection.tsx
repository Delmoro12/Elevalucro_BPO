"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { useTranslation } from '@/src/i18n';
import { type Locale } from '@/src/i18n/config';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  locale?: Locale;
}

export default function FAQSection({ locale = 'pt-BR' }: FAQSectionProps) {
  const { t, tArray } = useTranslation(locale);
  const faqItems: FAQItem[] = (tArray('faq.items') as unknown as FAQItem[]) || [];
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
          {t('faq.title').split(t('faq.titleHighlight'))[0]}
          <span className="text-emerald-300">{t('faq.titleHighlight')}</span>
          {t('faq.title').split(t('faq.titleHighlight'))[1]}
        </h2>
        <p className="text-xl text-slate-300/90 max-w-3xl mx-auto">
          Tudo que você precisa saber antes de começar
        </p>
      </div>

      <div className="space-y-4">
        {faqItems.map((faq, index) => (
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