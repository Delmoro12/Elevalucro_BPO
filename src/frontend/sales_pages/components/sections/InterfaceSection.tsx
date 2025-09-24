"use client";

import { FileText, Users, Clock, BarChart3, TrendingUp, CheckCircle } from "lucide-react";
import { useTranslation } from '@/src/i18n';
import { type Locale } from '@/src/i18n/config';

interface InterfaceSectionProps {
  locale?: Locale;
}

export default function InterfaceSection({ locale = 'pt-BR' }: InterfaceSectionProps) {
  const { t, tArray } = useTranslation(locale);
  
  const features = [
    {
      icon: <FileText className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />,
      text: tArray('interface.features')[0]
    },
    {
      icon: <Users className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />,
      text: tArray('interface.features')[1]
    },
    {
      icon: <Clock className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />,
      text: tArray('interface.features')[2]
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />,
      text: tArray('interface.features')[3]
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />,
      text: tArray('interface.features')[4]
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />,
      text: tArray('interface.features')[5]
    }
  ];
  return (
    <section id="interface" className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">
          {t('interface.title').split('interface exclusiva')[0]}
          <span className="text-emerald-300">{t('interface.titleHighlight')}</span>
          {t('interface.title').split('interface exclusiva')[1]}
        </h2>
        <p className="text-slate-300/90 text-lg mb-12 max-w-3xl mx-auto">
          {t('interface.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <h3 className="text-2xl font-semibold mb-4">{t('interface.techTitle')}</h3>
          <p className="text-slate-300/90 mb-6">
            {t('interface.techDescription')}
          </p>
          <p className="text-slate-300/90">
            <span className="text-emerald-300 font-semibold">{t('interface.techResult')}</span> {t('interface.techResultText')}
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
            <p className="font-medium">{t('interface.bottomText')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}