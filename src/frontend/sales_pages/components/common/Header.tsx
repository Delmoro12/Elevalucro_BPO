"use client";

import LanguageSelector from './LanguageSelector';
import { useTranslation } from '@/src/i18n';
import { type Locale } from '@/src/i18n/config';

interface HeaderProps {
  logoAlt?: string;
  locale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
}

export default function Header({ 
  logoAlt = "ElevaLucro - BPO Financeiro", 
  locale = 'pt-BR',
  onLocaleChange
}: HeaderProps) {
  const { t } = useTranslation(locale);

  const navItems = [
    { href: "#como-funciona", label: t('footer.links.howItWorks') },
    { href: "#beneficios", label: t('footer.links.benefits') },
    { href: "#seguranca", label: "Segurança" },
    { href: "#interface", label: "Interface" },
    { href: "#resultados", label: "Resultados" },
    { href: "#planos", label: t('footer.links.plans') },
    { href: "#contato", label: t('footer.links.contact') }
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/images/Logo ElevaLucro.png" 
            alt={logoAlt}
            className="h-10 w-auto"
          />
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            {navItems.map((item) => (
              <a 
                key={item.href}
                href={item.href} 
                className="hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          
          <div className="border-l border-white/10 pl-4">
            <LanguageSelector 
              currentLocale={locale} 
              onLocaleChange={onLocaleChange || (() => {})} 
            />
          </div>
        </div>
      </div>
    </header>
  );
}