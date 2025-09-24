"use client";

import { Zap, Code, Puzzle, Settings, ShieldCheck, Eye, Smartphone, Clock, X } from "lucide-react";
import { useTranslation } from '@/src/i18n';
import { type Locale } from '@/src/i18n/config';

interface TechnologyDifferentialSectionProps {
  locale?: Locale;
}

export default function TechnologyDifferentialSection({ locale = 'pt-BR' }: TechnologyDifferentialSectionProps) {
  const { t, tArray } = useTranslation(locale);
  const traditionalItems = tArray('technology.traditional.items') || [];
  const ourItems = tArray('technology.ours.items') || [];

  return (
    <section id="seguranca" className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6">
          <Zap className="h-4 w-4" />
          {t('technology.badge')}
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">
          {t('technology.title').split(t('technology.titleHighlight'))[0]}
          <span className="text-emerald-300">{t('technology.titleHighlight')}</span>
          {t('technology.title').split(t('technology.titleHighlight'))[1]}
        </h2>
        <p className="text-xl text-slate-300/90 max-w-3xl mx-auto">
          {t('technology.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="rounded-2xl border border-red-500/20 p-8 bg-red-500/5">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-red-400">
            <X className="h-6 w-6" />
            {t('technology.traditional.title')}
          </h3>
          <div className="space-y-4">
            {traditionalItems.map((item: any, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-red-300 mb-1">{item.title}</p>
                  <p className="text-sm text-slate-300/90">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 p-8 bg-gradient-to-br from-emerald-500/10 to-emerald-400/5">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-emerald-300">
            <Code className="h-6 w-6" />
            {t('technology.ours.title')}
          </h3>
          <div className="space-y-4">
            {ourItems.map((item: any, index: number) => {
              const icons = [Settings, Puzzle, Eye, Smartphone];
              const IconComponent = icons[index] || Settings;
              
              return (
                <div key={index} className="flex items-start gap-3">
                  <IconComponent className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white mb-1">{item.title}</p>
                    <p className="text-sm text-slate-300/90">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </section>
  );
}