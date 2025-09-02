import dynamic from 'next/dynamic';
import { AuthProvider } from '@/src/frontend/elevalucro_bpo_app/auth/contexts/AuthContext';

const ResetPasswordPage = dynamic(() => import('@/src/frontend/elevalucro_bpo_app/auth/pages/ResetPasswordPage'), {
  ssr: false
});

export default function ResetPasswordPageRoute() {
  return (
    <AuthProvider>
      <ResetPasswordPage />
    </AuthProvider>
  );
}