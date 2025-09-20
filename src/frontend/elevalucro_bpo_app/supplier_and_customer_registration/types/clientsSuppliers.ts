export interface ClientSupplier {
  id: string;
  company_id: string;
  name: string;
  type: 'client' | 'supplier';
  cnpj?: string;
  cpf?: string;
  email_billing?: string;
  whatsapp?: string;
  phone?: string;
  pix?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  observations?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientSupplierFormData {
  name: string;
  type: 'client' | 'supplier';
  cnpj?: string;
  cpf?: string;
  email_billing?: string;
  whatsapp?: string;
  phone?: string;
  pix?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  observations?: string;
  is_active?: boolean;
}

export interface ClientSupplierFilters {
  search?: string;
  type?: 'client' | 'supplier' | 'all';
  is_active?: boolean;
}

export type ClientSupplierStatusTab = 'all' | 'clients' | 'suppliers';