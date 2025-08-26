'use client';

import { LoginPage } from '../../../src/frontend/elevalucro_bpo_app/auth/pages/LoginPage'
import { AuthProvider } from '../../../src/frontend/elevalucro_bpo_app/auth/contexts/AuthContext'

export default function AuthLoginRoute() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  )
}