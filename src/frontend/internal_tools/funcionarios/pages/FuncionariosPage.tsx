'use client';

import React from 'react';

export default function FuncionariosPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Gestão de Funcionários
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Gerencie os funcionários e suas permissões no sistema
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
            Funcionalidade em desenvolvimento
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            A tela de gestão de funcionários estará disponível em breve.
          </p>
        </div>
      </div>
    </div>
  );
}