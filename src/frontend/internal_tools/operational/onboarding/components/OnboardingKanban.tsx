'use client';

import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Building2, Phone, Mail, Calendar, CheckCircle } from 'lucide-react';
import { OnboardingModalContent } from './OnboardingModalContent';

// Tipos para onboarding - atualizado para corresponder à view
interface OnboardingClient {
  company_id: string;
  nome_empresa: string;
  email: string;
  telefone: string;
  segmento: string;
  plano: string;
  progresso_onboarding: number;
  lifecycle_stage: string;
  data_inicio: string;
  semana_onboarding: 'semana_1' | 'semana_2' | 'semana_3' | 'semana_4';
  dias_desde_criacao: number;
  total_checklist_items: number;
  completed_items: number;
  pending_items: number;
  proxima_acao: string;
  subscription_status: string;
  valor_mensal: number;
  responsavel: string;
  checklist_items?: any[];
}

// Mock data
const mockClients: OnboardingClient[] = [
  {
    company_id: '1',
    nome_empresa: 'Tech Solutions Ltda',
    email: 'joao@techsolutions.com',
    telefone: '(11) 99999-9999',
    segmento: 'Tecnologia',
    plano: 'Avançado',
    valor_mensal: 2500,
    data_inicio: '2024-01-15',
    semana_onboarding: 'semana_1',
    progresso_onboarding: 25,
    lifecycle_stage: 'onboarding',
    dias_desde_criacao: 5,
    total_checklist_items: 20,
    completed_items: 5,
    pending_items: 15,
    proxima_acao: 'Configurar sistema financeiro',
    subscription_status: 'active',
    responsavel: 'Ana Costa'
  },
  {
    company_id: '2',
    nome_empresa: 'Inovação Digital',
    email: 'maria@inovacaodigital.com',
    telefone: '(11) 88888-8888',
    segmento: 'Digital',
    plano: 'Gerencial',
    valor_mensal: 1800,
    data_inicio: '2024-01-10',
    semana_onboarding: 'semana_2',
    progresso_onboarding: 50,
    lifecycle_stage: 'onboarding',
    dias_desde_criacao: 10,
    total_checklist_items: 20,
    completed_items: 10,
    pending_items: 10,
    proxima_acao: 'Treinamento equipe contábil',
    subscription_status: 'active',
    responsavel: 'Carlos Lima'
  },
  {
    company_id: '3',
    nome_empresa: 'Construtora ABC',
    email: 'pedro@construtorabc.com',
    telefone: '(11) 77777-7777',
    segmento: 'Construção',
    plano: 'Avançado',
    valor_mensal: 3200,
    data_inicio: '2024-01-05',
    semana_onboarding: 'semana_3',
    progresso_onboarding: 75,
    lifecycle_stage: 'onboarding',
    dias_desde_criacao: 15,
    total_checklist_items: 20,
    completed_items: 15,
    pending_items: 5,
    proxima_acao: 'Revisão relatórios DRE',
    subscription_status: 'active',
    responsavel: 'Ana Costa'
  },
  {
    company_id: '4',
    nome_empresa: 'Consultoria Premium',
    email: 'lucas@consultoriapremium.com',
    telefone: '(11) 66666-6666',
    segmento: 'Consultoria',
    plano: 'Avançado',
    valor_mensal: 4500,
    data_inicio: '2024-01-01',
    semana_onboarding: 'semana_4',
    progresso_onboarding: 90,
    lifecycle_stage: 'onboarding',
    dias_desde_criacao: 20,
    total_checklist_items: 20,
    completed_items: 18,
    pending_items: 2,
    proxima_acao: 'Finalizar documentação',
    subscription_status: 'active',
    responsavel: 'Carlos Lima'
  },
  {
    company_id: '5',
    nome_empresa: 'Startup Fintech',
    email: 'fernanda@startupfintech.com',
    telefone: '(11) 55555-5555',
    segmento: 'Fintech',
    plano: 'Controle',
    valor_mensal: 1200,
    data_inicio: '2024-01-20',
    semana_onboarding: 'semana_1',
    progresso_onboarding: 15,
    lifecycle_stage: 'onboarding',
    dias_desde_criacao: 2,
    total_checklist_items: 20,
    completed_items: 3,
    pending_items: 17,
    proxima_acao: 'Coleta documentos iniciais',
    subscription_status: 'active',
    responsavel: 'Ana Costa'
  }
];

