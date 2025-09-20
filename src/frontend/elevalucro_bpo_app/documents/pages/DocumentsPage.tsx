'use client';

import React, { useState, useRef } from 'react';
import { DocumentUploadModal } from '../components/DocumentUploadModal';
import { ExcelUploadModal } from '../components/ExcelUploadModal';
import { DocumentsTableView } from '../components/DocumentsTableView';
import { FileText } from 'lucide-react';

const DocumentsPage: React.FC = () => {
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDocumentSuccess = () => {
    // Força a atualização da tabela incrementando a key
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      {/* Table View de Documentos */}
      <DocumentsTableView 
        key={refreshKey}
        onOpenDocumentModal={() => setIsDocumentModalOpen(true)}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
      />

      {/* Modais de Upload */}
      {isDocumentModalOpen && (
        <DocumentUploadModal
          isOpen={isDocumentModalOpen}
          onClose={() => setIsDocumentModalOpen(false)}
          onSuccess={handleDocumentSuccess}
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
export default DocumentsPage;
