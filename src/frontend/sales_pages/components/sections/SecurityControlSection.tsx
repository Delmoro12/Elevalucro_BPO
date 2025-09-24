"use client";

import { ShieldCheck, CreditCard, Smartphone, Clock, Lock, Eye } from "lucide-react";

export default function SecurityControlSection() {
  return (
    <section id="seguranca" className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm font-medium mb-6">
          <Lock className="h-4 w-4" />
          Diferencial exclusivo
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">
          Você mantém o <span className="text-emerald-300">controle total</span> dos pagamentos
        </h2>
        <p className="text-xl text-slate-300/90 max-w-3xl mx-auto">
          Ao contrário de outros BPOs, nossa equipe <span className="font-semibold text-white">NÃO tem autorização</span> para aprovar pagamentos. 
          Só você decide o que pagar.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="rounded-2xl border border-emerald-500/20 p-8 bg-gradient-to-br from-emerald-500/10 to-emerald-400/5">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-300"/>
            Como funciona nossa segurança
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white mb-1">Zero acesso bancário</p>
                <p className="text-sm text-slate-300/90">Nossa equipe NÃO tem autorização bancária ou cartões da empresa</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white mb-1">Aprovação diária via app</p>
                <p className="text-sm text-slate-300/90">Você recebe notificação no WhatsApp com link seguro para aprovar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white mb-1">Transparência total</p>
                <p className="text-sm text-slate-300/90">Veja todos os detalhes antes de aprovar cada pagamento</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white mb-1">Apenas 2-3 minutos/dia</p>
                <p className="text-sm text-slate-300/90">Processo rápido e simples de aprovação</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-8 bg-white/5">
          <h3 className="text-xl font-semibold mb-6">O que nossa equipe faz vs O que você faz</h3>
          <div className="space-y-6">
            <div>
              <p className="font-medium text-emerald-300 mb-2">✅ Nossa equipe faz:</p>
              <ul className="text-sm text-slate-300/90 space-y-1 ml-4">
                <li>• Organiza todos os pagamentos</li>
                <li>• Verifica vencimentos e valores</li>
                <li>• Prepara relatórios detalhados</li>
                <li>• Envia para sua aprovação</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-emerald-300 mb-2">🔐 Só você faz:</p>
              <ul className="text-sm text-slate-300/90 space-y-1 ml-4">
                <li>• Aprova ou rejeita pagamentos</li>
                <li>• Autoriza transferências</li>
                <li>• Mantém senhas bancárias</li>
                <li>• Controla cartões corporativos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-yellow-500/20 p-6 bg-yellow-500/5 text-center">
        <p className="text-lg font-medium text-yellow-200">
          ⚠️ Este modelo de segurança é <span className="text-white">exclusivo da ElevaLucro</span>. 
          Outros BPOs tradicionais pedem acesso total às contas.
        </p>
      </div>
    </section>
  );
}