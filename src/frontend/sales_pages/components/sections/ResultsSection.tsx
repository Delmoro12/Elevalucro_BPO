"use client";

import { Star, TrendingUp, Clock, PiggyBank, Target } from "lucide-react";
import { useTranslation } from '@/src/i18n';
import { type Locale } from '@/src/i18n/config';

interface Testimonial {
  text: string;
  author: string;
  role: string;
  company: string;
  rating: number;
}

interface Metric {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    text: "Antes eu perdia 2 horas por dia com planilhas. Hoje, em 5 minutos no app da ElevaLucro sei exatamente como está minha empresa.",
    author: "Carlos Mendes",
    role: "CEO",
    company: "Mendes Consultoria",
    rating: 5
  },
  {
    text: "A transparência é impressionante. Consigo ver cada centavo, aprovar pagamentos e ter relatórios que antes levavam semanas para fazer.",
    author: "Ana Paula",
    role: "Diretora Financeira",
    company: "Tech Solutions BR",
    rating: 5
  },
  {
    text: "Economizei R$ 8.000/mês comparado a ter um analista CLT. E o melhor: a qualidade é muito superior.",
    author: "Roberto Silva",
    role: "Fundador",
    company: "Silva & Associados",
    rating: 5
  }
];

const defaultMetrics: Metric[] = [
  {
    icon: <Clock className="h-8 w-8 text-emerald-300" />,
    value: "95%",
    label: "Redução de tempo com financeiro"
  },
  {
    icon: <PiggyBank className="h-8 w-8 text-emerald-300" />,
    value: "60%",
    label: "Economia vs funcionário CLT"
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-emerald-300" />,
    value: "100%",
    label: "Dos clientes renovam"
  },
  {
    icon: <Target className="h-8 w-8 text-emerald-300" />,
    value: "30 dias",
    label: "Para estar 100% organizado"
  }
];

interface ResultsSectionProps {
  locale?: Locale;
}

export default function ResultsSection({ locale = 'pt-BR' }: ResultsSectionProps) {
  const { t } = useTranslation(locale);
  return (
    <section id="resultados" className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">
          {t('results.title').split(t('results.titleHighlight'))[0]}
          <span className="text-emerald-300">{t('results.titleHighlight')}</span>
          {t('results.title').split(t('results.titleHighlight'))[1]}
        </h2>
        <p className="text-xl text-slate-300/90 max-w-3xl mx-auto">
          {t('results.subtitle')}
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
        {defaultMetrics.map((metric, index) => (
          <div key={index} className="text-center p-4 md:p-6 rounded-2xl bg-slate-900/60 border border-white/10">
            <div className="mb-2 md:mb-3 flex justify-center">{metric.icon}</div>
            <div className="text-2xl md:text-3xl font-bold text-emerald-300 mb-1 md:mb-2">{metric.value}</div>
            <p className="text-xs md:text-sm text-slate-300/90">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Depoimentos */}
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {defaultTestimonials.map((testimonial, index) => (
          <div key={index} className="p-4 md:p-6 rounded-2xl bg-slate-900/60 border border-white/10">
            <div className="flex mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-slate-300/90 mb-6 italic">
              "{testimonial.text}"
            </blockquote>
            <div className="border-t border-white/10 pt-4">
              <cite className="not-italic">
                <div className="font-semibold text-emerald-300">{testimonial.author}</div>
                <div className="text-sm text-slate-400">{testimonial.role} • {testimonial.company}</div>
              </cite>
            </div>
          </div>
        ))}
      </div>

      {/* CTA de prova social */}
      <div className="mt-12 text-center">
        <p className="text-lg text-slate-300/90 mb-4">
          Junte-se a <span className="text-emerald-300 font-semibold">mais de 100 empresas</span> que já transformaram sua gestão financeira
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
          <span>• Consultoria</span>
          <span>• Tecnologia</span>
          <span>• Saúde</span>
          <span>• Serviços</span>
        </div>
      </div>
    </section>
  );
}