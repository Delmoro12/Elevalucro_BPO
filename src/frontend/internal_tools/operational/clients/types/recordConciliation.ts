// Types para conciliação de registros (lado BPO)
export interface ReconciliationRecord {
  id: string;
  company_id: string;
  type: 'receivable' | 'payable';
  
  // Dados principais
  value: number;
  due_date: string;
  date_of_issue?: string;
  number_of_document?: string;
  notes?: string;
  
  // Pagamento específico (payable)
  pix_number?: string;
  bank_slip_code?: string;
  
  // Método e identificação
  payment_method: string;
  companies_clients_suppliers_id?: string;
  category_id?: string;
  
  // Status e validação
  status: string;
  validated: boolean;
  validated_at?: string;
  validated_by?: string;
  created_by_side: 'client_side' | 'bpo_side';
  
  // Recorrência
  occurrence: string;
  recurrence_config?: any;
  parent_account_id?: string;
  series_id?: string;
  
  // Relacionamentos (populados via query)
  client_name?: string;
  supplier_name?: string;
  third_party_name?: string;
  category_name?: string;
  validated_by_name?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export type ReconciliationStatusTab = 'pending_validation' | 'validated';

export interface ReconciliationFilters {
  search?: string;
  type?: 'receivable' | 'payable' | '';
  dateRange?: {
    start: string;
    end: string;
  };
  status?: ReconciliationStatusTab;
}

export interface ReconciliationValidationRequest {
  validated: boolean;
  validated_at: string;
  validated_by: string;
  notes?: string;
  category_id?: string;
}

export interface ReconciliationTableProps {
  companyId: string;
  onValidate?: (record: ReconciliationRecord) => void;
  onReject?: (record: ReconciliationRecord) => void;
  onView?: (record: ReconciliationRecord) => void;
  onRefresh?: () => void;
}

export interface ReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (id: string, data: ReconciliationValidationRequest) => Promise<boolean>;
  record: ReconciliationRecord | null;
  mode: 'view' | 'validate';
}