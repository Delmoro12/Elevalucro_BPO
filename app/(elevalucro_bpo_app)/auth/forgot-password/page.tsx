import dynamic from 'next/dynamic';
import { AuthProvider } from '@/src/frontend/elevalucro_bpo_app/auth/contexts/AuthContext';

const ForgotPasswordPage = dynamic(() => import('@/src/frontend/elevalucro_bpo_app/auth/pages/ForgotPasswordPage'), {
  ssr: false
});

export default function ForgotPasswordPageRoute() {
  return (
    <AuthProvider>
      <ForgotPasswordPage />
    </AuthProvider>
  );
}