"use client";

import { useState, useEffect } from 'react';
import { Locale, defaultLocale, isValidLocale } from './config';

export function useLocale() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only run on client side
    setIsClient(true);
    
    // Get locale from localStorage or use default
    const savedLocale = localStorage.getItem('elevalucro-locale');
    if (savedLocale && isValidLocale(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('elevalucro-locale', newLocale);
    }
  };

  return {
    locale,
    changeLocale,
    isClient
  };
}