"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/src/i18n/config';

interface LanguageSelectorProps {
  currentLocale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

export default function LanguageSelector({ 
  currentLocale,
  onLocaleChange
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (newLocale: Locale) => {
    // Save to localStorage and trigger parent component update
    localStorage.setItem('elevalucro-locale', newLocale);
    onLocaleChange(newLocale);
    setIsOpen(false);
  };

  // Don't render on server side to avoid hydration issues
  if (!isClient) {
    return (
      <div className="w-[120px] h-[40px] bg-slate-800/50 rounded-lg animate-pulse" />
    );
  }

  const currentFlag = localeFlags[currentLocale];
  const currentName = localeNames[currentLocale];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-white/10 text-sm"
        aria-label="Select language"
      >
        <span className="text-lg">{currentFlag}</span>
        <span className="hidden sm:inline text-slate-300">
          {currentLocale.toUpperCase()}
        </span>
        <ChevronDown 
          className={`h-4 w-4 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 bg-slate-800 rounded-lg border border-white/10 shadow-xl z-50 min-w-[180px] overflow-hidden">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLanguageChange(locale)}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-700 w-full text-left transition-colors ${
                locale === currentLocale 
                  ? 'bg-slate-700/50 text-emerald-300' 
                  : 'text-slate-300'
              }`}
            >
              <span className="text-lg">{localeFlags[locale]}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {localeNames[locale]}
                </span>
                <span className="text-xs text-slate-500">
                  {locale}
                </span>
              </div>
              {locale === currentLocale && (
                <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}