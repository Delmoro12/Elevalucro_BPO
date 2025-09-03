import { CheckCircle, Clock, Shield, TrendingUp, Users, FileText, BarChart3, Heart, ArrowRight, Star, LineChart, Workflow, Smartphone, CreditCard, Banknote, Wallet, ShieldCheck } from "lucide-react";

export default function LandingClinics() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-400/20 grid place-items-center ring-1 ring-emerald-300/40">
              <span className="text-emerald-300 font-bold">EL</span>
            </div>
            <span className="text-sm tracking-widest text-slate-300">ELEVALUCRO</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#como-funciona" className="hover:text-white">Como funciona</a>
            <a href="#beneficios" className="hover:text-white">Benefícios</a>
            <a href="#interface" className="hover:text-white">Interface</a>
            <a href="#planos" className="hover:text-white">Planos</a>
            <a href="#contato" className="hover:text-white">Contato</a>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(40%_60%_at_70%_10%,rgba(16,185,129,.15),transparent)]" />
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/10 text-emerald-300 text-sm font-medium mb-6">
              <Heart className="h-4 w-4" />
              Especialistas em clínicas
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6">
              Gestão financeira <span className="text-emerald-300">descomplicada</span> para sua clínica
            </h1>
            <p className="text-xl text-slate-300/90 mb-8 max-w-3xl mx-auto">
              Tenha clareza absoluta dos números, com relatórios, fluxo de caixa e lucros sempre à mão.
            </p>
            <button className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
              👉 Quero minha clínica organizada
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* A DOR DO CLIENTE */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-6">
              Sua clínica precisa de <span className="text-emerald-300">atenção</span>, não de planilhas sem fim.
            </h2>
            <p className="text-slate-300/90 text-lg mb-8">
              Médicos e gestores gastam tempo precioso com controles financeiros manuais que só geram dor de cabeça:
            </p>
          </div>
          <div className="rounded-2xl border border-red-500/20 p-8 bg-red-500/5">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                <p className="text-slate-300/90">Planilhas confusas que nunca batem</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                <p className="text-slate-300/90">Falta de visibilidade sobre fluxo de caixa</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                <p className="text-slate-300/90">Decisões importantes tomadas sem números confiáveis</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                <p className="text-slate-300/90">Risco de erros e atrasos em pagamentos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* A SOLUÇÃO ELEVALUCRO */}
      <section id="solucao" className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            A <span className="text-emerald-300">retaguarda financeira</span> da sua clínica, nas mãos de especialistas
          </h2>
          <p className="text-xl text-slate-300/90 max-w-4xl mx-auto">
            Com a ElevaLucro, você terceiriza toda a operação financeira da sua clínica para um time especializado em BPO financeiro para o setor de saúde.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 p-8 bg-emerald-500/5 text-center">
          <p className="text-lg text-slate-300/90">
            Você não precisa mais se preocupar com lançamentos, pagamentos e conciliações: <span className="text-emerald-300 font-semibold">tudo é feito por nós</span>, com transparência e segurança.
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6 flex items-center justify-center gap-2">
            <Workflow className="h-8 w-8 text-emerald-300"/>
            Como funciona na <span className="text-emerald-300">prática</span>
          </h2>
          <p className="text-xl text-slate-300/90 max-w-3xl mx-auto">
            Um processo simples e seguro, onde <span className="text-emerald-300 font-semibold">você mantém o controle total</span> dos pagamentos
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-start mb-12">
          <div>
            <h3 className="text-2xl font-semibold mb-6">Nossa rotina diária para sua clínica:</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-emerald-300">Recebemos seus documentos</h4>
                  <p className="text-sm text-slate-300/90">Notas fiscais, boletos e comprovantes via nossa interface</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-emerald-300">Processamos e organizamos</h4>
                  <p className="text-sm text-slate-300/90">Lançamentos contábeis, conciliação bancária e preparação dos pagamentos</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-emerald-300">Notificamos via WhatsApp</h4>
                  <p className="text-sm text-slate-300/90">Enviamos diariamente link para aprovação no nosso app exclusivo</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
                <div>
                  <h4 className="font-semibold text-emerald-300">Você aprova com segurança</h4>
                  <p className="text-sm text-slate-300/90">Acessa o app, revisa e aprova os pagamentos - <span className="text-white font-medium">só você tem essa autorização</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 p-8 bg-gradient-to-br from-emerald-500/10 to-emerald-400/5">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-300"/>
              Segurança e controle total
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300/90"><span className="text-white font-medium">Nossa equipe NÃO tem</span> autorização bancária para aprovar pagamentos</p>
              </div>
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300/90">Você recebe notificação diária via WhatsApp para acessar o app</p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300/90">Apenas você pode aprovar ou rejeitar cada pagamento</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300/90">Processo rápido: 2-3 minutos por dia para manter tudo em ordem</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-8 bg-white/5">
          <h3 className="text-xl font-semibold mb-6">O que nossa equipe cuida para você:</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Wallet className="h-8 w-8 text-emerald-300 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Contas a Pagar/Receber</h4>
              <p className="text-xs text-slate-300/90">Lançamentos, atualizações e lembretes</p>
            </div>
            <div className="text-center">
              <Banknote className="h-8 w-8 text-emerald-300 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Conciliação Bancária</h4>
              <p className="text-xs text-slate-300/90">Integrações e revisão humana</p>
            </div>
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-emerald-300 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Relatórios Gerenciais</h4>
              <p className="text-xs text-slate-300/90">DRE, fluxo de caixa e indicadores</p>
            </div>
            <div className="text-center">
              <ShieldCheck className="h-8 w-8 text-emerald-300 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Governança</h4>
              <p className="text-xs text-slate-300/90">Processos auditáveis e seguros</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERFACE EXCLUSIVA */}
      <section id="interface" className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Uma <span className="text-emerald-300">interface</span> feita para simplificar sua rotina
          </h2>
          <p className="text-slate-300/90 text-lg mb-8 max-w-3xl mx-auto">
            Além da nossa equipe, você terá acesso a uma interface digital moderna:
          </p>
          
          {/* Espaço para imagem da interface */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-8 mb-12">
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center border border-white/10">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-emerald-300" />
                </div>
                <p className="text-slate-400 text-sm">Interface da ElevaLucro</p>
                <p className="text-slate-500 text-xs mt-1">Imagem será adicionada aqui</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Tudo que você precisa em um só lugar</h3>
            <p className="text-slate-300/90 mb-6">
              Nossa interface foi desenvolvida pensando na rotina de clínicas e consultórios. 
              Simples, intuitiva e com todas as ferramentas que você precisa para acompanhar sua gestão financeira.
            </p>
            <p className="text-slate-300/90">
              <span className="text-emerald-300 font-semibold">Resultado:</span> você ganha tempo, 
              tem mais clareza dos números e pode focar no que realmente importa - cuidar dos seus pacientes.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 p-8 bg-white/5">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300/90">Enviar documentos facilmente (notas fiscais, comprovantes, contratos)</p>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300/90">Tirar dúvidas diretamente no painel, sem e-mails infinitos</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300/90">Acompanhar o trabalho em tempo real</p>
              </div>
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300/90">Consultar indicadores financeiros prontos para análise</p>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300/90">Visualizar fluxo de caixa atualizado diariamente</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300/90">Ter visão clara do DRE com lucros e custos estruturados</p>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-emerald-400/10 text-emerald-200 text-center">
              <p className="font-medium">Tudo em um só lugar, simples e confiável.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS PRINCIPAIS */}
      <section id="beneficios" className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Mais <span className="text-emerald-300">tranquilidade</span> e mais <span className="text-emerald-300">resultados</span> para sua clínica
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
            <Heart className="h-8 w-8 text-emerald-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Foco nos pacientes</h3>
            <p className="text-sm text-slate-300/90">Mais tempo para focar nos pacientes, enquanto cuidamos da gestão</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
            <Shield className="h-8 w-8 text-emerald-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Segurança total</h3>
            <p className="text-sm text-slate-300/90">Segurança de dados com processos auditáveis e protegidos</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
            <TrendingUp className="h-8 w-8 text-emerald-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Custo-benefício</h3>
            <p className="text-sm text-slate-300/90">Mais barato que contratar um funcionário interno</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
            <CheckCircle className="h-8 w-8 text-emerald-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Expertise especializada</h3>
            <p className="text-sm text-slate-300/90">Mais confiável por sermos especialistas em BPO para clínicas</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
            <Clock className="h-8 w-8 text-emerald-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Transparência total</h3>
            <p className="text-sm text-slate-300/90">Mais transparência: você acompanha tudo em tempo real</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
            <BarChart3 className="h-8 w-8 text-emerald-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Planejamento claro</h3>
            <p className="text-sm text-slate-300/90">Planejamento financeiro claro para crescer com previsibilidade</p>
          </div>
        </div>
      </section>

      {/* TENDÊNCIA DO MERCADO */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-2xl border border-white/10 p-8 bg-gradient-to-br from-emerald-500/10 to-emerald-400/5">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-center">
            O futuro da gestão é a <span className="text-emerald-300">terceirização especializada</span>
          </h2>
          <div className="max-w-4xl mx-auto space-y-6 text-lg text-slate-300/90">
            <p>
              Cada vez mais clínicas estão adotando o modelo de BPO financeiro: terceirizar a retaguarda para quem realmente entende de números.
            </p>
            <p>
              Isso significa: <span className="text-emerald-300 font-semibold">menos custo fixo</span>, <span className="text-emerald-300 font-semibold">mais eficiência</span> e <span className="text-emerald-300 font-semibold">mais clareza</span> para tomar decisões inteligentes.
            </p>
            <p className="text-center font-medium">
              Nós da ElevaLucro somos especialistas em BPO para clínicas e já ajudamos diversos consultórios a elevar seus lucros com simplicidade e segurança.
            </p>
          </div>
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Clínicas que já <span className="text-emerald-300">respiram tranquilas</span> com a ElevaLucro
          </h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 text-center">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl text-slate-300/90 mb-6 italic">
              "Antes eu me perdia com notas fiscais e boletos, hoje em 5 minutos sei como está a saúde financeira da clínica."
            </blockquote>
            <cite className="text-emerald-300 font-semibold">
              — Dr. João, Clínica Bem Viver
            </cite>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE PLANOS */}
      <section id="planos" className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-2xl border border-white/10 p-8 bg-white/5">
          <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2"><LineChart className="h-6 w-6 text-emerald-300"/>Escolha o plano ideal para sua clínica</h2>
          <p className="mt-4 text-slate-300/90 max-w-3xl">
            Comece com o que sua clínica precisa hoje e evolua conforme cresce. Em todos os planos, <span className="text-white font-medium">você mantém o controle total</span> dos pagamentos enquanto nós cuidamos de toda a operação.
          </p>

          {/* Pricing table */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {/* Plano 1 – Controle */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-semibold">Controle</h3>
                <span className="text-emerald-300 font-semibold">R$ 1.200,00<span className="text-slate-400 text-sm"> / mês</span></span>
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
                <span className="text-emerald-300 font-semibold">R$ 1.500,00<span className="text-slate-400 text-sm"> / mês</span></span>
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
                <span className="text-emerald-300 font-semibold">R$ 1.900,00<span className="text-slate-400 text-sm"> / mês</span></span>
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

      {/* CTA FINAL */}
      <section id="contato" className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-semibold mb-6">
            Eleve os <span className="text-emerald-300">resultados</span> da sua clínica
          </h2>
          <p className="text-xl text-slate-300/90 mb-8 max-w-3xl mx-auto">
            Simplifique sua gestão financeira e ganhe tempo para o que realmente importa: cuidar dos seus pacientes.
          </p>
          <button className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-xl font-semibold text-xl transition-colors">
            Quero organizar minha clínica
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ElevaLucro • BPO Financeiro para Clínicas</p>
          <p className="text-slate-500">Gestão financeira especializada</p>
        </div>
      </footer>
    </div>
  );
}