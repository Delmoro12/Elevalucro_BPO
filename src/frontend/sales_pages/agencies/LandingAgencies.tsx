"use client";

import { CheckCircle, Clock, Shield, TrendingUp, Users, FileText, BarChart3, Megaphone, ArrowRight, Star, LineChart, Workflow, Smartphone, CreditCard, Banknote, Wallet, ShieldCheck, X, Building, Phone, Mail, UserCircle, Target } from "lucide-react";
import { useState } from "react";
import PlanosGenericos from '../shared/PlanosGenericos';

export default function LandingAgencies() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    agencia: "",
    cargo: "",
    clientesAtivos: "",
    faturamento: "",
    principalDesafio: "",
    melhorHorario: ""
  });

  const handleOpenModal = (planName: string) => {
    setSelectedPlan(planName);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você integraria com sua API/backend
    console.log("Dados do formulário:", { ...formData, plano: selectedPlan });
    alert("Obrigado pelo interesse! Em breve entraremos em contato.");
    setShowModal(false);
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      agencia: "",
      cargo: "",
      clientesAtivos: "",
      faturamento: "",
      principalDesafio: "",
      melhorHorario: ""
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/images/Logo ElevaLucro.png" 
              alt="ElevaLucro - BPO Financeiro para Agências"
              className="h-10 w-auto"
            />
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
        <div className="absolute inset-0 bg-[radial-gradient(40%_60%_at_70%_10%,rgba(16,185,129,.15),transparent)] pointer-events-none" />
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/10 text-emerald-300 text-sm font-medium mb-6">
              <Megaphone className="h-4 w-4" />
              Especialistas em agências
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6">
              Gestão financeira <span className="text-emerald-300">descomplicada</span> para sua agência
            </h1>
            <p className="text-xl text-slate-300/90 mb-8 max-w-3xl mx-auto">
              Tenha controle total dos projetos, margens dos clientes e lucratividade por campanha, com relatórios sempre em dia.
            </p>
            <div className="relative z-10">
              <button 
                type="button"
                onClick={() => {
                  const planosSection = document.getElementById('planos');
                  if (planosSection) {
                    planosSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="relative z-10 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors cursor-pointer">
                📊 Quero minha agência organizada
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* A DOR DO CLIENTE */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-6">
              Sua agência precisa de <span className="text-emerald-300">foco na criatividade</span>, não em planilhas complexas.
            </h2>
            <p className="text-slate-300/90 text-lg mb-8">
              Criativos e gestores perdem tempo valioso com controles financeiros manuais que só geram dor de cabeça:
            </p>
          </div>
          <div className="rounded-2xl border border-red-500/20 p-8 bg-red-500/5">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                <p className="text-slate-300/90">Margem real dos projetos calculada "no chute"</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                <p className="text-slate-300/90">Horas trabalhadas não contabilizadas corretamente</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                <p className="text-slate-300/90">Falta de visibilidade sobre lucratividade por cliente</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                <p className="text-slate-300/90">Despesas operacionais descontroladas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* A SOLUÇÃO ELEVALUCRO */}
      <section id="solucao" className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            A <span className="text-emerald-300">retaguarda financeira</span> da sua agência, nas mãos de especialistas
          </h2>
          <p className="text-xl text-slate-300/90 max-w-4xl mx-auto">
            Com a ElevaLucro, você terceiriza toda a operação financeira da sua agência para um time especializado em BPO financeiro para o setor criativo.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 p-8 bg-emerald-500/5 text-center">
          <p className="text-lg text-slate-300/90">
            Você não precisa mais se preocupar com controle de projetos, margem de clientes e conciliações: <span className="text-emerald-300 font-semibold">tudo é feito por nós</span>, com transparência e segurança.
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
            <h3 className="text-2xl font-semibold mb-6">Nossa rotina diária para sua agência:</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-emerald-300">Recebemos seus documentos</h4>
                  <p className="text-sm text-slate-300/90">Contratos de clientes, notas fiscais, timesheet de horas via nossa interface</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-emerald-300">Processamos e organizamos</h4>
                  <p className="text-sm text-slate-300/90">Custos por projeto, margem por cliente e preparação dos pagamentos</p>
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
              <Target className="h-8 w-8 text-emerald-300 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Controle de Projetos</h4>
              <p className="text-xs text-slate-300/90">Custos, horas e margem por cliente</p>
            </div>
            <div className="text-center">
              <Banknote className="h-8 w-8 text-emerald-300 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Contas a Pagar/Receber</h4>
              <p className="text-xs text-slate-300/90">Fornecedores, freelancers e clientes</p>
            </div>
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-emerald-300 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Relatórios Gerenciais</h4>
              <p className="text-xs text-slate-300/90">DRE, lucratividade e performance</p>
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
          
          {/* Interface da ElevaLucro */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-8 mb-12">
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden">
              <img 
                src="/images/tela_app.png" 
                alt="Interface da ElevaLucro - Sistema de gestão financeira para agências"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Tudo que você precisa em um só lugar</h3>
            <p className="text-slate-300/90 mb-6">
              Nossa interface foi desenvolvida pensando na rotina de agências de marketing e comunicação. 
              Simples, intuitiva e com todas as ferramentas que você precisa para acompanhar sua gestão financeira.
            </p>
            <p className="text-slate-300/90">
              <span className="text-emerald-300 font-semibold">Resultado:</span> você ganha tempo, 
              tem mais clareza dos números e pode focar no que realmente importa - criar campanhas brilhantes e conquistar novos clientes.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 p-8 bg-white/5">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300/90">Enviar documentos facilmente (contratos, timesheet, notas fiscais)</p>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300/90">Tirar dúvidas diretamente no painel, sem e-mails infinitos</p>
              </div>
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300/90">Consultar lucratividade por projeto e cliente em tempo real</p>
              </div>
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300/90">Acompanhar indicadores de performance e margem</p>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300/90">Visualizar fluxo de caixa e projeções atualizado diariamente</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300/90">Ter visão clara do DRE com custos e receitas por projeto</p>
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
            Mais <span className="text-emerald-300">tranquilidade</span> e mais <span className="text-emerald-300">resultados</span> para sua agência
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
            <Megaphone className="h-8 w-8 text-emerald-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Foco na criatividade</h3>
            <p className="text-sm text-slate-300/90">Mais tempo para criar campanhas e atender clientes, enquanto cuidamos da gestão</p>
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
            <p className="text-sm text-slate-300/90">Mais confiável por sermos especialistas em BPO para agências</p>
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
              Cada vez mais agências estão adotando o modelo de BPO financeiro: terceirizar a retaguarda para quem realmente entende de números.
            </p>
            <p>
              Isso significa: <span className="text-emerald-300 font-semibold">menos custo fixo</span>, <span className="text-emerald-300 font-semibold">mais eficiência</span> e <span className="text-emerald-300 font-semibold">mais clareza</span> para tomar decisões inteligentes.
            </p>
            <p className="text-center font-medium">
              Nós da ElevaLucro somos especialistas em BPO para agências e já ajudamos diversas empresas criativas a elevar seus lucros com simplicidade e segurança.
            </p>
          </div>
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Agências que já <span className="text-emerald-300">respiram tranquilas</span> com a ElevaLucro
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
              "Antes eu não sabia se estava ganhando ou perdendo dinheiro com cada cliente, hoje sei a margem exata de cada projeto."
            </blockquote>
            <cite className="text-emerald-300 font-semibold">
              — Rafael Santos, Director Creative Agency
            </cite>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE PLANOS */}
      <section id="planos" className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-2xl border border-white/10 p-8 bg-white/5">
          <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2"><LineChart className="h-6 w-6 text-emerald-300"/>Escolha o plano ideal para sua agência</h2>
          <p className="mt-4 text-slate-300/90 max-w-3xl">
            Comece com o que sua agência precisa hoje e evolua conforme cresce. Em todos os planos, <span className="text-white font-medium">você mantém o controle total</span> dos pagamentos enquanto nós cuidamos de toda a operação.
          </p>

          {/* Pricing table */}
          <PlanosGenericos onSelectPlan={handleOpenModal} />

          <p className="mt-6 text-xs text-slate-400">* O escopo final é ajustado via SLA no onboarding. Itens não selecionados não serão executados.</p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="contato" className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-semibold mb-6">
            Eleve os <span className="text-emerald-300">resultados</span> da sua agência
          </h2>
          <p className="text-xl text-slate-300/90 mb-8 max-w-3xl mx-auto">
            Simplifique sua gestão financeira e ganhe tempo para o que realmente importa: criar campanhas brilhantes e conquistar novos clientes.
          </p>
          <button 
            onClick={() => handleOpenModal("Gerencial")}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-xl font-semibold text-xl transition-colors">
            Quero organizar minha agência
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ElevaLucro • BPO Financeiro para Agências</p>
          <p className="text-slate-500">Gestão financeira especializada</p>
        </div>
      </footer>

      {/* MODAL DE FORMULÁRIO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-white/10 shadow-2xl">
            {/* Header do Modal */}
            <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-white/10 p-6">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
              <h3 className="text-2xl font-semibold text-white">
                Transforme sua agência com o <span className="text-emerald-300">Plano {selectedPlan}</span>
              </h3>
              <p className="mt-2 text-slate-300/90">
                Preencha seus dados e nossa equipe entrará em contato em até 24h
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-emerald-300 flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  Seus dados
                </h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      name="nome"
                      required
                      value={formData.nome}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                      placeholder="Rafael Santos"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Cargo *
                    </label>
                    <select
                      name="cargo"
                      required
                      value={formData.cargo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    >
                      <option value="">Selecione...</option>
                      <option value="proprietario">Proprietário(a)</option>
                      <option value="diretor">Diretor(a)</option>
                      <option value="socio">Sócio(a)</option>
                      <option value="gerente">Gerente</option>
                      <option value="diretor-criativo">Diretor Criativo</option>
                      <option value="account">Account</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      E-mail profissional *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                      placeholder="rafael@agencia.com.br"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="telefone"
                      required
                      value={formData.telefone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                </div>
              </div>

              {/* Dados da Agência */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-emerald-300 flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Sobre sua agência
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome da agência *
                  </label>
                  <input
                    type="text"
                    name="agencia"
                    required
                    value={formData.agencia}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    placeholder="Creative Agency"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Clientes ativos (aproximado)
                    </label>
                    <select
                      name="clientesAtivos"
                      value={formData.clientesAtivos}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    >
                      <option value="">Selecione...</option>
                      <option value="1-5">1 a 5</option>
                      <option value="5-15">5 a 15</option>
                      <option value="15-30">15 a 30</option>
                      <option value="30-50">30 a 50</option>
                      <option value="50+">Mais de 50</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Faturamento mensal
                    </label>
                    <select
                      name="faturamento"
                      value={formData.faturamento}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    >
                      <option value="">Selecione...</option>
                      <option value="0-50k">Até R$ 50 mil</option>
                      <option value="50k-100k">R$ 50 a 100 mil</option>
                      <option value="100k-200k">R$ 100 a 200 mil</option>
                      <option value="200k-500k">R$ 200 a 500 mil</option>
                      <option value="500k+">Acima de R$ 500 mil</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Principal desafio financeiro hoje
                  </label>
                  <textarea
                    name="principalDesafio"
                    value={formData.principalDesafio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none"
                    placeholder="Ex: Não sei a margem real dos projetos, controle de horas, lucratividade por cliente..."
                  />
                </div>
              </div>

              {/* Contato */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-emerald-300 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Melhor horário para contato
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="melhorHorario"
                      value="manha"
                      onChange={handleInputChange}
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-300">Manhã</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="melhorHorario"
                      value="tarde"
                      onChange={handleInputChange}
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-300">Tarde</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="melhorHorario"
                      value="noite"
                      onChange={handleInputChange}
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-300">Noite</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="melhorHorario"
                      value="qualquer"
                      onChange={handleInputChange}
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-300">Qualquer</span>
                  </label>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Enviar interesse
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}