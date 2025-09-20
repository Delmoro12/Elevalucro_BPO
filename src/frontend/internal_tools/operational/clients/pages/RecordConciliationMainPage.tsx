'use client';

import React, { useState, useEffect } from 'react';
import { RecordConciliationTable } from '../components/recordConciliation/RecordConciliationTable';
import { RecordConciliationSidebarModal } from '../components/recordConciliation/RecordConciliationSidebarModal';
import { useRecordConciliation } from '../hooks/useRecordConciliation';
import { recordConciliationApi } from '../services/recordConciliation.api';
import type { ReconciliationRecord, ReconciliationValidationRequest } from '../types/recordConciliation';

interface RecordConciliationMainPageProps {
  companyId: string;
}

const RecordConciliationMainPage: React.FC<RecordConciliationMainPageProps> = ({
  companyId
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ReconciliationRecord | null>(null);
  
  const { records, loading, error, stats, refetch } = useRecordConciliation(companyId);

  // Limpar dados ao mudar de empresa ou desmontar componente
  useEffect(() => {
    console.log(`🔄 RecordConciliation: Component mounted/updated for company ${companyId}`);
    
    return () => {
      console.log(`🧹 RecordConciliation: Cleaning up data for company ${companyId}`);
    };
  }, [companyId]);

  const handleView = (record: ReconciliationRecord) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleValidate = (record: ReconciliationRecord) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleReject = async (record: ReconciliationRecord) => {
    const reason = prompt('Motivo da rejeição:');
    if (!reason) return;

    try {
      await recordConciliationApi.reject(record.id, record.type, reason);
      await refetch();
    } catch (error) {
      console.error('Erro ao rejeitar registro:', error);
    }
  };

  const handleModalValidate = async (id: string, data: ReconciliationValidationRequest): Promise<boolean> => {
    try {
      if (!selectedRecord) return false;
      
      await recordConciliationApi.validate(id, selectedRecord.type, data);
      
      // Fechar modal primeiro
      setModalOpen(false);
      setSelectedRecord(null);
      
      // Depois fazer refetch
      await refetch();
      
      // Não mostrar popup - deixar a UI reagir naturalmente
      
      return true;
    } catch (error) {
      console.error('Erro ao validar registro:', error);
      console.error('Erro ao validar registro');
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabela de conciliação */}
      <RecordConciliationTable
        records={records}
        loading={loading}
        error={error}
        onView={handleView}
        onValidate={handleValidate}
        onReject={handleReject}
        onRefresh={refetch}
      />

      {/* Modal de validação/visualização */}
      <RecordConciliationSidebarModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onValidate={handleModalValidate}
        record={selectedRecord}
        companyId={companyId}
      />
    </div>
  );
};

export default RecordConciliationMainPage;