'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle,
  Info,
  FileText
} from 'lucide-react';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExcelFileInfo {
  file: File | null;
  tipo: 'receitas' | 'despesas' | '';
  descricao: string;
}

interface PreviewData {
  headers: string[];
  rows: any[][];
  totalRows: number;
  mappedFields?: {
    data?: string;
    valor?: string;
    descricao?: string;
    categoria?: string;
    cliente?: string;
    fornecedor?: string;
  };
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({ isOpen, onClose }) => {
  const [fileInfo, setFileInfo] = useState<ExcelFileInfo>({
    file: null,
    tipo: '',
    descricao: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setFileInfo(prev => ({ ...prev, file }));
        processFilePreview(file);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setFileInfo(prev => ({ ...prev, file }));
        processFilePreview(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setError('Tipo de arquivo não suportado. Use XLSX, XLS ou CSV.');
      return false;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB para arquivos Excel
    if (file.size > maxSize) {
      setError('Arquivo muito grande. Máximo 50MB.');
      return false;
    }

    setError('');
    return true;
  };

  const processFilePreview = async (file: File) => {
    // Simula processamento e preview do arquivo
    // Em produção, isso seria feito via API
    setTimeout(() => {
      setPreviewData({
        headers: ['Data', 'Descrição', 'Valor', 'Categoria', 'Cliente/Fornecedor'],
        rows: [
          ['01/01/2025', 'Venda Produto A', 'R$ 1.500,00', 'Vendas', 'Cliente XYZ'],
          ['02/01/2025', 'Compra Material', 'R$ 450,00', 'Despesas', 'Fornecedor ABC'],
          ['03/01/2025', 'Serviço Prestado', 'R$ 2.200,00', 'Serviços', 'Cliente 123']
        ],
        totalRows: 150,
        mappedFields: {
          data: 'Data',
          valor: 'Valor',
          descricao: 'Descrição',
          categoria: 'Categoria',
          cliente: 'Cliente/Fornecedor'
        }
      });
      setShowPreview(true);
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!fileInfo.file || !fileInfo.tipo) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Simula processamento do arquivo
      console.log('Processando arquivo Excel:', fileInfo);
      
      // Simula delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Arquivo Excel enviado para processamento! A IA está analisando o formato e convertendo para o padrão Conta Azul.');
      
      onClose();
      
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setError('Erro ao processar arquivo. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl min-h-0 max-h-none sm:max-h-[90vh] my-4 sm:my-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg mr-3">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              Importar Arquivo Excel
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row min-h-0 max-h-none sm:h-[calc(90vh-120px)]">
          {/* Formulário de Upload */}
          <div className={`${showPreview ? 'lg:w-1/2' : 'w-full'} p-4 sm:p-6 ${showPreview ? 'lg:border-r border-b lg:border-b-0' : ''} border-slate-200 dark:border-slate-700 lg:overflow-y-auto`}>
            <div className="space-y-6">

              {/* Upload de Arquivo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Arquivo Excel *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors"
                >
                  {fileInfo.file ? (
                    <div className="flex items-center justify-center">
                      <FileSpreadsheet className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mr-2" />
                      <div className="text-left">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {fileInfo.file.name}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {(fileInfo.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500 dark:text-slate-400">
                        Clique para selecionar ou arraste o arquivo
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        XLSX, XLS, CSV até 50MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Tipo de Planilha */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tipo de Dados *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFileInfo(prev => ({ ...prev, tipo: 'receitas' }))}
                    className={`p-3 rounded-lg border-2 transition-colors text-left ${
                      fileInfo.tipo === 'receitas'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="font-medium text-sm">💰 Receitas</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Receitas e vendas
                    </p>
                  </button>
                  <button
                    onClick={() => setFileInfo(prev => ({ ...prev, tipo: 'despesas' }))}
                    className={`p-3 rounded-lg border-2 transition-colors text-left ${
                      fileInfo.tipo === 'despesas'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="font-medium text-sm">💸 Despesas</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Gastos e compras
                    </p>
                  </button>
                </div>
              </div>


              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Observações (Opcional)
                </label>
                <textarea
                  value={fileInfo.descricao}
                  onChange={(e) => setFileInfo(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Informações adicionais sobre o arquivo ou formato específico..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                />
              </div>

              {/* Exibição de Erro */}
              {error && (
                <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
                  <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                </div>
              )}

              {/* Botão de Processar */}
              <button
                onClick={handleSubmit}
                disabled={!fileInfo.file || !fileInfo.tipo || isProcessing}
                className="w-full flex items-center justify-center px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando com IA...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Processar Planilha
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview dos Dados */}
          {showPreview && previewData && (
            <div className="lg:w-1/2 w-full flex flex-col p-4 sm:p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Preview dos Dados
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Primeiras 3 linhas de {previewData.totalRows} total
                </p>
              </div>

              {/* Mapeamento Detectado */}
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 mr-2" />
                  <div className="text-sm">
                    <p className="font-medium text-emerald-700 dark:text-emerald-300">
                      Campos detectados automaticamente:
                    </p>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 space-y-1">
                      {previewData.mappedFields?.data && <div>• Data: {previewData.mappedFields.data}</div>}
                      {previewData.mappedFields?.valor && <div>• Valor: {previewData.mappedFields.valor}</div>}
                      {previewData.mappedFields?.descricao && <div>• Descrição: {previewData.mappedFields.descricao}</div>}
                      {previewData.mappedFields?.categoria && <div>• Categoria: {previewData.mappedFields.categoria}</div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabela Preview */}
              <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      {previewData.headers.map((header, index) => (
                        <th key={index} className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-xs text-yellow-700 dark:text-yellow-300">
                    <p className="font-medium">Nota:</p>
                    <p>Após o processamento, você poderá validar e corrigir os dados antes da importação final.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};