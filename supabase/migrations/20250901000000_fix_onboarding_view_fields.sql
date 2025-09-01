-- Fix onboarding_companies_unified view to show real email, phone, segmento fields
-- instead of empty strings

-- Drop and recreate the view to change column types
DROP VIEW IF EXISTS onboarding_companies_unified;

CREATE VIEW onboarding_companies_unified AS
SELECT 
  c.id as company_id,
  c.name as nome_empresa,
  c.email as email,
  c.phone as telefone,  
  c.segmento as segmento,
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
  
  -- Checklist items completo (para modal) - usando dados desnormalizados
  CASE 
    WHEN COUNT(coc.id) = 0 THEN '[]'::json
    ELSE json_agg(
      json_build_object(
        'id', coc.checklist_item_id,
        'title', coc.title,
        'description', coc.description,
        'week', coc.week,
        'display_order', coc.display_order,
        'enabled_plans', coc.enabled_plans,
        'responsible_department', coc.responsible_department,
        'is_checked', coc.is_checked,
        'checked_at', coc.checked_at,
        'checked_by', u.full_name,
        'notes', coc.notes
      )
      ORDER BY coc.week ASC, coc.display_order ASC
    )
  END as checklist_items,
  
  -- Contadores gerais (para kanban e modal)
  COUNT(coc.id) as total_checklist_items,
  COUNT(coc.id) FILTER (WHERE coc.is_checked = true) as completed_items,
  COUNT(coc.id) FILTER (WHERE coc.is_checked = false) as pending_items,
  
  -- Estatísticas por semana (para modal)
  COUNT(coc.id) FILTER (WHERE coc.week = 1) as semana_1_total,
  COUNT(coc.id) FILTER (WHERE coc.week = 1 AND coc.is_checked = true) as semana_1_completed,
  COUNT(coc.id) FILTER (WHERE coc.week = 2) as semana_2_total,
  COUNT(coc.id) FILTER (WHERE coc.week = 2 AND coc.is_checked = true) as semana_2_completed,
  COUNT(coc.id) FILTER (WHERE coc.week = 3) as semana_3_total,
  COUNT(coc.id) FILTER (WHERE coc.week = 3 AND coc.is_checked = true) as semana_3_completed,
  COUNT(coc.id) FILTER (WHERE coc.week = 4) as semana_4_total,
  COUNT(coc.id) FILTER (WHERE coc.week = 4 AND coc.is_checked = true) as semana_4_completed,
  
  -- Próxima ação (para kanban) - primeiro item não checado
  (
    SELECT coc_next.title
    FROM companies_onboarding_checklist coc_next
    WHERE coc_next.company_id = c.id 
    AND coc_next.is_checked = false
    ORDER BY coc_next.week ASC, coc_next.display_order ASC
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
LEFT JOIN users u ON coc.checked_by = u.id
LEFT JOIN subscriptions s ON c.id = s.company_id AND s.status = 'active'
WHERE c.is_active = true 
AND c.lifecycle_stage = 'onboarding'  -- Só empresas em onboarding
GROUP BY 
  c.id, c.name, c.email, c.phone, c.segmento, c.subscription_plan, 
  c.onboarding_progress, c.lifecycle_stage, c.created_at, s.status
ORDER BY c.created_at ASC;  -- Mais antigas primeiro

-- Comentário
COMMENT ON VIEW onboarding_companies_unified IS 
'View unificada para onboarding - serve tanto para listagem do kanban quanto para detalhes do modal.
Corrigida para mostrar campos email, phone e segmento reais da tabela companies em vez de strings vazias.';