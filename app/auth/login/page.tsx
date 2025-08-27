'use client';

import { useEffect, useState } from 'react';

// App BPO Components
import { LoginPage as AppLoginPage } from '../../../src/frontend/elevalucro_bpo_app/auth/pages/LoginPage'
import { AuthProvider as AppAuthProvider } from '../../../src/frontend/elevalucro_bpo_app/auth/contexts/AuthContext'

// Tools Components
import { LoginPage as ToolsLoginPage } from '../../../src/frontend/internal_tools/auth/pages/LoginPage'
import { AuthProvider as ToolsAuthProvider } from '../../../src/frontend/internal_tools/auth/contexts/AuthContext'

export default function AuthLoginRoute() {
  const [isToolsSubdomain, setIsToolsSubdomain] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we're on tools subdomain
    const hostname = window.location.hostname;
    setIsToolsSubdomain(hostname.startsWith('tools.'));
  }, []);

  // Loading state while detecting subdomain
  if (isToolsSubdomain === null) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render appropriate login based on subdomain
  if (isToolsSubdomain) {
    return (
      <ToolsAuthProvider>
        <ToolsLoginPage />
      </ToolsAuthProvider>
    );
  }

  // Default to app login (for app subdomain and main domain)
  return (
    <AppAuthProvider>
      <AppLoginPage />
    </AppAuthProvider>
  );
}