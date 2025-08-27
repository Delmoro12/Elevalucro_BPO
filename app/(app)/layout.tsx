'use client';

import { ThemeProvider } from '../../src/frontend/elevalucro_bpo_app/shared/components/ThemeProvider';
import { AuthProvider } from '../../src/frontend/elevalucro_bpo_app/auth/contexts/AuthContext';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}