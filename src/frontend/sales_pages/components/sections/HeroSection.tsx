"use client";

import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  badge?: {
    icon?: React.ReactNode;
    text: string;
  };
  title: string;
  titleHighlight: string;
  subtitle: string;
  ctaText: string;
  ctaIcon?: string;
  onCtaClick?: () => void;
}

export default function HeroSection({
  badge,
  title,
  titleHighlight,
  subtitle,
  ctaText,
  ctaIcon = "👉",
  onCtaClick
}: HeroSectionProps) {
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
          {badge && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/10 text-emerald-300 text-sm font-medium mb-6 animate-pulse">
              {badge.icon}
              {badge.text}
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6">
            {title} <span className="text-emerald-300">{titleHighlight}</span>
          </h1>
          <p className="text-xl text-slate-300/90 mb-8 max-w-3xl mx-auto">
            {subtitle}
          </p>
          <div className="relative z-10">
            <button 
              type="button"
              onClick={handleClick}
              className="relative z-10 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-emerald-500/30">
              {ctaIcon} {ctaText}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}