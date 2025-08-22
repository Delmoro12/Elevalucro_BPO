'use client';

import React, { useState } from 'react';
import { DocumentUploadModal } from '../components/DocumentUploadModal';
import { DocumentsKanban } from '../components/DocumentsKanban';
import { Plus, FileText } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg mr-3">
              <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Central de Documentos
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gerencie e organize seus documentos fiscais com inteligência artificial
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Documento
          </button>
        </div>
      </div>

      {/* Kanban de Documentos */}
      <DocumentsKanban />

      {/* Modal de Upload */}
      {isModalOpen && (
        <DocumentUploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};