'use client';

import React, { useState } from 'react';
import { DocumentUploadModal } from '../components/DocumentUploadModal';
import { ExcelUploadModal } from '../components/ExcelUploadModal';
import { DocumentsTableView } from '../components/DocumentsTableView';
import { FileText } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
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
      </div>

      {/* Table View de Documentos */}
      <DocumentsTableView 
        onOpenDocumentModal={() => setIsDocumentModalOpen(true)}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
      />

      {/* Modais de Upload */}
      {isDocumentModalOpen && (
        <DocumentUploadModal
          isOpen={isDocumentModalOpen}
          onClose={() => setIsDocumentModalOpen(false)}
        />
      )}
      
      {isExcelModalOpen && (
        <ExcelUploadModal
          isOpen={isExcelModalOpen}
          onClose={() => setIsExcelModalOpen(false)}
        />
      )}
    </div>
  );
};