interface ClientCardProps {
  client: OnboardingClient;
  setSelectedClient: (client: OnboardingClient) => void;
  setIsModalOpen: (open: boolean) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, setSelectedClient, setIsModalOpen }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: client.company_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`
        bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 cursor-pointer shadow-sm hover:shadow-md transition-all
        ${isDragging ? 'opacity-50 shadow-lg scale-105 cursor-grabbing' : 'hover:border-emerald-500'}
      `}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-500" />
            <h3 className="font-medium text-slate-900 dark:text-white text-sm">
              {client.nome_empresa}
            </h3>
          </div>
        </div>

        {/* Contato */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-medium">{client.segmento}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Mail className="h-3 w-3" />
            <span className="truncate">{client.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Phone className="h-3 w-3" />
            <span>{client.telefone}</span>
          </div>
        </div>

        {/* Progresso - Nova versão */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Progresso</span>
            <span className="text-xs text-slate-500">{client.progresso_onboarding || 0}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300 ease-out" 
              style={{ 
                width: `${Math.max(0, Math.min(100, client.progresso_onboarding || 0))}%`,
                minWidth: client.progresso_onboarding > 0 ? '2px' : '0px'
              }}
            />
          </div>
        </div>


        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="h-3 w-3" />
            <span>Iniciado {new Date(client.data_inicio).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="text-xs text-slate-500">
            {client.responsavel}
          </div>
        </div>
      </div>
    </div>
  );
};

interface KanbanColumnProps {
  title: string;
  clients: OnboardingClient[];
  weekKey: string;
  setSelectedClient: (client: OnboardingClient) => void;
  setIsModalOpen: (open: boolean) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, clients, weekKey, setSelectedClient, setIsModalOpen }) => {
  const totalValue = clients.reduce((sum, client) => sum + client.valor_mensal, 0);

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 min-h-[600px] flex flex-col">
      {/* Header da coluna */}
      <div className="mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-slate-900 dark:text-white">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
              {clients.length}
            </span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <SortableContext items={clients.map(c => c.company_id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1">
          {clients.map((client) => (
            <ClientCard 
              key={client.company_id} 
              client={client}
              setSelectedClient={setSelectedClient}
              setIsModalOpen={setIsModalOpen}
            />
          ))}
        </div>
      </SortableContext>

      {clients.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum cliente</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const OnboardingKanban: React.FC = () => {
  const [clients, setClients] = useState<OnboardingClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<OnboardingClient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carregar dados do backend
  useEffect(() => {
    const fetchOnboardingCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/onboarding/companies?t=' + Date.now(), {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Erro ao carregar empresas');
        }
        
        if (data.success) {
          setClients(data.companies);
        } else {
          throw new Error('Resposta inválida do servidor');
        }
      } catch (err) {
        console.error('Error fetching onboarding companies:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        // Não usar dados mockados - mostrar array vazio
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingCompanies();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const weeks = [
    { key: 'semana_1', title: 'Semana 1' },
    { key: 'semana_2', title: 'Semana 2' },
    { key: 'semana_3', title: 'Semana 3' },
    { key: 'semana_4', title: 'Semana 4' }
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Se não mudou de posição, não faz nada
    if (activeId === overId) return;

    // Encontrar o cliente sendo movido
    const activeClient = clients.find(c => c.company_id === activeId);
    if (!activeClient) return;

    // Determinar a nova semana baseada no destino
    let newWeek: OnboardingClient['semana_onboarding'] = activeClient.semana_onboarding;
    
    // Se o destino é outro cliente, pegar a semana dele
    const targetClient = clients.find(c => c.company_id === overId);
    if (targetClient) {
      newWeek = targetClient.semana_onboarding;
    }

    // Atualizar no frontend imediatamente (otimistic update)
    setClients(prev => prev.map(client => 
      client.company_id === activeId 
        ? { ...client, semana_onboarding: newWeek }
        : client
    ));

    console.log(`Cliente ${activeClient.nome_empresa} movido para ${newWeek}`);
    
    // TODO: Implementar atualização no backend quando necessário
    // Para agora, a semana é calculada automaticamente baseada na data de criação
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando empresas em onboarding...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">Erro ao carregar dados</p>
          <p className="text-sm text-slate-500">{error}</p>
          <p className="text-sm text-slate-500 mt-2">Usando dados de exemplo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-slate-600 dark:text-slate-400">
              {clients.length} clientes em onboarding
            </span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {weeks.map(week => (
            <KanbanColumn
              key={week.key}
              title={week.title}
              weekKey={week.key}
              clients={clients.filter(c => c.semana_onboarding === week.key)}
              setSelectedClient={setSelectedClient}
              setIsModalOpen={setIsModalOpen}
            />
          ))}
        </div>
      </DndContext>

      {/* Modal de Onboarding */}
      {selectedClient && (
        <OnboardingModalContent
          client={selectedClient}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedClient(null);
          }}
          onUpdate={async (updatedClient) => {
            // Recarregar dados do servidor para obter os valores atualizados
            try {
              const response = await fetch('/api/onboarding/companies?t=' + Date.now(), {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
              const data = await response.json();
              
              if (data.success) {
                setClients(data.companies);
                // Atualizar o cliente selecionado com os novos dados
                const updatedSelectedClient = data.companies.find(
                  (c: any) => c.company_id === selectedClient?.company_id
                );
                if (updatedSelectedClient) {
                  setSelectedClient(updatedSelectedClient);
                }
              }
            } catch (error) {
              console.error('Error reloading companies after update:', error);
            }
          }}
        />
      )}
    </div>
  );
};