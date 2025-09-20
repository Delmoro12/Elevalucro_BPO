/**
 * Tipos base compartilhados entre todos os domínios
 */

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

export interface BaseEntityWithUser extends BaseEntity {
  created_by: string
  updated_by: string
  created_by_email?: string
  updated_by_email?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ListResponse<T> {
  data: T[]
  count: number
  page?: number
  limit?: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface FilterParams {
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: any
}

export type UserRole = 'client_side' | 'bpo_side' | 'admin'
export type TransactionStatus = 'pending' | 'paid' | 'cancelled'
export type TransactionType = 'payable' | 'receivable'
export type PaymentMethod = 'pix' | 'bank_slip' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'money' | 'check'
export type VencimentoStatus = 'em_dia' | 'vence_em_breve' | 'vencida'

export interface RecurrenceConfig {
  day_of_week?: string
  day_of_month?: number
  installment_count?: number
  installment_day?: number
}