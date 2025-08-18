import { CheckCircle, LineChart, Clock, Building2, ShieldCheck, Workflow, Wallet, Users, TrendingUp, Banknote, FileText, Zap } from "lucide-react";

export default function ElevaLucroOQueVisualOriginal() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/images/Logo ElevaLucro.png" 
              alt="ElevaLucro - BPO Financeiro para Clínicas"
              className="h-10 w-auto"
            />
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#porque" className="hover:text-white">Por que mudar</a>
            <a href="#oque" className="hover:text-white">O que é o BPO</a>
            <a href="#cliente" className="hover:text-white">Vantagens p/ cliente</a>
            <a href="#eleva" className="hover:text-white">Vantagens do modelo BPO</a>
            <a href="#stack" className="hover:text-white">Stack & tecnologias</a>
            <a href="#modelo" className="hover:text-white">Modelo comercial</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(40%_60%_at_70%_10%,rgba(16,185,129,.15),transparent)]" />
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-emerald-300/80 text-xs font-semibold tracking-widest">O QUE</p>
            <h1 className="mt-3 text-3xl md:text-5xl font-semibold leading-tight">
              ElevaLucro <span className="text-emerald-300">BPO Financeiro</span>
            </h1>
            <p className="mt-4 text-slate-300/90 text-lg">
              Saímos do modelo de <span className="font-semibold text-white">consultoria que ensina</span> para um modelo que <span className="font-semibold text-white">executa as rotinas financeiras</span> diariamente, entrega <span className="font-semibold text-white">indicadores claros</span> e libera o empresário para focar no <span className="font-semibold text-white">core do negócio</span>.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: Por que mudar */}
      <section id="porque" className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2"><TrendingUp className="h-6 w-6 text-emerald-300"/>Por que mudar agora</h2>
            <p className="mt-4 text-slate-300/90">
              Pequenos empresários não querem virar especialistas em finanças: querem <span className="font-semibold text-white">tempo</span> e <span className="font-semibold text-white">previsibilidade de caixa</span>. O BPO entrega o resultado sem fricção.
            </p>
            <ul className="mt-6 space-y-3 text-slate-300/90">
              <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5"/> Reduz churn: relacionamento contínuo e valor percebido mês a mês.</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5"/> Receita recorrente: previsibilidade e escala operacional.</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5"/> Padronização: processos claros e replicáveis por segmento.</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5"/> Time focado em operação + análise, não em aulas e workshops.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
            <h3 className="text-lg font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-emerald-300"/>Aprendizados do modelo anterior</h3>
            <ul className="mt-4 space-y-2 text-slate-300/90 text-sm">
              <li>— <span className="text-white font-medium">Dependência da Amanda</span> como referência principal: confiança concentrada na pessoa, não no serviço/produto, limitando escala.</li>
              <li>— Contratos mal definidos e cobrança não-recorrente.</li>
              <li>— Clientes desorganizados engajam com <span className="text-white font-medium">resultado pronto</span>, não com curso.</li>
            </ul>
            <div className="mt-6 p-4 rounded-xl bg-emerald-400/10 text-emerald-200 text-sm flex items-center gap-2">
              <Zap className="h-5 w-5"/> Direção: execução contínua com indicadores e rituais de gestão.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: O que é BPO */}
      <section id="oque" className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2"><Workflow className="h-6 w-6 text-emerald-300"/>O que é BPO Financeiro</h2>
            <p className="mt-4 text-slate-300/90">
              BPO (Business Process Outsourcing) é a terceirização das rotinas financeiras: contas a pagar/receber, conciliação bancária, fluxo de caixa e relatórios gerenciais.
            </p>
            <p className="mt-3 text-slate-300/90">
              No Brasil, o mercado de BPO Financeiro cresce a taxas superiores a <span className="font-semibold text-white">15% ao ano</span> entre pequenas e médias empresas (fonte: ABES, 2024). Casos de sucesso como a <span className="font-semibold text-white">Marvee</span> e o avanço de plataformas como <span className="font-semibold text-white">Conta Azul</span>, <span className="font-semibold text-white">Sieg</span> e <span className="font-semibold text-white">PlayBPO</span> consolidam essa tendência.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-white/5 to-white/0">
            <h3 className="text-lg font-semibold">Escopo de um BPO</h3>
            <ul className="mt-4 space-y-3 text-slate-300/90">
              <li className="flex items-start gap-2"><Wallet className="h-5 w-5 text-emerald-300 mt-0.5"/> Contas a pagar e a receber (lançamento, atualização, lembretes).</li>
              <li className="flex items-start gap-2"><Banknote className="h-5 w-5 text-emerald-300 mt-0.5"/> Conciliação bancária (integrações e revisão humana).</li>
              <li className="flex items-start gap-2"><LineChart className="h-5 w-5 text-emerald-300 mt-0.5"/> Relatórios gerenciais e DRE.</li>
              <li className="flex items-start gap-2"><ShieldCheck className="h-5 w-5 text-emerald-300 mt-0.5"/> Governança e auditoria.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION: Vantagens para o cliente */}
      <section id="cliente" className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-2xl border border-white/10 p-8 bg-white/5">
          <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2"><Users className="h-6 w-6 text-emerald-300"/>Vantagens para o cliente</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10">
              <h4 className="font-semibold">Tempo e foco</h4>
              <p className="mt-2 text-sm text-slate-300/90">Não precisa aprender finanças. A ElevaLucro executa e entrega indicadores prontos.</p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10">
              <h4 className="font-semibold">Previsibilidade</h4>
              <p className="mt-2 text-sm text-slate-300/90">Fluxo de caixa claro (previsto x realizado), metas e alertas para decisões rápidas.</p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10">
              <h4 className="font-semibold">Segurança</h4>
              <p className="mt-2 text-sm text-slate-300/90">Pagamentos são <span className="text-white font-medium">preparados</span> pelo BPO e <span className="text-white font-medium">aprovados</span> pelo empresário.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Vantagens do modelo BPO */}
      <section id="eleva" className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-2xl border border-white/10 p-8 bg-gradient-to-br from-emerald-500/10 to-emerald-400/5">
          <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2"><Building2 className="h-6 w-6 text-emerald-300"/>Vantagens do modelo BPO</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6 text-slate-300/90">
            <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10">
              <h4 className="font-semibold">Escala operacional</h4>
              <p className="mt-2 text-sm">Processos padronizados por segmento. Um operador júnior pode operar <span className="text-white font-medium">15 a 20 empresas</span> simultaneamente.</p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10">
              <h4 className="font-semibold">Receita recorrente</h4>
              <p className="mt-2 text-sm">Planos mensais, inadimplência reduzida e previsibilidade para o crescimento.</p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10">
              <h4 className="font-semibold">Governança</h4>
              <p className="mt-2 text-sm">Papéis definidos: operador prepara, gestor revisa e <span className="text-white font-medium">empresário aprova pagamentos</span>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Stack & tecnologias */}
      <section id="stack" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2"><Clock className="h-6 w-6 text-emerald-300"/>Stack & tecnologias</h2>
        <p className="mt-4 text-slate-300/90 max-w-3xl">Combinamos softwares de mercado consolidados com nossa plataforma própria. Para o cliente, a experiência é simples e unificada; internamente, operamos com eficiência, compliance e alto nível de automação.</p>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-white/10 p-5 bg-white/5">
            <h4 className="font-semibold">Conta Azul</h4>
            <p className="mt-2 text-sm text-slate-300/90">Gestão financeira do cliente: pagar/receber, conciliação bancária, emissão de notas e integrações com bancos e adquirentes. Programa de parceiros para BPO.</p>
          </div>
          <div className="rounded-xl border border-white/10 p-5 bg-white/5">
            <h4 className="font-semibold">PlayBPO</h4>
            <p className="mt-2 text-sm text-slate-300/90">Operação interna: tarefas recorrentes, prazos, SLAs, comunicação com clientes e padronização dos rituais de fechamento.</p>
          </div>
          <div className="rounded-xl border border-white/10 p-5 bg-white/5">
            <h4 className="font-semibold">Interface ElevaLucro</h4>
            <p className="mt-2 text-sm text-slate-300/90">Plataforma própria que consolida dados do ERP e da operação, entregando ao cliente uma visão clara e simplificada. Permite acesso a indicadores financeiros, fluxo de caixa e tarefas, servindo como vitrine da nossa metodologia.</p>
          </div>
        </div>
      </section>

      {/* SECTION: Modelo comercial */}
      <section id="modelo" className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-2xl border border-white/10 p-8 bg-white/5">
          <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2"><LineChart className="h-6 w-6 text-emerald-300"/>Planos e Escopo (Clínicas)</h2>
          <p className="mt-4 text-slate-300/90 max-w-3xl">
            Três estágios de maturidade, um caminho claro de evolução. Todos os planos mantêm a governança: <span className="text-white font-medium">o empresário aprova os pagamentos</span>.
          </p>

          {/* Pricing table */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {/* Plano 1 – Controle */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-semibold">Controle</h3>
                <span className="text-emerald-300 font-semibold">R$ 950,00<span className="text-slate-400 text-sm"> / mês</span></span>
              </div>
              <p className="mt-2 text-sm text-slate-300/90">Básico organizado. Tiramos a clínica do operacional.</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300/90">
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Elaboração/revisão de categorias (despesas, receitas) e centros de custos</li>
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Elaboração/revisão do budget anual de despesas fixas</li>
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Lançamento e pagamentos de Contas a Pagar</li>
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Lançamento e recebimentos de Contas a Receber</li>
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Conciliação bancária (cartão, PIX, boletos)</li>
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Organização e envio de documentos fiscais para contabilidade</li>
              </ul>
            </div>

            {/* Plano 2 – Gerencial */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 ring-1 ring-emerald-300/30">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-semibold">Gerencial</h3>
                <span className="text-emerald-300 font-semibold">R$ 1.300,00<span className="text-slate-400 text-sm"> / mês</span></span>
              </div>
              <p className="mt-2 text-sm text-slate-300/90">Tudo do Controle + visão de gestão e cobrança ativa.</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300/90">
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Todos os serviços do Plano Controle</li>
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Cobrança de inadimplentes (contato ativo com clientes em atraso)</li>
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Emissão de NF (quando aplicável)</li>
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Relatório semanal de fluxo de caixa</li>
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Relatórios mensais simplificados (entradas x saídas, posição de caixa)</li>
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Apoio na gestão de contratos (fornecedores e convênios)</li>
              </ul>
            </div>

            {/* Plano 3 – Avançado */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-semibold">Avançado</h3>
                <span className="text-emerald-300 font-semibold">R$ 1.700,00<span className="text-slate-400 text-sm"> / mês</span></span>
              </div>
              <p className="mt-2 text-sm text-slate-300/90">Tudo do Gerencial + inteligência financeira para crescer.</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300/90">
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Todos os serviços do Plano Gerencial</li>
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Planejamento de fluxo de caixa projetado (curto prazo)</li>
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Projeções financeiras detalhadas (DRE projetada, cenários)</li>
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Relatórios analíticos detalhados (por área, médico, convênio, unidade)</li>
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Estudo de margens e lucratividade</li>
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Planejamento financeiro anual + acompanhamento de metas</li>
                <li className="flex gap-2 items-start"><CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0"/> Suporte consultivo estratégico (reuniões com gestor/diretor)</li>
              </ul>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-400">* O escopo final é ajustado via SLA no onboarding. Itens não selecionados não serão executados.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ElevaLucro • BPO Financeiro</p>
          <p className="text-slate-500">Draft interno — Apresentação "O que"</p>
        </div>
      </footer>
    </div>
  );
}