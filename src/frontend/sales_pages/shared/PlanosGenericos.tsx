import { CheckCircle } from "lucide-react";
import { useTranslation } from '@/src/i18n';
import { type Locale } from '@/src/i18n/config';

interface PlanosGenericosProps {
  onSelectPlan?: (plan: string) => void;
  locale?: Locale;
}

export default function PlanosGenericos({ onSelectPlan, locale = 'pt-BR' }: PlanosGenericosProps) {
  const { t } = useTranslation(locale);
  return (
    <div className="mt-8 grid md:grid-cols-3 gap-6">
      {/* Plano Controle */}
      <div className="flex flex-col p-6 rounded-2xl bg-slate-900/60 border border-white/10">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xl font-semibold">{t('plans.control.name')}</h3>
          <span className="text-emerald-300 font-semibold">
            {t('plans.control.price')}<span className="text-slate-400 text-sm">{t('plans.control.period')}</span>
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-300/90">
          {t('plans.control.description')}
        </p>
        <ul className="flex-1 mt-4 space-y-2 text-sm text-slate-300/90">
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Elaboração/revisão de categorias (despesas, receitas) e centros de custos
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Elaboração/revisão do budget anual de despesas fixas
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Lançamento e pagamentos de Contas a Pagar
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Lançamento e recebimentos de Contas a Receber
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Conciliação bancária (cartão, PIX, boletos)
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Organização e envio de documentos fiscais para contabilidade
          </li>
        </ul>
        <div className="mt-auto pt-6">
          {onSelectPlan && (
            <button 
              onClick={() => onSelectPlan("Controle")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
{t('plans.control.cta')}
            </button>
          )}
        </div>
      </div>

      {/* Plano Gerencial */}
      <div className="flex flex-col p-6 rounded-2xl bg-slate-900/60 border border-white/10">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xl font-semibold">{t('plans.management.name')}</h3>
          <span className="text-emerald-300 font-semibold">
            {t('plans.management.price')}<span className="text-slate-400 text-sm">{t('plans.management.period')}</span>
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-300/90">
          {t('plans.management.description')}
        </p>
        <ul className="flex-1 mt-4 space-y-2 text-sm text-slate-300/90">
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Todos os serviços do Plano Controle
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Cobrança de inadimplentes (contato ativo com clientes em atraso)
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Emissão de boletos
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Relatório de fluxo de caixa
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Relatórios de entradas e saídas
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Caixa diário
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            DRE e indicadores de receitas e despesas por categoria
          </li>
        </ul>
        <div className="mt-auto pt-6">
          {onSelectPlan && (
            <button 
              onClick={() => onSelectPlan("Gerencial")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
{t('plans.management.cta')}
            </button>
          )}
        </div>
      </div>

      {/* Plano Avançado */}
      <div className="flex flex-col p-6 rounded-2xl bg-slate-900/60 border border-white/10 ring-1 ring-emerald-300/30">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xl font-semibold">{t('plans.advanced.name')}</h3>
          <span className="text-emerald-300 font-semibold">
            {t('plans.advanced.price')}<span className="text-slate-400 text-sm">{t('plans.advanced.period')}</span>
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-300/90">
          {t('plans.advanced.description')}
        </p>
        <ul className="flex-1 mt-4 space-y-2 text-sm text-slate-300/90">
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Todos os serviços do Plano Gerencial
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Análise mensal do DRE e indicadores com consultor
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Análise mensal de margens e lucratividade com consultor
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Análise mensal do fluxo de caixa com consultor
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 flex-shrink-0" />
            Suporte para definição das ações estratégicas relacionadas às análises
          </li>
        </ul>
        <div className="mt-auto pt-6">
          {onSelectPlan && (
            <button 
              onClick={() => onSelectPlan("Avançado")}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
{t('plans.advanced.cta')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}