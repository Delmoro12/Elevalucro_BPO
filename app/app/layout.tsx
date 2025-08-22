'use client';

import { ThemeProvider } from '../../src/frontend/desktop_elevalucro_app/shared/components/ThemeProvider';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}