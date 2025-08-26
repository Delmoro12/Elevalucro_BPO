// Tipos de usuário e autenticação
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'viewer'
  orgId: string
  mfaEnabled: boolean
}