'use client';

import React, { useState } from 'react';
import { 
  Calendar,
  Settings,
  Database,
  CheckCircle,
  FileText,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ModalSidebar } from '../../../shared/components';
import { Building2 } from 'lucide-react';

interface OnboardingClient {
  id: string;
  nome_empresa: string;
  nome_contato: string;
  email: string;
  telefone: string;
  valor_mensal: number;
  data_inicio: string;
  semana_onboarding: 'semana_1' | 'semana_2' | 'semana_3' | 'semana_4';
  progresso_onboarding: number;
  proxima_acao: string;
  responsavel: string;
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
  
  // Estados para checkboxes de cada semana
  const [semana1Checks, setSemana1Checks] = useState({
    kickoff: false,
    coleta_info: false,
    analise_fluxo: false
  });

  const [semana2Checks, setSemana2Checks] = useState({
    config_ferramentas: false,
    mapeamento_situacao: false,
    plano_contas: false,
    categorizacao: false,
    elaboracao_budget: false,
    cadastro_contas: false,
    formas_pagamento: false,
    treinamento: false
  });

  const [semana3Checks, setSemana3Checks] = useState({
    conciliacao_bancaria: false,
    aprovacao_pagamentos: false,
    ajustes_processos: false,
    resolucao_pendencias: false,
    acompanhamento_diario: false
  });

  const [semana4Checks, setSemana4Checks] = useState({
    processos_implementados: false,
    primeiro_relatorio: false,
    transicao_operacao: false
  });

  // Estados para informações coletadas
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

  const getProgressBySemana = () => {
    const totalSemana1 = Object.keys(semana1Checks).length;
    const completedSemana1 = Object.values(semana1Checks).filter(v => v).length;
    
    const totalSemana2 = Object.keys(semana2Checks).length;
    const completedSemana2 = Object.values(semana2Checks).filter(v => v).length;
    
    const totalSemana3 = Object.keys(semana3Checks).length;
    const completedSemana3 = Object.values(semana3Checks).filter(v => v).length;
    
    const totalSemana4 = Object.keys(semana4Checks).length;
    const completedSemana4 = Object.values(semana4Checks).filter(v => v).length;
    
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
            checked={semana1Checks.kickoff}
            onChange={(e) => setSemana1Checks({...semana1Checks, kickoff: e.target.checked})}
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
            checked={semana1Checks.coleta_info}
            onChange={(e) => setSemana1Checks({...semana1Checks, coleta_info: e.target.checked})}
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
            checked={semana1Checks.analise_fluxo}
            onChange={(e) => setSemana1Checks({...semana1Checks, analise_fluxo: e.target.checked})}
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
              checked={semana2Checks[item.key as keyof typeof semana2Checks]}
              onChange={(e) => setSemana2Checks({...semana2Checks, [item.key]: e.target.checked})}
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
              checked={semana3Checks[item.key as keyof typeof semana3Checks]}
              onChange={(e) => setSemana3Checks({...semana3Checks, [item.key]: e.target.checked})}
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
              checked={semana4Checks[item.key as keyof typeof semana4Checks]}
              onChange={(e) => setSemana4Checks({...semana4Checks, [item.key]: e.target.checked})}
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
        {activeTab === 'semana_1' && renderSemana1()}
        {activeTab === 'semana_2' && renderSemana2()}
        {activeTab === 'semana_3' && renderSemana3()}
        {activeTab === 'semana_4' && renderSemana4()}
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

  return (
    <ModalSidebar
      isOpen={isOpen}
      onClose={onClose}
      title={`Onboarding: ${client.nome_empresa}`}
      subtitle={`${client.nome_contato} • ${client.email}`}
      icon={Building2}
      footer={modalFooter}
      width="lg"
    >
      {modalContent}
    </ModalSidebar>
  );
};