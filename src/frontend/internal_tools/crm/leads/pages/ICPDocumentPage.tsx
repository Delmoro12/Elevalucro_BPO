'use client';

import React from 'react';
import { ArrowLeft, FileText, Calendar, User } from 'lucide-react';

interface ICPDocumentPageProps {
  onBack: () => void;
}

export const ICPDocumentPage: React.FC<ICPDocumentPageProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar para Leads
          </button>
        </div>
      </div>

      {/* Document Container */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Document Header */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              📑 Documento de ICP — Ideal Customer Profile
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <strong>Empresa:</strong> ElevaLucro
            </div>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Calendar className="h-4 w-4" />
              <strong>Data:</strong> 02/10/2025
            </div>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <User className="h-4 w-4" />
              <strong>Responsável:</strong> [Lucas Del Moro / Equipe ElevaLucro]
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-8 space-y-8 max-h-[calc(100vh-20rem)] overflow-y-auto">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
              1. Visão Geral
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              A ElevaLucro oferece serviços de BPO Financeiro focados em pequenas empresas que estão em crescimento, 
              mas ainda operam de forma desorganizada na gestão financeira. Nosso ICP reflete exatamente esse perfil 
              de negócio: empreendedores que sentem as dores da falta de clareza nos números e buscam retomar o foco 
              no core business.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
              2. Características do Cliente Ideal
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">Perfil da Empresa</h3>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>Porte:</strong> Micro e pequenas empresas em crescimento</li>
                  <li><strong>Segmento:</strong> Serviços (ex: agências, consultorias, clínicas, academias, pequenos prestadores B2B)</li>
                  <li><strong>Fase de negócio:</strong>
                    <ul className="ml-4 mt-1 space-y-1 list-disc">
                      <li>Empresário fundou o negócio há alguns anos, validou o mercado, começou a escalar</li>
                      <li>Ainda atua fortemente no operacional e sente falta de tempo para gestão estratégica</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">Situação Financeira Atual</h3>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300 list-disc ml-4">
                  <li>Não possui sistema financeiro estruturado</li>
                  <li>Utiliza planilhas manuais ou registros informais</li>
                  <li>Já sente dificuldade em acompanhar entradas, saídas e fluxo de caixa</li>
                  <li>Não sabe responder claramente:
                    <ul className="ml-4 mt-1 space-y-1 list-disc">
                      <li>Qual o lucro líquido do mês</li>
                      <li>Se o negócio está crescendo de forma saudável</li>
                      <li>Se há dinheiro suficiente para honrar compromissos futuros</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">Comportamento / Cultura</h3>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300 list-disc ml-4">
                  <li>Perfil empreendedor "fazedor"</li>
                  <li>Foco maior em vendas e operação do que em gestão</li>
                  <li>Reconhece que precisa de organização financeira, mas sente angústia por não conseguir implementar sozinho</li>
                  <li>Valorizam soluções práticas, simples e rápidas de implementar</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
              3. Dores Identificadas
            </h2>
            
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Falta de clareza financeira</h3>
                <ul className="space-y-1 text-red-700 dark:text-red-300 list-disc ml-4">
                  <li>Não sabem exatamente quanto lucram ou se estão no vermelho</li>
                  <li>Ausência de relatórios consistentes</li>
                </ul>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-orange-800 dark:text-orange-200 mb-2">Sobrecarga do empreendedor</h3>
                <ul className="space-y-1 text-orange-700 dark:text-orange-300 list-disc ml-4">
                  <li>Empresário gasta tempo no financeiro em vez de atuar no crescimento</li>
                  <li>Energia desviada do core business</li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">Insegurança nas decisões</h3>
                <ul className="space-y-1 text-yellow-700 dark:text-yellow-300 list-disc ml-4">
                  <li>Tomam decisões sem base em dados</li>
                  <li>Medo de comprometer o futuro do negócio</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">Desorganização operacional</h3>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300 list-disc ml-4">
                  <li>Planilhas desatualizadas, erros de lançamento, perda de documentos</li>
                  <li>Retrabalho constante</li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-purple-800 dark:text-purple-200 mb-2">Angústia emocional</h3>
                <ul className="space-y-1 text-purple-700 dark:text-purple-300 list-disc ml-4">
                  <li>Sensação de estar "perdido"</li>
                  <li>Preocupação constante com contas, prazos e sustentabilidade</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 - Table */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
              4. Níveis de Consciência do Cliente
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">Nível</th>
                    <th className="text-left p-4 font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">Descrição</th>
                    <th className="text-left p-4 font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">Sinais típicos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">Inconsciente</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">Não percebe que a falta de gestão financeira é a raiz do problema</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">Culpa o mercado, acha que o problema é só vender mais</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">Consciente do Problema</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">Sabe que está desorganizado financeiramente</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">Reclama de falta de tempo, erros em planilhas, estresse</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">Consciente da Solução</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">Entende que precisa de uma ferramenta ou serviço para organizar</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">Procura softwares de gestão ou terceirização</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-slate-900 dark:text-white">Consciente da ElevaLucro</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">Conhece a proposta do BPO financeiro da ElevaLucro</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">Faz comparações entre custo interno vs terceirização</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
              5. O que Gostariam de Ter como Solução
            </h2>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300 list-disc ml-4">
              <li>Clareza diária sobre receitas, despesas e lucro</li>
              <li>Relatórios simples e visuais (fluxo de caixa, DRE)</li>
              <li>Previsibilidade para planejar o futuro</li>
              <li>Mais tempo livre para focar no crescimento e clientes</li>
              <li>Tranquilidade emocional ao saber que "está no controle"</li>
              <li>Parceiro confiável que faça a execução, mas mantenha o empresário na decisão final</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
              6. Principais Objeções
            </h2>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300 list-disc ml-4">
              <li><strong>Custo:</strong> "Será que não sai mais barato contratar alguém interno ou continuar nas planilhas?"</li>
              <li><strong>Controle:</strong> "Vou perder autonomia se terceirizar o financeiro?"</li>
              <li><strong>Segurança:</strong> "É seguro passar minhas informações financeiras?"</li>
              <li><strong>Complexidade da transição:</strong> "E se for difícil migrar meus controles atuais para o novo modelo?"</li>
              <li><strong>Desconhecimento:</strong> "Nunca ouvi falar em BPO financeiro, será que funciona mesmo para empresas pequenas?"</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
              7. Situações Comuns do ICP
            </h2>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300 list-disc ml-4">
              <li>Empresário trabalha até tarde conciliando planilhas</li>
              <li>Vendas estão crescendo, mas não há clareza se o crescimento gera lucro real</li>
              <li>Recebe boletos e notas fiscais, mas não tem fluxo de aprovação organizado</li>
              <li>Já recebeu alerta do contador de que "precisa organizar as finanças"</li>
              <li>Sente ansiedade quando precisa tomar decisão de investimento (contratar, expandir, comprar)</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
              8. Mensagens-Chave para Comunicação
            </h2>
            <div className="space-y-3">
              {[
                "\"Você cresce mais quando foca no que faz melhor.\"",
                "\"Nós organizamos o financeiro para você ter clareza e tranquilidade.\"",
                "\"Pare de perder tempo no operacional e volte a ser dono do seu negócio.\"",
                "\"Controle total com execução terceirizada: simples, seguro e eficiente.\"",
                "\"Transformamos planilhas confusas em números claros todos os dias.\""
              ].map((message, index) => (
                <div key={index} className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4">
                  <p className="text-emerald-800 dark:text-emerald-200 font-medium">{message}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
              9. Resumo Executivo do ICP
            </h2>
            
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">Cliente Ideal:</h3>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300 list-disc ml-4">
                <li>Pequena empresa de serviços em crescimento</li>
                <li>Empresário ainda centraliza operações, incluindo finanças</li>
                <li>Usa planilhas ou controles informais</li>
                <li>Sente dor pela falta de clareza, insegurança e sobrecarga</li>
                <li>Busca clareza, previsibilidade e tempo livre</li>
                <li><strong>Barreira principal:</strong> medo de perder controle ou custo percebido alto</li>
              </ul>
              
              <div className="mt-6 p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <p className="text-emerald-800 dark:text-emerald-200 font-medium">
                  💡 Esse documento pode ser usado como guia oficial para marketing, SDRs e IA de qualificação automática.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};