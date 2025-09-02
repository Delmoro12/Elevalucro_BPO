import dynamic from 'next/dynamic'
import { AuthProvider } from '@/src/frontend/elevalucro_bpo_app/auth/contexts/AuthContext'

const LoginPage = dynamic(() => import('@/src/frontend/elevalucro_bpo_app/auth/pages/LoginPage'), {
  ssr: false
})

export default function LoginPageRoute() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  )
}