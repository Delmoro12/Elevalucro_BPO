"use client";

import { Workflow, Settings, Upload, CheckCircle, BarChart3, Calendar, Smartphone, Shield, Users, Database, Eye, Target, Puzzle } from "lucide-react";

export default function OperationalFlowSection() {
  return (
    <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6 flex items-center justify-center gap-2">
          <Workflow className="h-8 w-8 text-emerald-300"/>
          Como nossa metodologia funciona na <span className="text-emerald-300 ml-2">prática</span>
        </h2>
        <p className="text-xl text-slate-300/90 max-w-3xl mx-auto">
          Um processo inteligente que organiza sua gestão financeira sem complicação
        </p>
      </div>

      {/* Etapa 1: Configuração da Interface */}
      <div className="mb-12">
        <div className="rounded-2xl border border-emerald-500/20 p-4 md:p-8 bg-gradient-to-br from-emerald-500/10 to-emerald-400/5">
          <h3 className="text-xl md:text-2xl font-semibold mb-6 text-emerald-300 flex items-center gap-2">
            <Settings className="h-5 w-5 md:h-6 md:w-6" />
            1. Configuração da Sua Nova Interface Financeira
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Setup inicial em conjunto:</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300/90">Configuração do app ElevaLucro para sua empresa</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300/90">Elaboração ou revisão da estrutura de grupos e categorias</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300/90">Organização de contas e bancos</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300/90">Cadastro completo de clientes e fornecedores</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Planejamento estratégico:</h4>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Calendar className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">Budget anual das contas fixas</p>
                    <p className="text-sm text-slate-300/90">Planejamento de 12 meses das suas despesas recorrentes para previsibilidade total</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Etapa 2: Operação Diária */}
      <div className="mb-12">
        <h3 className="text-xl md:text-2xl font-semibold mb-8 text-emerald-300 flex items-center gap-2">
          <Upload className="h-5 w-5 md:h-6 md:w-6" />
          2. Operação Diária: Entrada e Processamento
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Entrada de Dados */}
          <div className="rounded-2xl border border-white/10 p-4 md:p-6 bg-white/5">
            <h4 className="font-semibold text-white mb-4">Como seus dados chegam até nós:</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg">
                <Smartphone className="h-6 w-6 text-emerald-300" />
                <div>
                  <p className="font-medium text-white text-sm">Lançamento manual no app</p>
                  <p className="text-xs text-slate-400">Registros diretos na plataforma</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg">
                <Database className="h-6 w-6 text-emerald-300" />
                <div>
                  <p className="font-medium text-white text-sm">Importação de planilhas</p>
                  <p className="text-xs text-slate-400">Upload simples dos seus arquivos</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg">
                <Puzzle className="h-6 w-6 text-emerald-300" />
                <div>
                  <p className="font-medium text-white text-sm">Integração automática</p>
                  <p className="text-xs text-slate-400">Conecta com ferramentas que você já usa</p>
                </div>
              </div>
            </div>
          </div>

          {/* Processamento */}
          <div className="rounded-2xl border border-emerald-500/20 p-4 md:p-6 bg-emerald-500/5">
            <h4 className="font-semibold text-white mb-4">Nossa equipe processa tudo:</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg">
                <Users className="h-6 w-6 text-emerald-300" />
                <div>
                  <p className="font-medium text-white text-sm">Validação especializada</p>
                  <p className="text-xs text-slate-400">Cada registro é verificado pela nossa equipe</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg">
                <Target className="h-6 w-6 text-emerald-300" />
                <div>
                  <p className="font-medium text-white text-sm">Categorização inteligente</p>
                  <p className="text-xs text-slate-400">Avaliamos a qual categoria cada movimento pertence</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg">
                <CheckCircle className="h-6 w-6 text-emerald-300" />
                <div>
                  <p className="font-medium text-white text-sm">Transformação em contas</p>
                  <p className="text-xs text-slate-400">Cada item vira uma conta a pagar ou receber organizada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Etapa 3: Rotinas e Aprovação */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-8 text-emerald-300 flex items-center gap-2">
          <Shield className="h-6 w-6" />
          3. Rotinas Diárias e Aprovação Segura
        </h3>
        
        <div className="rounded-2xl border border-white/10 p-8 bg-white/5">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-white mb-4">O que fazemos todos os dias:</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300/90">Verificação de todas as contas a pagar seguindo as rotinas da sua empresa</p>
                </div>
                <div className="flex items-start gap-3">
                  <Settings className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300/90">Inserção dos pagamentos no seu banco conforme cronograma</p>
                </div>
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300/90">Organização para você aprovar de forma simples e rápida</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Você mantém o controle total:</h4>
              <div className="bg-emerald-500/10 rounded-xl p-4">
                <p className="text-slate-300/90 mb-3">
                  <span className="text-emerald-300 font-medium">Só você aprova.</span> Nossa equipe prepara, organiza e notifica. 
                  Você entra no sistema, verifica os detalhes e autoriza cada pagamento.
                </p>
                <p className="text-sm text-slate-400">
                  ✅ Todo o processo é validado via nosso sistema em tempo real
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Etapa 4: Rotinas e Relatórios */}
      <div className="mb-12">
        <div className="rounded-2xl border border-emerald-500/20 p-8 bg-gradient-to-br from-emerald-500/10 to-emerald-400/5">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-300"/>
            4. Execução de Rotinas e Prestação de Contas
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-3">Rotinas executadas via sistema:</h4>
              <ul className="space-y-2 text-sm text-slate-300/90">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-300" />
                  Todas as rotinas são registradas no sistema pelos operadores
                </li>
                <li className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-300" />
                  Cliente pode acompanhar toda auditoria em tempo real
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-300" />
                  Transparência total em cada processo executado
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Reunião mensal de resultados:</h4>
              <ul className="space-y-2 text-sm text-slate-300/90">
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-300" />
                  Apresentação com gráficos e indicadores visuais
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-300" />
                  Linguagem simples e didática para fácil compreensão
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-300" />
                  Análise completa dos dados e oportunidades identificadas
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-emerald-300 font-semibold">Resultado:</span>
          <span className="text-white">Gestão financeira profissional, transparente e sem complicação</span>
        </div>
      </div>
    </section>
  );
}