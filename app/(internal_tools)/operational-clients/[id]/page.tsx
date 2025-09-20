'use client';

import React from 'react';
import { ClientDetailPage } from '@/src/frontend/internal_tools/operational/clients/pages/ClientDetailPage';
import { AuthProvider } from '@/src/frontend/internal_tools/auth/contexts/AuthContext';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ClientDetailRoute({ params }: PageProps) {
  return (
    <AuthProvider>
      <ClientDetailPage companyId={params.id} />
    </AuthProvider>
  );
}
