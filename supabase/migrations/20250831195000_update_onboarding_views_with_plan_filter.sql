-- ======================================
-- Migration: Update Onboarding Views with Plan Filter
-- ======================================
-- Updates views to filter checklist items by subscription plan

-- 1. Update company_onboarding_details view to filter by plan
CREATE OR REPLACE VIEW company_onboarding_details AS
SELECT 
  c.id as company_id,
  c.name as nome_empresa,
  '' as email, -- Campo não existe na tabela companies
  '' as telefone, -- Campo não existe na tabela companies  
  '' as segmento, -- Campo não existe na tabela companies
  c.subscription_plan as plano,
  c.onboarding_progress as progresso_onboarding,
  c.lifecycle_stage,
  c.created_at as data_inicio,
  
  -- Calcular semana de onboarding
  CASE 
    WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 7 THEN 'semana_1'
    WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 14 THEN 'semana_2'
    WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 21 THEN 'semana_3'
    ELSE 'semana_4'
  END as semana_onboarding,
  
  -- Dias desde criação
  EXTRACT(DAYS FROM (NOW() - c.created_at)) as dias_desde_criacao,
  
  -- Informações do checklist por semana
  json_agg(
    json_build_object(
      'id', oc.id,
      'title', oc.title,
      'description', oc.description,
      'week', oc.week,
      'display_order', oc.display_order,
      'is_active', oc.is_active,
      'enabled_plans', oc.enabled_plans,
      'responsible_department', oc.responsible_department,
      'is_checked', COALESCE(coc.is_checked, false),
      'checked_at', coc.checked_at,
      'checked_by', u.full_name,
      'notes', coc.notes
    )
    ORDER BY oc.week ASC, oc.display_order ASC
  ) as checklist_items,
  
  -- Estatísticas do onboarding
  COUNT(oc.id) as total_items,
  COUNT(coc.checklist_item_id) FILTER (WHERE coc.is_checked = true) as completed_items,
  COUNT(coc.checklist_item_id) FILTER (WHERE coc.is_checked = false OR coc.is_checked IS NULL) as pending_items,
  
  -- Estatísticas por semana
  COUNT(oc.id) FILTER (WHERE oc.week = 1) as semana_1_total,
  COUNT(coc.checklist_item_id) FILTER (WHERE oc.week = 1 AND coc.is_checked = true) as semana_1_completed,
  COUNT(oc.id) FILTER (WHERE oc.week = 2) as semana_2_total,
  COUNT(coc.checklist_item_id) FILTER (WHERE oc.week = 2 AND coc.is_checked = true) as semana_2_completed,
  COUNT(oc.id) FILTER (WHERE oc.week = 3) as semana_3_total,
  COUNT(coc.checklist_item_id) FILTER (WHERE oc.week = 3 AND coc.is_checked = true) as semana_3_completed,
  COUNT(oc.id) FILTER (WHERE oc.week = 4) as semana_4_total,
  COUNT(coc.checklist_item_id) FILTER (WHERE oc.week = 4 AND coc.is_checked = true) as semana_4_completed,
  
  -- Próxima ação
  (
    SELECT oc_next.title
    FROM onboarding_checklist oc_next
    LEFT JOIN companies_onboarding_checklist coc_next ON oc_next.id = coc_next.checklist_item_id 
      AND coc_next.company_id = c.id
    WHERE oc_next.is_active = true
    AND c.subscription_plan = ANY(oc_next.enabled_plans) -- Filter by subscription plan
    AND (coc_next.is_checked = false OR coc_next.is_checked IS NULL)
    ORDER BY oc_next.week ASC, oc_next.display_order ASC
    LIMIT 1
  ) as proxima_acao,
  
  -- Informações do plano/assinatura
  s.status as subscription_status,
  CASE 
    WHEN c.subscription_plan = 'controle' THEN 950.00
    WHEN c.subscription_plan = 'gerencial' THEN 1300.00
    WHEN c.subscription_plan = 'avancado' THEN 1700.00
    ELSE 0.00
  END as valor_mensal,
  
  -- Responsável (pode ser customizado depois)
  CASE 
    WHEN c.subscription_plan = 'avancado' THEN 'Consultor Sênior'
    WHEN c.subscription_plan = 'gerencial' THEN 'Consultor Pleno'
    ELSE 'Consultor Junior'
  END as responsavel

