'use client';

import React, { useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Apenas executar o hook para inicializar o tema
  useTheme();

  return <>{children}</>;
};