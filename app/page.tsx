'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para o dashboard da aplicação
    router.replace('/elevalucro_bpo_app/dashboard');
  }, [router]);

  // Página de loading enquanto redireciona
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ElevaLucro BPO
        </h1>
        <p className="text-gray-600 mb-4">
          Sistema de gestão financeira
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}