FROM companies c
LEFT JOIN onboarding_checklist oc ON oc.is_active = true 
  AND c.subscription_plan = ANY(oc.enabled_plans) -- Filter by company's subscription plan
LEFT JOIN companies_onboarding_checklist coc ON c.id = coc.company_id AND oc.id = coc.checklist_item_id
LEFT JOIN users u ON coc.checked_by = u.id
LEFT JOIN subscriptions s ON c.id = s.company_id AND s.status = 'active'
WHERE c.is_active = true 
AND c.lifecycle_stage = 'onboarding'
GROUP BY 
  c.id, c.name, c.subscription_plan, 
  c.onboarding_progress, c.lifecycle_stage, c.created_at, s.status
ORDER BY c.created_at ASC;

-- Add comment
COMMENT ON VIEW company_onboarding_details IS 
'View para detalhes completos do onboarding de uma empresa - usada no modal com checklist completo,
estatísticas por semana, próxima ação e informações detalhadas do plano. Agora filtra por plano de assinatura.';

-- 2. Update companies_onboarding_kanban view to filter próxima_acao by plan
CREATE OR REPLACE VIEW companies_onboarding_kanban AS
SELECT 
  c.id as company_id,
  c.name as nome_empresa,
  '' as email, -- Campo não existe na tabela companies
  '' as telefone, -- Campo não existe na tabela companies  
  '' as segmento, -- Campo não existe na tabela companies
  c.subscription_plan as plano,
  c.onboarding_progress as progresso_onboarding,
  c.lifecycle_stage,
  c.created_at as data_inicio,
  
  -- Calcular semana de onboarding baseada em dias desde criação
  CASE 
    WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 7 THEN 'semana_1'
    WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 14 THEN 'semana_2'
    WHEN EXTRACT(DAYS FROM (NOW() - c.created_at)) <= 21 THEN 'semana_3'
    ELSE 'semana_4'
  END as semana_onboarding,
  
  -- Dias desde criação
  EXTRACT(DAYS FROM (NOW() - c.created_at)) as dias_desde_criacao,
  
  -- Contadores de checklist
  COUNT(coc.checklist_item_id) as total_checklist_items,
  COUNT(coc.checklist_item_id) FILTER (WHERE coc.is_checked = true) as completed_items,
  COUNT(coc.checklist_item_id) FILTER (WHERE coc.is_checked = false) as pending_items,
  
  -- Próxima ação (primeiro item não checado ordenado por semana/ordem)
  (
    SELECT oc.title
    FROM companies_onboarding_checklist coc_next
    JOIN onboarding_checklist oc ON coc_next.checklist_item_id = oc.id
    WHERE coc_next.company_id = c.id 
    AND coc_next.is_checked = false
    AND oc.is_active = true
    AND c.subscription_plan = ANY(oc.enabled_plans) -- Filter by subscription plan
    ORDER BY oc.week ASC, oc.display_order ASC
    LIMIT 1
  ) as proxima_acao,
  
  -- Informações do plano/assinatura
  s.status as subscription_status,
  CASE 
    WHEN c.subscription_plan = 'controle' THEN 950.00
    WHEN c.subscription_plan = 'gerencial' THEN 1300.00
    WHEN c.subscription_plan = 'avancado' THEN 1700.00
    ELSE 0.00
  END as valor_mensal,
  
  -- Responsável padrão (pode ser customizado depois)
  CASE 
    WHEN c.subscription_plan = 'avancado' THEN 'Consultor Sênior'
    WHEN c.subscription_plan = 'gerencial' THEN 'Consultor Pleno'
    ELSE 'Consultor Junior'
  END as responsavel

FROM companies c
LEFT JOIN companies_onboarding_checklist coc ON c.id = coc.company_id
LEFT JOIN subscriptions s ON c.id = s.company_id AND s.status = 'active'
WHERE c.is_active = true 
AND c.lifecycle_stage = 'onboarding'  -- Só empresas em onboarding
GROUP BY 
  c.id, c.name, c.subscription_plan, 
  c.onboarding_progress, c.lifecycle_stage, c.created_at, s.status
ORDER BY c.created_at ASC;  -- Mais antigas primeiro

-- Add comment
COMMENT ON VIEW companies_onboarding_kanban IS 
'View para Kanban de onboarding - lista empresas em processo de onboarding com informações para cards, 
incluindo semana atual, progresso, próxima ação e responsável. Próxima ação agora filtra por plano de assinatura.';