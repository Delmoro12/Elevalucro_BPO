'use client';

import React from 'react';
import { ClientDetailPage } from '@/src/frontend/internal_tools/operational/clients/pages/ClientDetailPage';
import { AuthProvider } from '@/src/frontend/internal_tools/auth/contexts/AuthContext';
import { ThemeProvider } from '@/src/frontend/internal_tools/shared/components/ThemeProvider';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ClientDetailRoute({ params }: PageProps) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ClientDetailPage companyId={params.id} />
      </ThemeProvider>
    </AuthProvider>
  );
}
