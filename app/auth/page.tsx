'use client';

export default function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          ✅ Senha definida com sucesso!
        </h2>
        <p className="text-gray-600 mb-4">
          Sua senha foi definida com sucesso. Você pode agora fazer login normalmente.
        </p>
        <a 
          href="/auth/login" 
          className="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Ir para Login
        </a>
      </div>
    </div>
  );
}