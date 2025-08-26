import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Clock, Phone, FileText, CheckCircle, XCircle } from 'lucide-react';

type ProspectStatus = 'pending' | 'contacted' | 'contract_sent' | 'signed' | 'rejected';

interface StatusBadgeProps {
  currentStatus: ProspectStatus;
  prospectId: string;
  prospectName: string;
  onStatusChange: (id: string, newStatus: ProspectStatus) => Promise<boolean>;
}

const statusConfig: Record<ProspectStatus, {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
}> = {
  pending: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: Clock,
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-600'
  },
  contacted: {
    label: 'Contactado',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: Phone,
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-600'
  },
  contract_sent: {
    label: 'Contrato Enviado',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    icon: FileText,
    bgColor: 'bg-purple-500',
    textColor: 'text-purple-600'
  },
  signed: {
    label: 'Assinado',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: CheckCircle,
    bgColor: 'bg-green-500',
    textColor: 'text-green-600'
  },
  rejected: {
    label: 'Rejeitado',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: XCircle,
    bgColor: 'bg-red-500',
    textColor: 'text-red-600'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  currentStatus,
  prospectId,
  prospectName,
  onStatusChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const current = statusConfig[currentStatus];
  const Icon = current.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = async (newStatus: ProspectStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    
    try {
      const success = await onStatusChange(prospectId, newStatus);
      
      if (success) {
        setIsOpen(false);
      } else {
        alert('Erro ao atualizar status. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status. Tente novamente.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full
          ${current.color}
          hover:opacity-90 transition-all duration-200
          ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Icon className="h-3 w-3" />
        <span>{current.label}</span>
        {!isUpdating && <ChevronDown className="h-3 w-3 ml-0.5" />}
        {isUpdating && (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current ml-0.5"></div>
        )}
      </button>

      {isOpen && !isUpdating && (
        <div className="absolute z-50 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="p-2">
            <div className="text-xs text-slate-500 dark:text-slate-400 px-3 py-1.5 font-medium">
              Alterar status
            </div>
            {Object.entries(statusConfig).map(([status, config]) => {
              const StatusIcon = config.icon;
              const isSelected = status === currentStatus;
              
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status as ProspectStatus)}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md
                    transition-colors duration-150
                    ${isSelected 
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }
                  `}
                >
                  <div className={`p-1 rounded ${isSelected ? config.bgColor : 'bg-slate-200 dark:bg-slate-600'}`}>
                    <StatusIcon className={`h-3 w-3 ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                  </div>
                  <span className="flex-1 text-left">{config.label}</span>
                  {isSelected && (
                    <Check className="h-3 w-3 text-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-700 px-3 py-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {prospectName}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};