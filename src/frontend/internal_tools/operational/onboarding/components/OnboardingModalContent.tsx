'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Settings,
  Database,
  CheckCircle,
  FileText,
  Check,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { ModalSidebar } from '../../../shared/components';
import { Building2 } from 'lucide-react';
import { useDeleteUser } from '../hooks/useDeleteUser';

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

interface OnboardingModalProps {
  client: OnboardingClient;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (client: OnboardingClient) => void;
}

type TabType = 'semana_1' | 'semana_2' | 'semana_3' | 'semana_4' | 'documentos';

export const OnboardingModalContent: React.FC<OnboardingModalProps> = ({
  client,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('semana_1');
  const [detailedClient, setDetailedClient] = useState<OnboardingClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { deleteUser, isDeleting, deleteError } = useDeleteUser();

  // Carregar detalhes completos do cliente quando o modal abrir
  useEffect(() => {
    if (isOpen && client) {
      const fetchClientDetails = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const response = await fetch(`/api/onboarding/companies/${client.company_id}`);
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Erro ao carregar detalhes');
          }
          
          if (data.success && data.company) {
            setDetailedClient(data.company);
          } else {
            throw new Error('Resposta inválida do servidor');
          }
        } catch (err) {
          console.error('Error fetching client details:', err);
          setError(err instanceof Error ? err.message : 'Erro desconhecido');
          // Usar dados básicos do cliente como fallback
          setDetailedClient(client);
        } finally {
          setLoading(false);
        }
      };

      fetchClientDetails();
    }
  }, [isOpen, client]);
  
  // Estados para acordion
  const [acordionOpen, setAcordionOpen] = useState<{[key: string]: boolean}>({
    semana_1_info: false,
    semana_2_info: false,
    semana_3_info: false,
    semana_4_info: false,
    documentos_empresa: false,
    documentos_financeiros: false,
    acessos: false
  });
  
  // Estado para checkboxes usando dados reais da API
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  
  // Atualizar checklist quando detailedClient carrega
  useEffect(() => {
    if (detailedClient?.checklist_items) {
      setChecklistItems(detailedClient.checklist_items);
    }
  }, [detailedClient]);

  // Estados para informações coletadas (ANTIGO - mantido temporariamente)
  const [clientInfo, setClientInfo] = useState({
    // Semana 1
    expectativas: '',
    pontos_criticos: '',
    fluxo_atual: '',
    
    // Semana 2
    plano_contas_obs: '',
    budget_definido: '',
    contas_bancarias: '',
    formas_pagamento_config: '',
    
    // Semana 3
    pendencias_identificadas: '',
    ajustes_realizados: '',
    
    // Semana 4
    observacoes_finais: '',
    melhorias_sugeridas: ''
  });

  const tabs = [
    { id: 'semana_1', label: 'Semana 1', icon: Calendar },
    { id: 'semana_2', label: 'Semana 2', icon: Settings },
    { id: 'semana_3', label: 'Semana 3', icon: Database },
    { id: 'semana_4', label: 'Semana 4', icon: CheckCircle },
    { id: 'documentos', label: 'Documentos', icon: FileText }
  ];

  // Função para obter progresso por semana usando dados reais
  const getProgressBySemana = () => {
    const semana1Items = checklistItems.filter(item => item.week === 1);
    const semana2Items = checklistItems.filter(item => item.week === 2);
    const semana3Items = checklistItems.filter(item => item.week === 3);
    const semana4Items = checklistItems.filter(item => item.week === 4);
    
    const totalSemana1 = semana1Items.length;
    const completedSemana1 = semana1Items.filter(item => item.is_checked).length;
    
    const totalSemana2 = semana2Items.length;
    const completedSemana2 = semana2Items.filter(item => item.is_checked).length;
    
    const totalSemana3 = semana3Items.length;
    const completedSemana3 = semana3Items.filter(item => item.is_checked).length;
    
    const totalSemana4 = semana4Items.length;
    const completedSemana4 = semana4Items.filter(item => item.is_checked).length;
    
    const total = totalSemana1 + totalSemana2 + totalSemana3 + totalSemana4;
    const completed = completedSemana1 + completedSemana2 + completedSemana3 + completedSemana4;
    
    return Math.round((completed / total) * 100);
  };

  const toggleAcordion = (key: string) => {
    setAcordionOpen(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (deleteConfirmText !== 'DELETAR') {
      alert('Digite DELETAR para confirmar');
      return;
    }

    const result = await deleteUser(client.email);
    
    if (result) {
      alert(`Usuário ${client.email} foi deletado permanentemente`);
      setShowDeleteConfirm(false);
      onClose();
      // Reload the page to refresh the list
      window.location.reload();
    } else if (deleteError) {
      alert(`Erro ao deletar: ${deleteError}`);
    }
  };

  // Função para atualizar checklist item
  const handleChecklistChange = async (itemId: string, isChecked: boolean, notes?: string) => {
    try {
      console.log('🔄 Updating checklist item:', { itemId, isChecked, notes });
      
      // Atualizar localmente primeiro (optimistic update)
      setChecklistItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, is_checked: isChecked, notes: notes || item.notes }
            : item
        )
      );

      // Atualizar no backend - CORRIGIDO: usar item.id diretamente
      const response = await fetch(`/api/onboarding/companies/${client.company_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist_item_id: itemId, // Este é o ID correto do item
          is_checked: isChecked,
          notes: notes
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar alteração');
      }

      const data = await response.json();
      if (data.success && data.company?.checklist_items) {
        setChecklistItems(data.company.checklist_items);
      }
    } catch (error) {
      console.error('Error updating checklist:', error);
      // Reverter mudança local em caso de erro
      setChecklistItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, is_checked: !isChecked }
            : item
        )
      );
    }
  };

  // Função genérica para renderizar semana
  const renderSemana = (weekNumber: number) => {
    const weekItems = checklistItems.filter(item => item.week === weekNumber);
    
    if (loading) {
      return (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
          </div>
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse p-3 bg-slate-50 rounded-lg">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }

    if (weekItems.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-slate-500">Nenhum item de checklist configurado para esta semana.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
            Semana {weekNumber}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {weekItems.length} atividades configuradas
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-slate-900 dark:text-white">Checklist de Atividades</h4>
          
          {weekItems.map((item) => (
            <label key={item.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={item.is_checked || false}
                onChange={(e) => handleChecklistChange(item.id, e.target.checked)}
                className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                )}
                {item.notes && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Nota: {item.notes}
                  </p>
                )}
                {item.checked_at && (
                  <p className="text-xs text-slate-500 mt-1">
                    Concluído em: {new Date(item.checked_at).toLocaleDateString('pt-BR')}
                    {item.checked_by && ` por ${item.checked_by}`}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderSemana1 = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
          Diagnóstico e Organização
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Coleta inicial de informações e definição do fluxo operacional
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">Checklist de Atividades</h4>
        
        <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={false}
            onChange={(e) => {}}
            className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <div className="flex-1">
            <p className="font-medium text-slate-900 dark:text-white">
              Reunião de kick-off e alinhamento
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Apresentação da equipe e definição de expectativas
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={false}
            onChange={(e) => {}}
            className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <div className="flex-1">
            <p className="font-medium text-slate-900 dark:text-white">
              Coleta de informações e acessos
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Documentos, extratos bancários, sistemas utilizados
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={false}
            onChange={(e) => {}}
            className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <div className="flex-1">
            <p className="font-medium text-slate-900 dark:text-white">
              Análise e definição do fluxo operacional
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mapeamento dos processos e definição do workflow
            </p>
          </div>
        </label>
      </div>

      {/* Acordion para Informações Coletadas */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
        <button
          onClick={() => toggleAcordion('semana_1_info')}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <h4 className="font-medium text-slate-900 dark:text-white">Informações Coletadas</h4>
          {acordionOpen.semana_1_info ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </button>
        
        {acordionOpen.semana_1_info && (
          <div className="px-4 pb-4 space-y-4 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sistemas utilizados atualmente
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Descreva quais sistemas, softwares ou ferramentas a empresa utiliza para controle financeiro (ERP, planilhas, sistemas específicos, etc.)..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Bancos que vamos operar
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Liste todos os bancos utilizados pela empresa, tipos de conta (corrente, poupança, investimento) e qual será nossa responsabilidade em cada um..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Processo e controle de recebimentos atual
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={4}
                placeholder="Descreva como funciona o processo de recebimento: como são emitidas as cobranças, quais formas de pagamento aceitam, como controlam recebimentos, prazo médio de recebimento, etc..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Processo e controle de pagamentos atual  
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={4}
                placeholder="Descreva como funciona o processo de pagamento: quem autoriza, como são controlados os vencimentos, formas de pagamento utilizadas, fluxo de aprovação, etc..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Funcionamento dos processos integrados ao financeiro
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={4}
                placeholder="Descreva como outros setores se integram ao financeiro: vendas, compras, RH, produção, etc. Como as informações chegam até o financeiro e qual o fluxo de dados..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Volume e periodicidade das operações
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Quantas operações por mês aproximadamente (pagamentos, recebimentos, conciliações), periodicidade dos fechamentos, picos sazonais, etc..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pontos críticos e expectativas de melhoria
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={4}
                placeholder="Quais são os principais problemas atuais e o que esperam melhorar com nossa implementação. Onde estão as maiores dificuldades do processo atual..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pessoas envolvidas e responsabilidades
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Quem são as pessoas que trabalham com financeiro atualmente, quais suas responsabilidades e como será a transição..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSemana2 = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
          Implementação
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Configuração do sistema e estruturação financeira
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">Checklist de Atividades</h4>
        
        {[
          { key: 'config_ferramentas', label: 'Configurações das ferramentas e acessos' },
          { key: 'mapeamento_situacao', label: 'Mapeamento da situação financeira atual' },
          { key: 'plano_contas', label: 'Criação do plano de contas personalizado' },
          { key: 'categorizacao', label: 'Categorização de despesas e receitas' },
          { key: 'elaboracao_budget', label: 'Elaboração do budget' },
          { key: 'cadastro_contas', label: 'Cadastros das contas bancárias e saldos iniciais' },
          { key: 'formas_pagamento', label: 'Cadastro das formas de pagamento e recebimento' },
          { key: 'treinamento', label: 'Treinamento no app e dashboard' }
        ].map(item => (
          <label key={item.key} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={false}
              onChange={(e) => {}}
              className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div className="flex-1">
              <p className="font-medium text-slate-900 dark:text-white">
                {item.label}
              </p>
            </div>
          </label>
        ))}
      </div>

      {/* Acordion para Configurações Realizadas */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
        <button
          onClick={() => toggleAcordion('semana_2_info')}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <h4 className="font-medium text-slate-900 dark:text-white">Configurações Realizadas</h4>
          {acordionOpen.semana_2_info ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </button>
        
        {acordionOpen.semana_2_info && (
          <div className="px-4 pb-4 space-y-4 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ferramentas e acessos configurados
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Descreva quais ferramentas foram configuradas, acessos criados, credenciais fornecidas, etc..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Plano de contas estruturado
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={4}
                placeholder="Detalhe as categorias criadas, adaptações feitas para o negócio específico, centros de custo definidos, etc..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Contas bancárias e formas de pagamento cadastradas
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={4}
                placeholder="Liste todas as contas bancárias configuradas, saldos iniciais informados, formas de pagamento e recebimento cadastradas..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Budget elaborado e metas definidas
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Descreva o budget criado, metas mensais/anuais estabelecidas, indicadores definidos..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status do treinamento da equipe
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Como foi o treinamento, quem participou, dificuldades encontradas, pontos que precisam reforço..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Situação financeira mapeada
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={4}
                placeholder="Resumo da situação encontrada: saldos, pendências, discrepâncias, pontos de atenção identificados..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSemana3 = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
          Operação Assistida
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Início da operação com acompanhamento próximo
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">Checklist de Atividades</h4>
        
        {[
          { key: 'conciliacao_bancaria', label: 'Início da conciliação bancária' },
          { key: 'aprovacao_pagamentos', label: 'Início do processo de aprovação de pagamentos' },
          { key: 'ajustes_processos', label: 'Ajustes finos nos processos' },
          { key: 'resolucao_pendencias', label: 'Resolução de pendências identificadas' },
          { key: 'acompanhamento_diario', label: 'Acompanhamento diário próximo' }
        ].map(item => (
          <label key={item.key} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={false}
              onChange={(e) => {}}
              className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div className="flex-1">
              <p className="font-medium text-slate-900 dark:text-white">
                {item.label}
              </p>
            </div>
          </label>
        ))}
      </div>

      {/* Acordion para Acompanhamento da Operação */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
        <button
          onClick={() => toggleAcordion('semana_3_info')}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <h4 className="font-medium text-slate-900 dark:text-white">Acompanhamento da Operação</h4>
          {acordionOpen.semana_3_info ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </button>
        
        {acordionOpen.semana_3_info && (
          <div className="px-4 pb-4 space-y-4 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status da conciliação bancária
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Como está funcionando a conciliação, dificuldades encontradas, tempo gasto, frequência..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Processo de aprovação de pagamentos
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Como está funcionando o fluxo de aprovação, quem está aprovando, tempo de resposta, gargalos..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pendências e problemas identificados
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={4}
                placeholder="Liste pendências encontradas, problemas técnicos, dificuldades da equipe, ajustes necessários..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ajustes realizados nos processos
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={4}
                placeholder="Descreva os ajustes feitos nas configurações, workflows modificados, melhorias implementadas..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Qualidade dos dados e informações
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Como está a qualidade dos dados inseridos, consistência das informações, erros frequentes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Evolução da autonomia da equipe
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Como a equipe está evoluindo na utilização do sistema, quais pontos ainda precisam apoio..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSemana4 = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
          Operação Plena
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Transição para operação regular e entrega final
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">Checklist de Conclusão</h4>
        
        {[
          { key: 'processos_implementados', label: 'Processos totalmente implementados', subtitle: 'Contas organizadas e em dia' },
          { key: 'primeiro_relatorio', label: 'Entrega do primeiro relatório gerencial', subtitle: 'DRE e indicadores apresentados' },
          { key: 'transicao_operacao', label: 'Transição para operação regular', subtitle: 'Cliente operando com autonomia' }
        ].map(item => (
          <label key={item.key} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={false}
              onChange={(e) => {}}
              className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div className="flex-1">
              <p className="font-medium text-slate-900 dark:text-white">
                {item.label}
              </p>
              {item.subtitle && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {item.subtitle}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* Acordion para Finalização do Onboarding */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
        <button
          onClick={() => toggleAcordion('semana_4_info')}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <h4 className="font-medium text-slate-900 dark:text-white">Finalização do Onboarding</h4>
          {acordionOpen.semana_4_info ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </button>
        
        {acordionOpen.semana_4_info && (
          <div className="px-4 pb-4 space-y-4 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status final dos processos implementados
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={4}
                placeholder="Descreva se todos os processos foram implementados com sucesso, quais funcionam perfeitamente, quais ainda precisam atenção..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Detalhes do primeiro relatório gerencial entregue
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={4}
                placeholder="Como foi a primeira DRE, quais indicadores foram apresentados, qual foi a reação do cliente, pontos de melhoria identificados..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nível de autonomia alcançado pelo cliente
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="O cliente consegue operar com autonomia? Quais atividades ainda dependem de suporte? Frequência de acompanhamento necessária..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Satisfação do cliente e feedback
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Como foi o feedback do cliente sobre o onboarding? Ele está satisfeito com os resultados? Quais foram os elogios e críticas..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Plano de acompanhamento pós-onboarding
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Qual será a frequência de acompanhamento regular? Quais reuniões foram agendadas? Pontos que precisam monitoramento..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Observações importantes para operação regular
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                rows={4}
                placeholder="Pontos críticos para lembrar na operação regular, particularidades do cliente, cuidados especiais..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Resumo do Status */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
        <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-3">
          Status Final do Onboarding
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-slate-700 dark:text-slate-300">Progresso Total</span>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {getProgressBySemana()}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all" 
              style={{ width: `${getProgressBySemana()}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocumentos = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
          Documentação do Onboarding
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Checklist de documentos necessários e recebidos
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">Documentos da Empresa</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['Contrato Social', 'Cartão CNPJ', 'Certificado Digital', 'Procuração'].map(doc => (
            <label key={doc} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
              <input type="checkbox" className="rounded text-emerald-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{doc}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">Documentos Financeiros</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['Extratos Bancários (3 meses)', 'Contas a Pagar', 'Contas a Receber', 'Notas Fiscais'].map(doc => (
            <label key={doc} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
              <input type="checkbox" className="rounded text-emerald-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{doc}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">Acessos Configurados</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['Sistema ElevaLucro', 'App Mobile', 'Dashboard Web', 'WhatsApp Business'].map(acesso => (
            <label key={acesso} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
              <input type="checkbox" className="rounded text-emerald-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{acesso}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const modalContent = (
    <>
      {/* Progress Bar */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
          <span>Progresso do Onboarding</span>
          <span className="font-medium text-emerald-600">{getProgressBySemana()}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div 
            className="bg-emerald-500 h-2 rounded-full transition-all" 
            style={{ width: `${getProgressBySemana()}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 px-6">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex items-center gap-2 py-3 px-1 border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'semana_1' && renderSemana(1)}
        {activeTab === 'semana_2' && renderSemana(2)}
        {activeTab === 'semana_3' && renderSemana(3)}
        {activeTab === 'semana_4' && renderSemana(4)}
        {activeTab === 'documentos' && renderDocumentos()}
      </div>
    </>
  );

  const modalFooter = (
    <div className="flex justify-between items-center">
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Responsável: <span className="font-medium text-slate-900 dark:text-white">{client.responsavel}</span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            const updatedClient = {
              ...client,
              progresso_onboarding: getProgressBySemana()
            };
            onUpdate(updatedClient);
            onClose();
          }}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          Salvar Progresso
        </button>
      </div>
    </div>
  );

  // Delete button component
  const deleteButton = (
    <button
      onClick={() => setShowDeleteConfirm(true)}
      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
      title="Deletar usuário permanentemente"
    >
      <Trash2 className="h-4 w-4 text-slate-400 group-hover:text-red-600 transition-colors" />
    </button>
  );

  return (
    <>
      <ModalSidebar
        isOpen={isOpen}
        onClose={onClose}
        title={`Onboarding: ${client.nome_empresa}`}
        subtitle={`${client.segmento} • ${client.email}`}
        icon={Building2}
        footer={modalFooter}
        width="lg"
        headerAction={deleteButton}
      >
        {modalContent}
      </ModalSidebar>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Confirmar Exclusão Permanente
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-2">
                  Você está prestes a deletar permanentemente:
                </p>
                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                  <li>• Empresa: <strong>{client.nome_empresa}</strong></li>
                  <li>• Email: <strong>{client.email}</strong></li>
                  <li>• Todos os dados relacionados</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Digite <strong>DELETAR</strong> para confirmar:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                  placeholder="DELETAR"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleteConfirmText !== 'DELETAR' || isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deletando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Deletar Permanentemente
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};