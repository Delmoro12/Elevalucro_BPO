// Tipos para aprovações
export interface Approval {
  id: string
  type: 'payment' | 'invoice'
  amount: number
  description: string
  status: 'pending' | 'approved' | 'rejected'
  requestedBy: string
  requestedAt: Date
}