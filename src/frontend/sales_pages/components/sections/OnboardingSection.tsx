"use client";

import { Calendar, CheckCircle2 } from "lucide-react";

interface Week {
  number: string;
  title: string;
  description: string;
  tasks: string[];
}

const weeks: Week[] = [
  {
    number: "1",
    title: "Diagnóstico e Setup",
    description: "Entendemos seu negócio e configuramos tudo",
    tasks: [
      "Reunião de kickoff e alinhamento",
      "Análise da situação financeira atual",
      "Criação de acessos e configurações",
      "Setup de categorias e centro de custos"
    ]
  },
  {
    number: "2",
    title: "Implementação",
    description: "Começamos a organizar seu financeiro",
    tasks: [
      "Importação de dados históricos",
      "Cadastro de fornecedores e clientes",
      "Configuração de contas bancárias",
      "Primeiros lançamentos assistidos"
    ]
  },
  {
    number: "3",
    title: "Operação Assistida",
    description: "Você aprende enquanto operamos juntos",
    tasks: [
      "Treinamento do app de aprovação",
      "Primeira semana de pagamentos",
      "Ajustes finos e melhorias",
      "Relatórios iniciais"
    ]
  },
  {
    number: "4",
    title: "100% Operacional",
    description: "Tudo funcionando perfeitamente",
    tasks: [
      "Operação completa e automatizada",
      "Primeiro fechamento mensal",
      "DRE e indicadores configurados",
      "Inicia ciclo normal de operação"
    ]
  }
];

export default function OnboardingSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 rounded-3xl p-12 border border-emerald-500/20">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium mb-6">
            <Calendar className="h-5 w-5" />
            Onboarding estruturado
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            De zero a <span className="text-emerald-300">100% organizado</span>
            <br />em apenas 30 dias
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Processo claro e acompanhado para transformar sua gestão financeira rapidamente, 
            sem interromper suas operações
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            {weeks.map((week, index) => (
              <div key={index} className="text-left bg-slate-900/60 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-emerald-300">
                      {week.number === "4" ? "✓" : week.number}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Semana {week.number}</h3>
                    <p className="text-xs text-emerald-300">{week.title}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300/90 mb-4">{week.description}</p>
                <ul className="space-y-2">
                  {week.tasks.map((task, taskIndex) => (
                    <li key={taskIndex} className="flex items-start gap-2 text-xs text-slate-400">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-lg text-white font-medium mb-2">
              Durante todo o processo você terá:
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Gerente de sucesso dedicado
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Suporte via WhatsApp
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Treinamento completo
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Garantia de satisfação
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}