-- ======================================
-- Migration: Improve Onboarding Checklist with Plans Filter
-- ======================================
-- Adds enabled_plans and responsible_department fields to onboarding_checklist
-- Updates procedures to filter checklist items by subscription plan

-- 1. Add new columns to onboarding_checklist table
ALTER TABLE onboarding_checklist 
ADD COLUMN IF NOT EXISTS enabled_plans TEXT[] DEFAULT ARRAY['controle', 'gerencial', 'avancado'],
ADD COLUMN IF NOT EXISTS responsible_department TEXT DEFAULT 'Customer Success';

-- 2. Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_onboarding_checklist_enabled_plans 
ON onboarding_checklist USING GIN(enabled_plans);

CREATE INDEX IF NOT EXISTS idx_onboarding_checklist_responsible_department 
ON onboarding_checklist(responsible_department);

-- 3. Add comments for the new columns
COMMENT ON COLUMN onboarding_checklist.enabled_plans IS 
'Array of plans where this checklist item is enabled (controle, gerencial, avancado)';

COMMENT ON COLUMN onboarding_checklist.responsible_department IS 
'Department or team responsible for completing this task';

-- 4. Update existing onboarding_checklist data with proper plan configurations
-- Delete existing records first (they will be recreated with proper plan filtering)
DELETE FROM companies_onboarding_checklist;
DELETE FROM onboarding_checklist;

-- 5. Insert new checklist items with plan configurations and responsible departments

-- SEMANA 1 - Diagnóstico e Organização (Todos os planos)
INSERT INTO onboarding_checklist (title, description, week, display_order, enabled_plans, responsible_department) VALUES
('Reunião de kick-off e alinhamento de expectativas', 
 'Primeira reunião para entender necessidades, estabelecer expectativas e alinhar o processo de trabalho com o cliente', 
 1, 1, ARRAY['controle', 'gerencial', 'avancado'], 'Customer Success'),

('Coleta de informações e acessos necessários', 
 'Reunir documentos da empresa, extratos bancários, acessos a sistemas existentes e outras informações necessárias para iniciar o trabalho', 
 1, 2, ARRAY['controle', 'gerencial', 'avancado'], 'Operador Financeiro'),

('Análise das informações e definição do fluxo operacional', 
 'Análise detalhada da situação financeira atual da empresa e definição dos fluxos de trabalho personalizados', 
 1, 3, ARRAY['controle', 'gerencial', 'avancado'], 'Analista Financeiro');

-- SEMANA 2 - Implementação (Todos os planos)
INSERT INTO onboarding_checklist (title, description, week, display_order, enabled_plans, responsible_department) VALUES
('Configurações das ferramentas e acessos', 
 'Configuração das ferramentas de trabalho, criação de acessos e preparação do ambiente técnico para operação', 
 2, 1, ARRAY['controle', 'gerencial', 'avancado'], 'Operador Financeiro'),

('Mapeamento da situação financeira atual', 
 'Análise completa da situação financeira atual da empresa, identificando pendências e oportunidades de melhoria', 
 2, 2, ARRAY['controle', 'gerencial', 'avancado'], 'Analista Financeiro'),

('Criação do plano de contas personalizado', 
 'Desenvolvimento de um plano de contas específico para a empresa, considerando suas necessidades e características do negócio', 
 2, 3, ARRAY['controle', 'gerencial', 'avancado'], 'Analista Financeiro'),

('Categorização de despesas e receitas', 
 'Organização e categorização de todas as despesas e receitas da empresa para melhor controle e relatórios', 
 2, 4, ARRAY['controle', 'gerencial', 'avancado'], 'Operador Financeiro'),

('Elaboração do budget', 
 'Criação do orçamento anual da empresa com base no histórico e projeções de crescimento', 
 2, 5, ARRAY['gerencial', 'avancado'], 'Analista Financeiro'),

('Cadastros das contas bancárias e saldos iniciais', 
 'Cadastro de todas as contas bancárias da empresa e definição dos saldos iniciais para conciliação', 
 2, 6, ARRAY['controle', 'gerencial', 'avancado'], 'Operador Financeiro'),

('Cadastro das formas de pagamento e recebimento', 
 'Configuração de todas as formas de pagamento e recebimento utilizadas pela empresa', 
 2, 7, ARRAY['controle', 'gerencial', 'avancado'], 'Operador Financeiro'),

('Treinamento no app e dashboard', 
 'Treinamento completo do cliente para utilização das ferramentas, app mobile e dashboard web', 
 2, 8, ARRAY['controle', 'gerencial', 'avancado'], 'Customer Success');

-- SEMANA 3 - Operação Assistida (Todos os planos)
INSERT INTO onboarding_checklist (title, description, week, display_order, enabled_plans, responsible_department) VALUES
('Início da conciliação bancária', 
 'Início do processo diário de conciliação bancária com acompanhamento próximo e ajustes necessários', 
 3, 1, ARRAY['controle', 'gerencial', 'avancado'], 'Operador Financeiro'),

