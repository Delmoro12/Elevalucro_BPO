'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home,
  CheckSquare,
  FileText,
  MessageSquare,
  Zap,
  LogOut,
  TrendingUp,
  DollarSign,
  Workflow
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboards',
    label: 'Dashboard',
    icon: Home,
  },
  {
    id: 'my_finance',
    label: 'Minhas Finanças',
    icon: DollarSign,
  },
  {
    id: 'actions',
    label: 'Ações',
    icon: Workflow,
  },
  {
    id: 'approvals',
    label: 'Aprovações',
    icon: CheckSquare,
  },
  {
    id: 'documents',
    label: 'Documentos',
    icon: FileText,
  },
  {
    id: 'tickets',
    label: 'Tickets',
    icon: MessageSquare,
  },
  {
    id: 'integrations',
    label: 'Integrações',
    icon: Zap,
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  onToggle, 
  currentPage, 
  onPageChange 
}) => {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleLogout = () => {
    router.push('/app/login');
  };

  const toggleExpanded = (itemId: string) => {
    if (collapsed) return;
    
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const active = currentPage === item.id;
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <div key={item.id} className="mb-1">
          <button
            onClick={() => toggleExpanded(item.id)}
            className={`
              w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
              ${active 
                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }
              ${level > 0 ? 'ml-4' : ''}
            `}
          >
            <Icon className={`${collapsed ? 'h-5 w-5' : 'h-4 w-4 mr-3'} flex-shrink-0`} />
            
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {hasChildren && (
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isExpanded ? 'rotate-90' : ''
                    }`} 
                  />
                )}
              </>
            )}
          </button>
          
          {!collapsed && isExpanded && item.children && (
            <div className="mt-1 ml-4 space-y-1">
              {item.children.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => onPageChange(item.id)}
        className={`
          w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 mb-1
          ${active 
            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' 
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }
          ${level > 0 ? 'ml-4' : ''}
        `}
      >
        <Icon className={`${collapsed ? 'h-5 w-5' : 'h-4 w-4 mr-3'} flex-shrink-0`} />
        {!collapsed && <span>{item.label}</span>}
      </button>
    );
  };

  return (
    <>
      {/* Overlay para mobile */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 
        transition-all duration-300 ease-in-out z-50
        ${collapsed ? 'w-16' : 'w-64'}
        ${collapsed ? 'lg:translate-x-0' : 'lg:translate-x-0'}
        ${!collapsed ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
          {!collapsed && (
            <div className="flex items-center">
              <Image 
                src="/images/Logo ElevaLucro.png"
                alt="ElevaLucro"
                width={140}
                height={70}
                className="object-contain"
                style={{ marginLeft: '5px' }}
              />
              <span className="text-[12px] font-medium text-slate-900 dark:text-white" style={{ marginLeft: '-6px' }}>
                BPO
              </span>
            </div>
          )}
          
          {collapsed && (
            <div className="flex items-center justify-center">
              <Image 
                src="/images/Logo ElevaLucro.png"
                alt="ElevaLucro"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
          )}
          
          <button
            onClick={onToggle}
            className={`
              p-1.5 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 
              hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors
              ${collapsed ? 'mx-auto' : ''}
            `}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-3">
          {!collapsed ? (
            <div className="space-y-3">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-3" />
                <span>Sair</span>
              </button>
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                ElevaLucro BPO
                <br />
                Sistema de Gestão
              </div>
            </div>
          ) : (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};