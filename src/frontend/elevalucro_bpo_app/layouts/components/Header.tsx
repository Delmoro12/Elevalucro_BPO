'use client';

import React from 'react';
import { 
  Menu,
  Bell,
  User,
  Search
} from 'lucide-react';
import { ThemeToggle } from '../../shared/components/ThemeToggle';
import { useAuth } from '../../auth/contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
  currentPage?: string;
}

const getPageTitle = (pathname: string): { title: string; subtitle: string } => {
  switch (pathname) {
    case 'dashboards':
      return {
        title: 'Dashboard',
        subtitle: 'Visão geral dos seus indicadores financeiros'
      };
    case 'my_finance':
      return {
        title: 'Minhas Finanças',
        subtitle: 'Controle suas receitas e despesas'
      };
    case 'actions':
      return {
        title: 'Ações',
        subtitle: 'Gerencie suas tarefas e acompanhe o progresso'
      };
    case 'approvals':
      return {
        title: 'Aprovações',
        subtitle: 'Gerencie aprovações e workflows pendentes'
      };
    case 'documents':
      return {
        title: 'Documentos',
        subtitle: 'Central de documentos e arquivos'
      };
    case 'tickets':
      return {
        title: 'Tickets',
        subtitle: 'Suporte e atendimento ao cliente'
      };
    case 'integrations':
      return {
        title: 'Integrações',
        subtitle: 'Conecte suas ferramentas e sistemas externos'
      };
    case 'auth':
      return {
        title: 'Autenticação',
        subtitle: 'Gerenciamento de acesso e segurança'
      };
    default:
      return {
        title: 'ElevaLucro BPO',
        subtitle: 'Plataforma de gestão empresarial'
      };
  }
};

export const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  sidebarCollapsed, 
  currentPage = 'dashboard' 
}) => {
  const { title, subtitle } = getPageTitle(currentPage);
  const { user } = useAuth();
  
  // Extrair nome do usuário (priorizar full_name, depois email)
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center">
          {/* Menu button para mobile */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page title */}
          <div className={`${sidebarCollapsed ? 'ml-0' : 'ml-4 lg:ml-0'}`}>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <button className="p-2 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hidden md:block">
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-emerald-500 rounded-full"></span>
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User menu */}
          <div className="relative">
            <button className="flex items-center p-2 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              <User className="h-5 w-5" />
              <span className="ml-2 text-sm font-medium hidden md:block">
                Olá, {userName}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};