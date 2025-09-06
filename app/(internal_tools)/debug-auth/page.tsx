'use client';

import { useEffect, useState } from 'react';

export default function DebugAuthPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const savedInfo = localStorage.getItem('auth-debug-info');
    if (savedInfo) {
      try {
        setDebugInfo(JSON.parse(savedInfo));
      } catch (e) {
        console.error('Erro ao parsear debug info:', e);
      }
    }
  }, []);

  const clearDebugInfo = () => {
    localStorage.removeItem('auth-debug-info');
    setDebugInfo(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Debug de Autenticação</h1>
        
        {debugInfo ? (
          <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">📊 Informações Coletadas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>🌐 Hostname:</strong> {debugInfo.hostname}
                </div>
                <div>
                  <strong>🔒 Protocol:</strong> {debugInfo.protocol}
                </div>
                <div>
                  <strong>⏰ Timestamp:</strong> {debugInfo.timestamp}
                </div>
                <div>
                  <strong>🏷️ Role:</strong> {debugInfo.role || 'Não encontrada'}
                </div>
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">🍪 Cookies</h2>
              <pre className="bg-slate-700 p-4 rounded text-sm overflow-x-auto">
                {debugInfo.cookies}
              </pre>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">🎫 JWT Payload</h2>
              <pre className="bg-slate-700 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(debugInfo.jwtPayload, null, 2)}
              </pre>
            </div>

            <button
              onClick={clearDebugInfo}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              🗑️ Limpar Debug Info
            </button>
          </div>
        ) : (
          <div className="bg-slate-800 p-6 rounded-lg text-center">
            <p className="text-lg">❌ Nenhuma informação de debug encontrada</p>
            <p className="text-slate-400 mt-2">
              Faça login primeiro para gerar as informações de debug
            </p>
          </div>
        )}
      </div>
    </div>
  );
}