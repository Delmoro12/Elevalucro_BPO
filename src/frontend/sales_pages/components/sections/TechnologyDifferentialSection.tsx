"use client";

import { Zap, Code, Puzzle, Settings, ShieldCheck, Eye, Smartphone, Clock, X } from "lucide-react";

export default function TechnologyDifferentialSection() {
  return (
    <section id="seguranca" className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6">
          <Zap className="h-4 w-4" />
          Diferencial tecnológico exclusivo
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">
          Sistema <span className="text-emerald-300">100% próprio</span> criado especialmente para BPO financeiro
        </h2>
        <p className="text-xl text-slate-300/90 max-w-3xl mx-auto">
          Enquanto outros BPOs usam ERPs genéricos do mercado, desenvolvemos nossa própria plataforma 
          pensada especificamente para integrar perfeitamente com sua empresa.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="rounded-2xl border border-red-500/20 p-8 bg-red-500/5">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-red-400">
            <X className="h-6 w-6" />
            BPOs tradicionais usam
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-red-300 mb-1">ERPs genéricos</p>
                <p className="text-sm text-slate-300/90">Sistemas feitos para qualquer empresa, não otimizados para BPO</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-red-300 mb-1">Planilhas Excel</p>
                <p className="text-sm text-slate-300/90">Controles manuais sujeitos a erros e retrabalho</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-red-300 mb-1">Integrações limitadas</p>
                <p className="text-sm text-slate-300/90">Dificuldade para conectar com os sistemas do cliente</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-red-300 mb-1">Relatórios genéricos</p>
                <p className="text-sm text-slate-300/90">Informações padronizadas, não personalizadas para cada empresa</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 p-8 bg-gradient-to-br from-emerald-500/10 to-emerald-400/5">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-emerald-300">
            <Code className="h-6 w-6" />
            Nossa tecnologia própria
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white mb-1">Sistema desenhado para BPO</p>
                <p className="text-sm text-slate-300/90">Cada funcionalidade pensada especificamente para gestão financeira terceirizada</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Puzzle className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white mb-1">Integração perfeita</p>
                <p className="text-sm text-slate-300/90">Conecta facilmente com ferramentas que você já usa</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white mb-1">Transparência total</p>
                <p className="text-sm text-slate-300/90">Você acompanha tudo em tempo real pelo seu app personalizado</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white mb-1">Interface moderna</p>
                <p className="text-sm text-slate-300/90">App intuitivo desenvolvido pensando na experiência do usuário</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}