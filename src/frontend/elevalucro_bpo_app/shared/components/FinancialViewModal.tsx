'use client';

import React from 'react';
import { Eye, X, Calendar, User, CreditCard, FileText, Hash, DollarSign } from 'lucide-react';
import { ModalSidebar } from './ModalSidebar';

// Interface baseada na view financial_transactions_view
interface FinancialTransaction {
  id: string;
  company_id: string;
  type: 'receivable' | 'payable';
  created_by_side: string;
  pix_number?: string;
  bank_slip_code?: string;
  payment_method?: string;
  companies_clients_suppliers_id?: string;
  due_date?: string;
  value: number;
  date_of_issue?: string;
  number_of_document?: string;
  notes?: string;
  occurrence?: string;
  status: string;
  payment_date?: string;
  paid_amount?: number;
  financial_account_id?: string;
  parent_account_id?: string;
  series_id?: string;
  recurrence_config?: any;
  installment_number?: number;
  installment_total?: number;
  validated?: boolean;
  validated_at?: string;
  validated_by?: string;
  third_party_name?: string;
  third_party_email?: string;
  third_party_document?: string;
  third_party_type?: string;
  third_party_phone?: string;
  third_party_whatsapp?: string;
  third_party_pix?: string;
  supplier_name?: string;
  client_name?: string;
  category_name?: string;
  category_id?: string;
  dre_group_name?: string;
  dre_group_order?: number;
  status_vencimento?: string;
  dias_vencimento?: number;
  value_formatted?: string;
  due_date_formatted?: string;
  date_of_issue_formatted?: string;
  type_label?: string;
  third_party_label?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  created_by_email?: string;
  updated_by_email?: string;
  validated_by_email?: string;
  validated_by_name?: string;
  search_text?: string;
}

interface FinancialViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: FinancialTransaction | null;
}

const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR') + ' ' + 
         new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const getStatusLabel = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Pendente',
    'paid': 'Pago',
    'overdue': 'Vencido',
    'cancelled': 'Cancelado',
    'partial': 'Pago Parcialmente'
  };
  return statusMap[status] || status;
};

const getPaymentMethodLabel = (method: string | undefined): string => {
  if (!method) return '-';
  const methodMap: { [key: string]: string } = {
    'pix': 'PIX',
    'bank_slip': 'Boleto',
    'bank_transfer': 'Transferência',
    'credit_card': 'Cartão de Crédito',
    'debit_card': 'Cartão de Débito',
    'cash': 'Dinheiro',
    'check': 'Cheque'
  };
  return methodMap[method] || method;
};

const getOccurrenceLabel = (occurrence: string | undefined): string => {
  if (!occurrence) return '-';
  const occurrenceMap: { [key: string]: string } = {
    'unique': 'Única',
    'weekly': 'Semanal',
    'biweekly': 'Quinzenal',
    'monthly': 'Mensal',
    'quarterly': 'Trimestral',
    'semiannual': 'Semestral',
    'annual': 'Anual',
    'installments': 'Parcelada'
  };
  return occurrenceMap[occurrence] || occurrence;
};

export const FinancialViewModal: React.FC<FinancialViewModalProps> = ({
  isOpen,
  onClose,
  transaction
}) => {
  if (!transaction) return null;

  const isReceivable = transaction.type === 'receivable';
  const title = isReceivable ? 'Detalhes da Conta a Receber' : 'Detalhes da Conta a Pagar';
  const subtitle = `Visualização completa dos dados do registro financeiro`;

  return (
    <ModalSidebar
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={Eye}
      width="lg"
    >
      <div className="p-6 space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Informações Básicas
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                {transaction.type_label || (isReceivable ? 'Conta a Receber' : 'Conta a Pagar')}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                {getStatusLabel(transaction.status)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-900 dark:text-white">
                {transaction.value_formatted || formatCurrency(transaction.value)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data de Vencimento
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                {transaction.due_date_formatted || formatDate(transaction.due_date)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data de Pagamento
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                {transaction.payment_date ? formatDate(transaction.payment_date) : '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor Pago
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-900 dark:text-white">
                {transaction.paid_amount ? formatCurrency(transaction.paid_amount) : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Informações de Pagamento */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Informações de Pagamento
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Método de Pagamento
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                {getPaymentMethodLabel(transaction.payment_method)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ocorrência
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                {getOccurrenceLabel(transaction.occurrence)}
              </div>
            </div>

            {transaction.pix_number && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chave PIX
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono text-gray-900 dark:text-white">
                  {transaction.pix_number}
                </div>
              </div>
            )}

            {transaction.bank_slip_code && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código de Barras do Boleto
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono text-gray-900 dark:text-white break-all">
                  {transaction.bank_slip_code}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Terceiro / Cliente / Fornecedor */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            {isReceivable ? 'Cliente' : 'Fornecedor'}
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                {transaction.client_name || transaction.supplier_name || transaction.third_party_name || '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CNPJ/CPF
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                {transaction.third_party_document || '-'}
              </div>
            </div>

            {transaction.third_party_email && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                  {transaction.third_party_email}
                </div>
              </div>
            )}

            {transaction.third_party_phone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefone
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                  {transaction.third_party_phone}
                </div>
              </div>
            )}

            {transaction.third_party_pix && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  PIX do {isReceivable ? 'Cliente' : 'Fornecedor'}
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono text-gray-900 dark:text-white">
                  {transaction.third_party_pix}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Informações Adicionais
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número do Documento
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                {transaction.number_of_document || '-'}
              </div>
            </div>

            {transaction.date_of_issue && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data de Emissão
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                  {transaction.date_of_issue_formatted || formatDate(transaction.date_of_issue)}
                </div>
              </div>
            )}

            {transaction.category_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                  {transaction.category_name}
                </div>
              </div>
            )}

            {transaction.dre_group_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Grupo DRE
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                  {transaction.dre_group_name}
                </div>
              </div>
            )}

            {(transaction.installment_number && transaction.installment_total) && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parcela
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                  {transaction.installment_number} de {transaction.installment_total}
                </div>
              </div>
            )}

            {transaction.notes && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observações
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white min-h-[80px]">
                  {transaction.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informações de Auditoria */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Auditoria
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Criado em
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                {formatDateTime(transaction.created_at)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Criado por
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                {transaction.created_by_email || '-'}
              </div>
            </div>

            {transaction.updated_at && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Atualizado em
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                    {formatDateTime(transaction.updated_at)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Atualizado por
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                    {transaction.updated_by_email || '-'}
                  </div>
                </div>
              </>
            )}

            {transaction.validated && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Validado em
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                    {formatDateTime(transaction.validated_at)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Validado por
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                    {transaction.validated_by_name || transaction.validated_by_email || '-'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ModalSidebar>
  );
};