import dynamic from 'next/dynamic'

const LoginPage = dynamic(() => import('@/src/frontend/elevalucro_bpo_app/auth/pages/LoginPage'), {
  ssr: false
})

export default function LoginPageRoute() {
  return <LoginPage />
}