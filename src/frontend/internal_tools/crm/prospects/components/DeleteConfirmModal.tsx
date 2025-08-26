import React from 'react';
import { X, AlertTriangle, XCircle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  prospectName: string;
  prospectCompany: string;
  prospectStatus: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  prospectName,
  prospectCompany,
  prospectStatus,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const isClientConverted = prospectStatus === 'signed';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="p-6">
            <div className="flex items-start">
              <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${
                isClientConverted 
                  ? 'bg-red-100 dark:bg-red-900/30' 
                  : 'bg-amber-100 dark:bg-amber-900/30'
              }`}>
                {isClientConverted ? (
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {isClientConverted ? 'Não é possível excluir' : 'Confirmar exclusão'}
                </h3>
                
                <div className="mt-2">
                  {isClientConverted ? (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Este prospect não pode ser excluído porque já foi convertido em cliente.
                      </p>
                      <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3 mt-3">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <strong>Prospect:</strong> {prospectName}
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <strong>Empresa:</strong> {prospectCompany}
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <strong>Status:</strong>{' '}
                          <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                            Contrato Assinado
                          </span>
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Para remover este registro, entre em contato com o administrador do sistema.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Tem certeza que deseja excluir este prospect? Esta ação não pode ser desfeita.
                      </p>
                      <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3 mt-3">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <strong>Prospect:</strong> {prospectName}
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <strong>Empresa:</strong> {prospectCompany}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="flex-shrink-0 ml-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 rounded-b-lg">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-50"
              >
                {isClientConverted ? 'Fechar' : 'Cancelar'}
              </button>
              
              {!isClientConverted && (
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    'Excluir Prospect'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};