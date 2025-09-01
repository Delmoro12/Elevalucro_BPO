import { LoginPage } from '@/src/frontend/internal_tools/auth/pages/LoginPage'
import { AuthProvider } from '@/src/frontend/internal_tools/auth/contexts/AuthContext'

export default function LoginPageRoute() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  )
}