"use client";

import { useTranslation } from '@/src/i18n';
import { type Locale } from '@/src/i18n/config';

interface FooterProps {
  locale?: Locale;
}

export default function Footer({ locale = 'pt-BR' }: FooterProps) {
  const { t } = useTranslation(locale);
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo e descrição */}
          <div>
            <img 
              src="/images/Logo ElevaLucro.png" 
              alt="ElevaLucro"
              className="h-8 w-auto mb-4"
            />
            <p className="text-sm text-slate-400">
              {t('footer.description')}
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#como-funciona" className="hover:text-white transition-colors">{t('footer.links.howItWorks')}</a></li>
              <li><a href="#beneficios" className="hover:text-white transition-colors">{t('footer.links.benefits')}</a></li>
              <li><a href="#planos" className="hover:text-white transition-colors">{t('footer.links.plans')}</a></li>
              <li><a href="#contato" className="hover:text-white transition-colors">{t('footer.links.contact')}</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>{t('footer.whatsapp')}</li>
              <li>{t('footer.email')}</li>
              <li>{t('footer.hours')}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-sm text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {currentYear} {t('footer.copyright')}</p>
          <p className="text-slate-500">{t('footer.tagline')}</p>
        </div>
      </div>
    </footer>
  );
}