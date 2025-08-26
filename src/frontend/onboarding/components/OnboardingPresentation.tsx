"use client";

import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Users, 
  FileText, 
  BarChart3, 
  Shield, 
  Clock, 
  Smartphone,
  CreditCard,
  Workflow,
  Target,
  TrendingUp,
  Calendar,
  MessageSquare,
  Rocket,
  Mail,
  Phone
} from 'lucide-react';

interface OnboardingPresentationProps {
  planName: 'Controle' | 'Gerencial' | 'Avançado';
  planFeatures: string[];
  monthlyPrice: string;
}

export default function OnboardingPresentation({ planName, planFeatures, monthlyPrice }: OnboardingPresentationProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { 
      icon: Rocket, 
      title: "Boas-vindas",
      subtitle: "Início da parceria"
    },
    { 
      icon: Users, 
      title: "Nossa equipe",
      subtitle: "Quem cuidará do seu financeiro"
    },
    { 
      icon: Workflow, 
      title: "Processo de trabalho",
      subtitle: "Como funcionará no dia a dia"
    },
    { 
      icon: Smartphone, 
      title: "Tecnologia",
      subtitle: "Ferramentas e acesso"
    },
    { 
      icon: Calendar, 
      title: "Cronograma",
      subtitle: "Primeiros 30 dias"
    },
    { 
      icon: Shield, 
      title: "Segurança",
      subtitle: "Proteção dos seus dados"
    },
    { 
      icon: FileText, 
      title: "Seu plano",
      subtitle: `Detalhes do ${planName}`
    },
    { 
      icon: Target, 
      title: "Próximos passos",
      subtitle: "O que você precisa fazer"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getPlanDescription = () => {
    switch (planName) {
      case 'Controle':
        return 'O plano essencial para organizar suas finanças e sair do operacional.';
      case 'Gerencial':
        return 'Visão completa da gestão com relatórios e cobrança ativa.';
      case 'Avançado':
        return 'Inteligência financeira completa com consultoria especializada.';
      default:
        return '';
    }
  };

  const getPlanColor = () => {
    switch (planName) {
      case 'Controle':
        return 'emerald';
      case 'Gerencial':
        return 'blue';
      case 'Avançado':
        return 'purple';
      default:
        return 'emerald';
    }
  };

  const renderStepContent = () => {
    const planColor = getPlanColor();
    
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className={`inline-flex px-4 py-2 rounded-full bg-${planColor}-500/10 text-${planColor}-300 text-sm font-medium mb-4`}>
                Plano {planName}
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Bem-vindo à ElevaLucro! 🎉
              </h1>
              <p className="text-xl text-slate-300">
                Estamos muito felizes em ter você como nosso parceiro
              </p>
            </div>

            <div className="bg-emerald-500/10 rounded-xl p-6 border border-emerald-500/20">
              <h2 className="text-xl font-semibold text-emerald-300 mb-3">
                O que vamos fazer juntos
              </h2>
              <p className="text-slate-300 mb-4">
                A partir de agora, cuidaremos de toda a gestão financeira da sua empresa com o plano {planName}, 
                permitindo que você foque no que realmente importa: fazer seu negócio crescer.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Organizaremos todas as suas contas e documentos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Implementaremos processos eficientes e seguros</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Forneceremos relatórios claros e precisos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Garantiremos compliance e organização fiscal</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold text-emerald-300 mb-2">
                📌 Importante
              </h3>
              <p className="text-slate-300">
                Esta apresentação vai te mostrar exatamente como funcionará nossa parceria, 
                quem será responsável por cada área e o que esperamos de você para que 
                tudo funcione perfeitamente.
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                Conheça sua equipe dedicada
              </h1>
              <p className="text-lg text-slate-300">
                Profissionais especializados cuidando do seu financeiro
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-400/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Operador Financeiro</h3>
                    <p className="text-sm text-slate-400">Felipe Gomes</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Lançamento de contas a pagar e receber</li>
                  <li>• Conciliação bancária diária</li>
                  <li>• Organização de documentos fiscais</li>
                  <li>• Preparação de pagamentos</li>
                </ul>
              </div>

              {(planName === 'Gerencial' || planName === 'Avançado') && (
                <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-400/10 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Analista Financeiro</h3>
                      <p className="text-sm text-slate-400">Amanda Tabet</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Elaboração de relatórios gerenciais</li>
                    <li>• Análise de DRE e fluxo de caixa</li>
                    <li>• Indicadores de performance</li>
                    <li>• Dashboards personalizados</li>
                  </ul>
                </div>
              )}

              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-400/10 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Customer Success</h3>
                    <p className="text-sm text-slate-400">Thales</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Acompanhamento da satisfação</li>
                  <li>• Resolução de dúvidas e problemas</li>
                  <li>• Coordenação entre as equipes</li>
                  <li>• Garantia de qualidade do serviço</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
              <p className="text-slate-300 text-center">
                <strong className="text-emerald-300">Toda a equipe está comprometida</strong> em entregar o melhor serviço 
                e garantir que sua empresa tenha uma gestão financeira impecável.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                Como funcionará no dia a dia
              </h1>
              <p className="text-lg text-slate-300">
                Um processo simples, seguro e transparente
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-xl p-6 border-l-4 border-emerald-500">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-400/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-300 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Recebimento de documentos (Diário)
                    </h3>
                    <p className="text-slate-300 mb-3">
                      Você nos envia notas fiscais, contratos e comprovantes através da nossa plataforma.
                    </p>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-white/10">
                      <p className="text-sm text-slate-300">
                        <strong className="text-emerald-300">Como fazer:</strong> Basta fotografar ou fazer upload dos documentos no app. 
                        Leva menos de 1 minuto!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-6 border-l-4 border-blue-500">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-400/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-300 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Processamento e organização (Nosso trabalho)
                    </h3>
                    <p className="text-slate-300 mb-3">
                      Nossa equipe organiza tudo: lança no sistema, categoriza e prepara pagamentos.
                    </p>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-white/10">
                      <p className="text-sm text-slate-300">
                        <strong className="text-blue-300">O que fazemos:</strong> Conciliação bancária, lançamentos, 
                        organização por centro de custo e preparação de relatórios.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-6 border-l-4 border-purple-500">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-400/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-300 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Aprovação de pagamentos (Diário - 5 min)
                    </h3>
                    <p className="text-slate-300 mb-3">
                      Enviamos notificação via WhatsApp com link para aprovar pagamentos do dia.
                    </p>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-white/10">
                      <p className="text-sm text-slate-300">
                        <strong className="text-purple-300">Segurança total:</strong> Só você pode aprovar. 
                        Nossa equipe NÃO tem acesso bancário.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {(planName === 'Gerencial' || planName === 'Avançado') && (
                <div className="bg-slate-900/50 rounded-xl p-6 border-l-4 border-orange-500">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-orange-400/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-300 font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Relatórios e análises (Mensal)
                      </h3>
                      <p className="text-slate-300 mb-3">
                        Todo dia 5 você recebe o fechamento do mês anterior com DRE, fluxo de caixa e indicadores.
                      </p>
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-white/10">
                        <p className="text-sm text-slate-300">
                          {planName === 'Avançado' ? (
                            <>
                              <strong className="text-orange-300">Reunião mensal:</strong> Apresentamos os resultados e 
                              discutimos estratégias de melhoria com consultoria dedicada.
                            </>
                          ) : (
                            <>
                              <strong className="text-orange-300">Relatórios completos:</strong> DRE, fluxo de caixa 
                              e indicadores de performance enviados mensalmente.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-emerald-500/10 rounded-xl p-6 border border-emerald-500/20">
              <h3 className="font-semibold text-emerald-300 mb-2">
                💡 Resumo do seu tempo investido
              </h3>
              <p className="text-slate-300">
                • 1 minuto para enviar documentos<br/>
                • 5 minutos para aprovar pagamentos<br/>
                {planName === 'Avançado' && '• 1 hora por mês para reunião de consultoria<br/>'}
                <strong className="text-emerald-400">Total: menos de 10 minutos por dia!</strong>
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                Tecnologia a seu favor
              </h1>
              <p className="text-lg text-slate-300">
                Ferramentas modernas para simplificar sua rotina
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-400/5 rounded-xl p-6 border border-emerald-500/20">
                <Smartphone className="h-12 w-12 text-emerald-300 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">
                  App Mobile ElevaLucro
                </h3>
                <p className="text-slate-300 mb-4">
                  Acesse tudo na palma da sua mão, de qualquer lugar.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Envio rápido de documentos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Aprovação de pagamentos com 1 toque</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Visualização de saldos e extratos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Chat direto com sua equipe</span>
                  </li>
                </ul>
              </div>

              {(planName === 'Gerencial' || planName === 'Avançado') && (
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-400/5 rounded-xl p-6 border border-blue-500/20">
                  <BarChart3 className="h-12 w-12 text-blue-300 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Dashboard Web Completo
                  </h3>
                  <p className="text-slate-300 mb-4">
                    Visão completa do seu financeiro em dashboards intuitivos.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">DRE atualizado em tempo real</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Fluxo de caixa projetado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Indicadores e KPIs personalizados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Exportação de relatórios em PDF/Excel</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-300" />
                Comunicação integrada
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-400/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">💬</span>
                  </div>
                  <p className="text-sm font-medium text-white">WhatsApp</p>
                  <p className="text-xs text-slate-400">Notificações diárias</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-400/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">📧</span>
                  </div>
                  <p className="text-sm font-medium text-white">E-mail</p>
                  <p className="text-xs text-slate-400">Relatórios mensais</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-400/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">💻</span>
                  </div>
                  <p className="text-sm font-medium text-white">Chat no app</p>
                  <p className="text-xs text-slate-400">Suporte em tempo real</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                Seus primeiros 30 dias conosco
              </h1>
              <p className="text-lg text-slate-300">
                Um cronograma claro para começarmos com o pé direito
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-400/10 rounded-lg px-3 py-1 flex-shrink-0">
                    <span className="text-sm font-bold text-emerald-300">Semana 1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">Diagnóstico e Organização</h3>
                    <ul className="space-y-1 text-sm text-slate-300">
                      <li>✓ Reunião de kick-off e alinhamento de expectativas</li>
                      <li>✓ Coleta de informações e acessos necessários</li>
                      <li>✓ Análise das informações e definição do fluxo operacional</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-400/10 rounded-lg px-3 py-1 flex-shrink-0">
                    <span className="text-sm font-bold text-blue-300">Semana 2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">Implementação</h3>
                    <ul className="space-y-1 text-sm text-slate-300">
                      <li>✓ Configurações das ferramentas e acessos</li>
                      <li>✓ Mapeamento da situação financeira atual</li>
                      <li>✓ Criação do plano de contas personalizado</li>
                      <li>✓ Categorização de despesas e receitas</li>
                      <li>✓ Elaboração do budget</li>
                      <li>✓ Cadastros das contas bancárias e saldos iniciais</li>
                      <li>✓ Cadastro das formas de pagamento e recebimento</li>
                      <li>✓ Treinamento no app e dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-400/10 rounded-lg px-3 py-1 flex-shrink-0">
                    <span className="text-sm font-bold text-purple-300">Semana 3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">Operação Assistida</h3>
                    <ul className="space-y-1 text-sm text-slate-300">
                      <li>✓ Início da conciliação bancária</li>
                      <li>✓ Início do processo de aprovação de pagamentos</li>
                      <li>✓ Ajustes finos nos processos</li>
                      <li>✓ Resolução de pendências identificadas</li>
                      <li>✓ Acompanhamento diário próximo</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-400/10 rounded-lg px-3 py-1 flex-shrink-0">
                    <span className="text-sm font-bold text-orange-300">Semana 4</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">Operação Plena</h3>
                    <ul className="space-y-1 text-sm text-slate-300">
                      {planName === 'Controle' && (
                        <>
                          <li>✓ Processos básicos implementados</li>
                          <li>✓ Contas organizadas e em dia</li>
                        </>
                      )}
                      {(planName === 'Gerencial' || planName === 'Avançado') && (
                        <>
                          <li>✓ Entrega do primeiro relatório gerencial</li>
                          <li>✓ Apresentação de DRE e indicadores</li>
                        </>
                      )}
                      {planName === 'Avançado' && (
                        <li>✓ Primeira reunião de consultoria</li>
                      )}
                      <li>✓ Transição para operação regular</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl p-6 border border-emerald-500/20">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">
                  Após 30 dias
                </h3>
                <p className="text-slate-300">
                  Sua gestão financeira estará <strong className="text-emerald-300">100% organizada</strong>, 
                  com processos definidos e {planName !== 'Controle' && 'relatórios'} em dia. 
                  Você terá controle total com mínimo esforço!
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                Segurança e Compliance
              </h1>
              <p className="text-lg text-slate-300">
                Seus dados protegidos com os mais altos padrões
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
                <Shield className="h-10 w-10 text-emerald-300 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-3">
                  Proteção de Dados
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Criptografia de ponta a ponta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Servidores seguros na AWS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Backup diário automático</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Conformidade com LGPD</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
                <CreditCard className="h-10 w-10 text-blue-300 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-3">
                  Segurança Bancária
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Zero acesso às suas contas bancárias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Você mantém total controle dos pagamentos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Aprovação em dois fatores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Registro de todas as transações</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20">
              <h3 className="font-semibold text-red-300 mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                O que NÓS NÃO temos acesso
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>❌ Suas senhas bancárias</li>
                  <li>❌ Tokens de autorização bancária</li>
                  <li>❌ Poder de movimentação financeira</li>
                </ul>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>❌ Cartões corporativos</li>
                  <li>❌ Chaves PIX da empresa</li>
                  <li>❌ Assinatura de contratos em seu nome</li>
                </ul>
              </div>
            </div>

            <div className="bg-emerald-500/10 rounded-xl p-6 border border-emerald-500/20">
              <h3 className="font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Certificações e Garantias
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="w-16 h-16 bg-slate-800/50 rounded-lg flex items-center justify-center mx-auto mb-2 border border-white/10">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <p className="text-sm font-medium text-white">SSL/TLS</p>
                  <p className="text-xs text-slate-400">Conexão segura</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-slate-800/50 rounded-lg flex items-center justify-center mx-auto mb-2 border border-white/10">
                    <span className="text-2xl">📋</span>
                  </div>
                  <p className="text-sm font-medium text-white">ISO 27001</p>
                  <p className="text-xs text-slate-400">Em processo</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-slate-800/50 rounded-lg flex items-center justify-center mx-auto mb-2 border border-white/10">
                    <span className="text-2xl">✅</span>
                  </div>
                  <p className="text-sm font-medium text-white">LGPD</p>
                  <p className="text-xs text-slate-400">100% compliance</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
              <p className="text-slate-300 text-center">
                <strong className="text-emerald-300">Contrato transparente:</strong> Todos os termos de segurança e 
                responsabilidades estão claros em nosso contrato. Sem letras miúdas!
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                Detalhes do Plano {planName}
              </h1>
              <p className="text-lg text-slate-300">
                {getPlanDescription()}
              </p>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-8 border border-white/10">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-emerald-300">{monthlyPrice}</p>
                <p className="text-slate-400">por mês</p>
              </div>

              <h3 className="font-semibold text-white mb-4">O que está incluído:</h3>
              <ul className="space-y-3">
                {planFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {planName === 'Avançado' && (
                <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-sm text-purple-300">
                    <strong>Benefício exclusivo:</strong> Consultoria mensal com análise detalhada 
                    e suporte estratégico para tomada de decisões.
                  </p>
                </div>
              )}

              {planName === 'Gerencial' && (
                <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-300">
                    <strong>Destaque:</strong> Relatórios gerenciais completos com DRE, 
                    fluxo de caixa e indicadores de performance.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-emerald-500/10 rounded-xl p-6 border border-emerald-500/20">
              <h3 className="font-semibold text-emerald-300 mb-3">
                Por que escolher o plano {planName}?
              </h3>
              {planName === 'Controle' && (
                <p className="text-slate-300">
                  Ideal para empresas que precisam organizar o básico: contas a pagar e receber, 
                  conciliação bancária e documentos fiscais. Perfeito para sair do caos e ter controle.
                </p>
              )}
              {planName === 'Gerencial' && (
                <p className="text-slate-300">
                  Para empresas que querem visibilidade completa: além do controle básico, 
                  você terá relatórios gerenciais, DRE, fluxo de caixa e cobrança ativa de inadimplentes.
                </p>
              )}
              {planName === 'Avançado' && (
                <p className="text-slate-300">
                  Para empresas que buscam crescimento: além de tudo do Gerencial, 
                  você terá consultoria mensal, análise estratégica e suporte para decisões importantes.
                </p>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                Próximos passos
              </h1>
              <p className="text-lg text-slate-300">
                O que precisamos de você para começar
              </p>
            </div>

            <div className="bg-emerald-500/10 rounded-xl p-8 border border-emerald-500/20 text-center mb-6">
              <Target className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">
                Vamos começar! 🚀
              </h2>
              <p className="text-slate-300 mb-6">
                Estamos prontos para transformar a gestão financeira da sua empresa com o plano {planName}. 
                Aqui está o que precisamos de você:
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-white text-lg">📋 Documentos necessários:</h3>
              
              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
                <h4 className="font-medium text-white mb-3">Documentos da empresa</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-emerald-600" disabled />
                    <span className="text-sm text-slate-300">Contrato Social atualizado</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-emerald-600" disabled />
                    <span className="text-sm text-slate-300">Cartão CNPJ</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-emerald-600" disabled />
                    <span className="text-sm text-slate-300">Certificado digital (se houver)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-emerald-600" disabled />
                    <span className="text-sm text-slate-300">Procuração (modelo fornecido)</span>
                  </label>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
                <h4 className="font-medium text-white mb-3">Acessos e informações</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-emerald-600" disabled />
                    <span className="text-sm text-slate-300">Extratos bancários (últimos 3 meses)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-emerald-600" disabled />
                    <span className="text-sm text-slate-300">Relação de contas a pagar</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-emerald-600" disabled />
                    <span className="text-sm text-slate-300">Relação de contas a receber</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-emerald-600" disabled />
                    <span className="text-sm text-slate-300">Acesso ao sistema atual (se houver)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
              <h3 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Cronograma de entrega
              </h3>
              <p className="text-slate-300 mb-3">
                Para começarmos na data combinada, precisamos receber tudo até:
              </p>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-white/10">
                <p className="text-2xl font-bold text-blue-300">5 dias úteis</p>
                <p className="text-sm text-slate-400">antes da data de início</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">👥 Sua equipe de suporte</h3>
              <p className="text-slate-300 mb-3">
                Durante todo o processo, você terá suporte direto:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 text-purple-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">WhatsApp</p>
                  <p className="text-xs text-slate-400">(11) 9xxxx-xxxx</p>
                </div>
                <div className="text-center">
                  <Mail className="h-8 w-8 text-blue-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">E-mail</p>
                  <p className="text-xs text-slate-400">suporte@elevalucro.com</p>
                </div>
                <div className="text-center">
                  <Phone className="h-8 w-8 text-green-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">Telefone</p>
                  <p className="text-xs text-slate-400">(11) 3xxx-xxxx</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-3">
                Parabéns pela decisão! 🎉
              </h3>
              <p className="text-emerald-50 mb-6">
                Você escolheu o plano {planName} e está prestes a transformar a gestão financeira da sua empresa. 
                Estamos aqui para garantir seu sucesso!
              </p>
              <button className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
                Finalizar onboarding
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center flex-1 ${
                    index !== steps.length - 1 ? 'relative' : ''
                  }`}
                >
                  {index !== steps.length - 1 && (
                    <div
                      className={`absolute top-5 left-1/2 w-full h-1 ${
                        index < currentStep ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index <= currentStep
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                    } transition-colors duration-300`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${
                      index <= currentStep ? 'text-white' : 'text-slate-400'
                    } hidden md:block`}>
                      {step.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-slate-900/50 backdrop-blur rounded-2xl shadow-lg p-8 min-h-[500px] border border-white/10">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-slate-800 border border-white/10 text-white hover:bg-slate-700'
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
            Anterior
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === steps.length - 1
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            Próximo
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}