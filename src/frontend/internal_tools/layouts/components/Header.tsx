'use client';

import React, { useEffect, useState } from 'react';
import { 
  Menu,
  Bell,
  User,
  Search
} from 'lucide-react';
import { ThemeToggle } from '../../shared/components/ThemeToggle';
import { supabase } from '@/src/lib/supabase';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
  currentPage?: string;
}

const getPageTitle = (pathname: string): { title: string; subtitle: string } => {
  switch (pathname) {
    case 'crm':
      return {
        title: 'CRM',
        subtitle: 'Central de Relacionamento com Cliente'
      };
    case 'prospects':
      return {
        title: 'Prospects',
        subtitle: 'Gerencie seus prospects e leads'
      };
    case 'analytics':
      return {
        title: 'Analytics',
        subtitle: 'Relatórios e análises detalhadas'
      };
    case 'settings':
      return {
        title: 'Configurações',
        subtitle: 'Configurações do sistema interno'
      };
    default:
      return {
        title: 'Ferramentas Internas',
        subtitle: 'Painel administrativo do sistema'
      };
  }
};

export const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  sidebarCollapsed, 
  currentPage = 'crm' 
}) => {
  const { title, subtitle } = getPageTitle(currentPage);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from session
    const getUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Try to get name from user metadata first
          const fullName = session.user.user_metadata?.full_name;
          
          if (fullName) {
            // Get first name only
            const firstName = fullName.split(' ')[0];
            setUserName(firstName);
          } else {
            // Fallback to email
            const emailName = session.user.email?.split('@')[0] || 'Usuário';
            setUserName(emailName);
          }
        }
      } catch (error) {
        console.error('Error getting user data:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const fullName = session.user.user_metadata?.full_name;
          if (fullName) {
            const firstName = fullName.split(' ')[0];
            setUserName(firstName);
          } else {
            const emailName = session.user.email?.split('@')[0] || 'Usuário';
            setUserName(emailName);
          }
        } else {
          setUserName('');
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

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
                {loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  userName ? `Olá, ${userName}` : 'Usuário'
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};