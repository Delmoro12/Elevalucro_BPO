'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../src/lib/supabase';

export default function DebugAuthPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Get cookies
        const cookies = document.cookie;
        
        const debug = {
          timestamp: new Date().toISOString(),
          hostname: window.location.hostname,
          session: session ? {
            user_id: session.user?.id,
            email: session.user?.email,
            app_metadata: session.user?.app_metadata,
            user_metadata: session.user?.user_metadata,
            access_token_preview: session.access_token?.substring(0, 50) + '...'
          } : null,
          error: error?.message,
          cookies: {
            all: cookies,
            hasAccessToken: cookies.includes('sb-access-token'),
            hasRefreshToken: cookies.includes('sb-refresh-token')
          }
        };
        
        // Try to decode JWT
        if (session?.access_token) {
          try {
            const payload = session.access_token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            debug.jwt = {
              app_metadata: decoded.app_metadata,
              user_metadata: decoded.user_metadata,
              role: decoded.role,
              aud: decoded.aud,
              exp: new Date(decoded.exp * 1000).toISOString()
            };
          } catch (e) {
            debug.jwt_error = e.message;
          }
        }
        
        setDebugInfo(debug);
        console.log('🔍 Auth Debug Info:', debug);
      } catch (error) {
        console.error('Debug error:', error);
        setDebugInfo({ error: error.message });
      }
    };
    
    checkAuth();
  }, []);
  
  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'delmoro123@gmail.com',
        password: 'temppass123'
      });
      
      console.log('Login result:', { data, error });
      
      // Wait and refresh debug info
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Debug Page</h1>
        
        <button 
          onClick={handleLogin}
          className="mb-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Login
        </button>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}