('Início do processo de aprovação de pagamentos', 
 'Implementação do fluxo de aprovação de pagamentos com o cliente, testando e ajustando o processo', 
 3, 2, ARRAY['controle', 'gerencial', 'avancado'], 'Operador Financeiro'),

('Ajustes finos nos processos', 
 'Refinamento dos processos implementados baseado na experiência inicial e feedback do cliente', 
 3, 3, ARRAY['controle', 'gerencial', 'avancado'], 'Customer Success'),

('Resolução de pendências identificadas', 
 'Tratamento de todas as pendências financeiras identificadas durante o mapeamento inicial', 
 3, 4, ARRAY['controle', 'gerencial', 'avancado'], 'Analista Financeiro'),

('Acompanhamento diário próximo', 
 'Acompanhamento intensivo da operação para garantir que todos os processos estejam funcionando corretamente', 
 3, 5, ARRAY['controle', 'gerencial', 'avancado'], 'Customer Success');

-- SEMANA 4 - Operação Plena (Planos superiores têm mais itens)
INSERT INTO onboarding_checklist (title, description, week, display_order, enabled_plans, responsible_department) VALUES
('Entrega do primeiro relatório gerencial', 
 'Preparação e entrega do primeiro conjunto completo de relatórios gerenciais da empresa', 
 4, 1, ARRAY['gerencial', 'avancado'], 'Analista Financeiro'),

('Apresentação de DRE e indicadores', 
 'Apresentação detalhada do DRE (Demonstrativo de Resultado do Exercício) e principais indicadores financeiros', 
 4, 2, ARRAY['gerencial', 'avancado'], 'Analista Financeiro'),

('Primeira reunião de consultoria', 
 'Primeira sessão de consultoria mensal com análise estratégica e recomendações para melhoria (plano Avançado)', 
 4, 3, ARRAY['avancado'], 'Consultor Sênior'),

('Transição para operação regular', 
 'Finalização do período de onboarding e transição para a operação regular com todos os processos estabilizados', 
 4, 4, ARRAY['controle', 'gerencial', 'avancado'], 'Customer Success');

-- 6. Drop and recreate the setup_company_onboarding_checklist function with new signature
DROP FUNCTION IF EXISTS public.setup_company_onboarding_checklist(UUID);

-- Recreate function with new signature (already done in procedure file, but ensuring it's applied)
CREATE OR REPLACE FUNCTION public.setup_company_onboarding_checklist(
  p_company_id UUID,
  p_subscription_plan VARCHAR(50) DEFAULT NULL
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_items_created INTEGER := 0;
  v_result JSONB;
  v_plan VARCHAR(50) := COALESCE(p_subscription_plan, 'controle');
BEGIN
  -- Log start
  RAISE LOG 'Setting up onboarding checklist for company: % with plan: %', p_company_id, v_plan;

  -- Create checklist items for the company based on active templates and plan
  INSERT INTO companies_onboarding_checklist (
    company_id,
    checklist_item_id,
    is_checked,
    created_at,
    updated_at
  )
  SELECT 
    p_company_id,
    oc.id,
    false, -- all items start unchecked
    NOW(),
    NOW()
  FROM onboarding_checklist oc
  WHERE oc.is_active = true
  AND v_plan = ANY(oc.enabled_plans) -- Filter by subscription plan
  ORDER BY oc.week ASC, oc.display_order ASC;

  -- Get count of items created
  GET DIAGNOSTICS v_items_created = ROW_COUNT;

  -- Prepare result
  v_result := jsonb_build_object(
    'success', true,
    'company_id', p_company_id,
    'subscription_plan', v_plan,
    'items_created', v_items_created,
    'message', format('%s onboarding checklist items created for %s plan', v_items_created, v_plan)
  );

  -- Log completion
  RAISE LOG 'Onboarding checklist setup completed - Company: %, Plan: %, Items created: %', 
    p_company_id, v_plan, v_items_created;

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Log error
  RAISE LOG 'Error setting up onboarding checklist for company % with plan %: %', p_company_id, v_plan, SQLERRM;
  
  -- Return error result
  RETURN jsonb_build_object(
    'success', false,
    'company_id', p_company_id,
    'subscription_plan', v_plan,
    'error', SQLERRM,
    'message', 'Failed to create onboarding checklist'
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.setup_company_onboarding_checklist TO service_role;
GRANT EXECUTE ON FUNCTION public.setup_company_onboarding_checklist TO postgres;

-- Add function comment
COMMENT ON FUNCTION public.setup_company_onboarding_checklist(UUID, VARCHAR) IS 
'Creates onboarding checklist items for a new company based on active templates and subscription plan.
Parameters:
- p_company_id: UUID of the company
- p_subscription_plan: Subscription plan (controle, gerencial, avancado) - defaults to controle
Returns: JSONB with success status and created items count';

-- 7. Add observacoes column if it doesn't exist (backwards compatibility)
ALTER TABLE companies_onboarding_checklist 
ADD COLUMN IF NOT EXISTS observacoes TEXT;