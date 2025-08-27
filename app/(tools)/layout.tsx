import { Metadata } from 'next';
import { MainPage } from '../../src/frontend/internal_tools/layouts/MainPage';
import { AuthProvider } from '../../src/frontend/internal_tools/auth/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Internal Tools - ElevaLucro BPO',
  description: 'Ferramentas internas ElevaLucro BPO',
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const theme = localStorage.getItem('internal-tools-theme');
              const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              
              if (theme === 'dark' || (!theme && systemPrefersDark)) {
                document.documentElement.classList.add('dark');
              }
            })();
          `,
        }}
      />
      <AuthProvider>
        <MainPage />
      </AuthProvider>
    </>
  );
}