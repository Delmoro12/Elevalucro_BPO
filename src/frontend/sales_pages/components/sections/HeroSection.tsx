"use client";

import { ArrowRight } from "lucide-react";
import { useTranslation } from '@/src/i18n';
import { type Locale } from '@/src/i18n/config';

interface HeroSectionProps {
  locale?: Locale;
  badgeIcon?: React.ReactNode;
  ctaIcon?: string;
  onCtaClick?: () => void;
}

export default function HeroSection({
  locale = 'pt-BR',
  badgeIcon,
  ctaIcon = "👉",
  onCtaClick
}: HeroSectionProps) {
  const { t } = useTranslation(locale);
  const handleClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      const planosSection = document.getElementById('planos');
      if (planosSection) {
        planosSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative">
      <div className="absolute inset-0 bg-[radial-gradient(40%_60%_at_70%_10%,rgba(16,185,129,.15),transparent)] pointer-events-none" />
      <div className="mx-auto max-w-6xl px-4 py-20 md:py-32 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/10 text-emerald-300 text-sm font-medium mb-6 animate-pulse">
            {badgeIcon}
            {t('hero.badge')}
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6">
            {t('hero.title')} <span className="text-emerald-300">{t('hero.titleHighlight')}</span>
          </h1>
          <p className="text-xl text-slate-300/90 mb-8 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="relative z-10">
            <button 
              type="button"
              onClick={handleClick}
              className="relative z-10 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-emerald-500/30">
              {ctaIcon} {t('hero.ctaText')}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}