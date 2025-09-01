-- ======================================
-- Migration: Denormalize Onboarding Checklist and Unify Views
-- ======================================
-- 1. Adds denormalized fields to companies_onboarding_checklist
-- 2. Creates unified view for both kanban and modal
-- 3. Updates procedures to insert denormalized data

-- 1. Add denormalized fields to companies_onboarding_checklist table
ALTER TABLE companies_onboarding_checklist 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS week INTEGER,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS enabled_plans TEXT[] DEFAULT ARRAY['controle', 'gerencial', 'avancado'],
ADD COLUMN IF NOT EXISTS responsible_department TEXT DEFAULT 'Customer Success';

-- 2. Add check constraint for week
ALTER TABLE companies_onboarding_checklist 
ADD CONSTRAINT companies_onboarding_checklist_week_check 
CHECK (week IS NULL OR week IN (1, 2, 3, 4));

-- 3. Create indexes for new denormalized fields
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_week ON companies_onboarding_checklist(week);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_display_order ON companies_onboarding_checklist(display_order);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_enabled_plans ON companies_onboarding_checklist USING GIN(enabled_plans);
CREATE INDEX IF NOT EXISTS idx_companies_onboarding_responsible_department ON companies_onboarding_checklist(responsible_department);

-- 4. Update table comments
COMMENT ON TABLE companies_onboarding_checklist IS 'Tracks onboarding checklist progress for each company with denormalized checklist data for performance';
COMMENT ON COLUMN companies_onboarding_checklist.title IS 'Denormalized title of the checklist item';
COMMENT ON COLUMN companies_onboarding_checklist.description IS 'Denormalized description of the checklist item';
COMMENT ON COLUMN companies_onboarding_checklist.week IS 'Denormalized week number (1-4) for onboarding timeline';
COMMENT ON COLUMN companies_onboarding_checklist.display_order IS 'Denormalized display order within the week';
COMMENT ON COLUMN companies_onboarding_checklist.enabled_plans IS 'Denormalized array of plans where this item is enabled';
COMMENT ON COLUMN companies_onboarding_checklist.responsible_department IS 'Denormalized department responsible for this task';

-- 5. Update existing records with denormalized data (if any exist)
UPDATE companies_onboarding_checklist 
SET 
  title = oc.title,
  description = oc.description,
  week = oc.week,
  display_order = oc.display_order,
  enabled_plans = oc.enabled_plans,
  responsible_department = oc.responsible_department
FROM onboarding_checklist oc
WHERE companies_onboarding_checklist.checklist_item_id = oc.id
AND companies_onboarding_checklist.title IS NULL; -- Only update if not already set

-- 6. Create unified view for both kanban and modal
CREATE OR REPLACE VIEW onboarding_companies_unified AS
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
  c.id, c.name, c.subscription_plan, 
  c.onboarding_progress, c.lifecycle_stage, c.created_at, s.status
ORDER BY c.created_at ASC;  -- Mais antigas primeiro

-- Add comment to unified view
COMMENT ON VIEW onboarding_companies_unified IS 
'View unificada para onboarding - serve tanto para listagem do kanban quanto para detalhes do modal.
Usa apenas companies_onboarding_checklist (desnormalizada) para melhor performance.
Retorna lista vazia de checklist_items quando empresa não tem itens cadastrados.';

-- 7. Update setup_company_onboarding_checklist procedure to insert denormalized data
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

  -- Create checklist items for the company based on active templates
  -- Insert denormalized data for performance
  INSERT INTO companies_onboarding_checklist (
    company_id,
    checklist_item_id,
    title,
    description,
    week,
    display_order,
    enabled_plans,
    responsible_department,
    is_checked,
    created_at,
    updated_at
  )
  SELECT 
    p_company_id,
    oc.id,
    oc.title,
    oc.description,
    oc.week,
    oc.display_order,
    oc.enabled_plans,
    oc.responsible_department,
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
Now inserts denormalized data for better performance.
Parameters:
- p_company_id: UUID of the company
- p_subscription_plan: Subscription plan (controle, gerencial, avancado) - defaults to controle
Returns: JSONB with success status and created items count';