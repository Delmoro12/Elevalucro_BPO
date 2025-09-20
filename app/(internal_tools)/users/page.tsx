import { MainPage } from '@/src/frontend/internal_tools/layouts/MainPage'
import { AuthProvider } from '@/src/frontend/internal_tools/auth/contexts/AuthContext'

export default function UsersPage() {
  return (
    <AuthProvider>
      <MainPage />
    </AuthProvider>
  )
}