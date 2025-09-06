'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';

export default function DebugAuthPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const runDiagnostics = async () => {
      const info: any = {
        timestamp: new Date().toISOString(),
        location: {
          hostname: window.location.hostname,
          protocol: window.location.protocol,
          href: window.location.href,
        },
        cookies: {
          all: document.cookie,
          sbAccessToken: document.cookie.split('; ').find(row => row.startsWith('sb-access-token=')),
        },
        supabase: {},
        jwt: {}
      };

      // Testar sessão do Supabase
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        info.supabase = {
          hasSession: !!session,
          error: error?.message,
          user: session?.user ? {
            id: session.user.id,
            email: session.user.email,
            user_metadata: session.user.user_metadata,
            app_metadata: session.user.app_metadata,
          } : null,
          accessToken: session?.access_token ? session.access_token.substring(0, 50) + '...' : null,
        };

        // Decodificar JWT se existir
        if (session?.access_token) {
          try {
            const payload = JSON.parse(atob(session.access_token.split('.')[1]));
            info.jwt = {
              payload,
              role: payload.user_metadata?.role || payload.app_metadata?.role,
              email: payload.email,
              sub: payload.sub,
            };
          } catch (e) {
            info.jwt.error = (e as Error).message;
          }
        }
      } catch (e) {
        info.supabase.error = (e as Error).message;
      }

      setDebugInfo(info);
    };

    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Debug de Autenticação</h1>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Informações de Debug</h2>
          <pre className="bg-slate-700 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="mt-6 bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Como usar</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Faça login normalmente em /tools-auth/login</li>
            <li>Volte para esta página</li>
            <li>Copie as informações acima</li>
            <li>Envie para o desenvolvedor</li>
          </ol>
        </div>
      </div>
    </div>
  );
}