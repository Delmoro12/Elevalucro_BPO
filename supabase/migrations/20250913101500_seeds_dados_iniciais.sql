-- =============================================================================
-- Migration: Seeds - Dados Iniciais
-- Generated at: 2025-09-13 10:15:00
-- =============================================================================
-- Populando dados iniciais do sistema:
-- 1. Roles (perfis de usuário) com IDs fixos
-- 2. Entities (entidades do sistema) 
-- 3. Onboarding Checklist (checklist de onboarding)
-- 4. Routines (rotinas operacionais templates)

BEGIN;

-- ========================================
-- 1. ROLES (PERFIS DE USUÁRIO) - IDs FIXOS
-- ========================================
INSERT INTO roles (id, name, description)
VALUES 
  (
    '1619d85e-ba76-44e4-aabe-ac804df89b8f',
    'client_side',
    'Cliente - Usuário do lado cliente com acesso às funcionalidades básicas'
  ),
  (
    'a3ac4409-99ab-4b01-936b-d3ef18be0a3f',
    'bpo_side',
    'Operador BPO - Usuário interno da ElevaLucro com acesso operacional'
  )
ON CONFLICT (name) DO UPDATE SET
  id = EXCLUDED.id,
  description = EXCLUDED.description;

-- ========================================
-- 2. ENTITIES (ENTIDADES DO SISTEMA)
-- ========================================
INSERT INTO entities (id, name, description)
VALUES 
  (gen_random_uuid(), 'companies', 'Empresas/Organizações'),
  (gen_random_uuid(), 'users', 'Usuários do sistema'),
  (gen_random_uuid(), 'prospects', 'Prospects/Leads'),
  (gen_random_uuid(), 'documents', 'Documentos financeiros'),
  (gen_random_uuid(), 'subscriptions', 'Assinaturas/Planos'),
  (gen_random_uuid(), 'routines', 'Rotinas operacionais')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description;

-- ========================================
-- 3. ONBOARDING CHECKLIST
-- ========================================
INSERT INTO onboarding_checklist (id, title, week, description, enabled_plans, responsible_department, is_active, display_order, created_at, updated_at)
VALUES 
  (
    '1a7cf650-defc-4420-8be4-c88ee8070617',
    'Reunião de kick-off e alinhamento de expectativas',
    1,
    'Primeira reunião para entender necessidades, estabelecer expectativas e alinhar o processo de trabalho com o cliente',
    ARRAY['controle', 'gerencial', 'avancado'],
    'Customer Success',
    true,
    1,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    '41d25e33-b8e4-43cd-ae2e-cb37cc47d392',
    'Coleta de informações e acessos necessários',
    1,
    'Reunir documentos da empresa, extratos bancários, acessos a sistemas existentes e outras informações necessárias para iniciar o trabalho',
    ARRAY['controle', 'gerencial', 'avancado'],
    'Operador Financeiro',
    true,
    2,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    'fb756e7e-62d7-4908-b882-a14335f066ca',
    'Análise das informações e definição do fluxo operacional',
    1,
    'Análise detalhada da situação financeira atual da empresa e definição dos fluxos de trabalho personalizados',
    ARRAY['controle', 'gerencial', 'avancado'],
    'Analista Financeiro',
    true,
    3,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    '766de2f5-8771-42d2-a948-1de0110d4d71',
    'Configurações das ferramentas e acessos',
    2,
    'Configuração das ferramentas de trabalho, criação de acessos e preparação do ambiente técnico para operação',
    ARRAY['controle', 'gerencial', 'avancado'],
    'Operador Financeiro',
    true,
    1,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    'fd5f0004-0261-4f6f-abc0-33d3b7f51ef7',
    'Mapeamento da situação financeira atual',
    2,
    'Análise completa da situação financeira atual da empresa, identificando pendências e oportunidades de melhoria',
    ARRAY['controle', 'gerencial', 'avancado'],
    'Analista Financeiro',
    true,
    2,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    '7280acf8-1dca-4500-be14-88091efe8a95',
    'Criação do plano de contas personalizado',
    2,
    'Desenvolvimento de um plano de contas específico para a empresa, considerando suas necessidades e características do negócio',
    ARRAY['controle', 'gerencial', 'avancado'],
    'Analista Financeiro',
    true,
    3,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    '99abad38-c6d7-4833-89d9-7611ac08502e',
    'Categorização de despesas e receitas',
    2,
    'Organização e categorização de todas as despesas e receitas da empresa para melhor controle e relatórios',
    ARRAY['controle', 'gerencial', 'avancado'],
    'Operador Financeiro',
    true,
    4,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    '7a8c4c83-2a87-4a53-8b39-f994d0503fe1',
    'Elaboração do budget',
    2,
    'Criação do orçamento anual da empresa com base no histórico e projeções de crescimento',
    ARRAY['gerencial', 'avancado'],
    'Analista Financeiro',
    true,
    5,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    '7b915ae1-6fe5-4abb-ac44-e99f0f7a4ef3',
    'Cadastros das contas bancárias e saldos iniciais',
    2,
    'Cadastro de todas as contas bancárias da empresa e definição dos saldos iniciais para conciliação',
    ARRAY['controle', 'gerencial', 'avancado'],
    'Operador Financeiro',
    true,
    6,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    '28672b63-6343-4cdf-b34b-f678e1073bf1',
    'Cadastro das formas de pagamento e recebimento',
    2,
    'Configuração de todas as formas de pagamento e recebimento utilizadas pela empresa',
    ARRAY['controle', 'gerencial', 'avancado'],
    'Operador Financeiro',
    true,
    7,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    '9c5ce430-8755-4c66-9b31-c421f53cc1b0',
    'Treinamento no app e dashboard',
    2,
    'Treinamento completo do cliente para utilização das ferramentas, app mobile e dashboard web',
    ARRAY['controle', 'gerencial', 'avancado'],
    'Customer Success',
    true,
    8,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    '421e8193-ff67-445b-9ed7-f51265c95cc1',
    'Início da conciliação bancária',
    3,
    'Início do processo diário de conciliação bancária com acompanhamento próximo e ajustes necessários',
    ARRAY['controle', 'gerencial', 'avancado'],
    'Operador Financeiro',
    true,
    1,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    'f06617b1-6c09-4bb1-9937-08e17e750ecb',
    'Início do processo de aprovação de pagamentos',
    3,
    'Implementação do fluxo de aprovação de pagamentos com o cliente, testando e ajustando o processo',
    ARRAY['controle', 'gerencial', 'avancado'],
    'Operador Financeiro',
    true,
    2,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    '59a100f7-de9f-431b-806d-8d837856732e',
    'Ajustes finos nos processos',
    3,
    'Refinamento dos processos implementados baseado na experiência inicial e feedback do cliente',
    ARRAY['controle', 'gerencial', 'avancado'],
    'Customer Success',
    true,
    3,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    'a8ef5431-98dd-40ef-b911-170bc96aaeff',
    'Resolução de pendências identificadas',
    3,
    'Tratamento de todas as pendências financeiras identificadas durante o mapeamento inicial',
    ARRAY['controle', 'gerencial', 'avancado'],
    'Analista Financeiro',
    true,
    4,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    '882d52ee-ace6-4f93-a4e0-bfe9932f7061',
    'Acompanhamento diário próximo',
    3,
    'Acompanhamento intensivo da operação para garantir que todos os processos estejam funcionando corretamente',
    ARRAY['controle', 'gerencial', 'avancado'],
    'Customer Success',
    true,
    5,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    'c8517139-cb90-44ff-8c34-5dd84f8bbe34',
    'Entrega do primeiro relatório gerencial',
    4,
    'Preparação e entrega do primeiro conjunto completo de relatórios gerenciais da empresa',
    ARRAY['gerencial', 'avancado'],
    'Analista Financeiro',
    true,
    1,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    '412312eb-bb37-460f-a6cd-6097d87ff366',
    'Apresentação de DRE e indicadores',
    4,
    'Apresentação detalhada do DRE (Demonstrativo de Resultado do Exercício) e principais indicadores financeiros',
    ARRAY['gerencial', 'avancado'],
    'Analista Financeiro',
    true,
    2,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    'c4957ec8-9652-4743-b7d7-b2a842c0042f',
    'Primeira reunião de consultoria',
    4,
    'Primeira sessão de consultoria mensal com análise estratégica e recomendações para melhoria (plano Avançado)',
    ARRAY['avancado'],
    'Consultor Sênior',
    true,
    3,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  ),
  (
    'a7bdf981-7f12-4a19-8558-4cd4db826312',
    'Transição para operação regular',
    4,
    'Finalização do período de onboarding e transição para a operação regular com todos os processos estabilizados',
    ARRAY['controle', 'gerencial', 'avancado'],
    'Customer Success',
    true,
    4,
    '2025-08-31 22:56:07.657473+00',
    '2025-08-31 22:56:07.657473+00'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  week = EXCLUDED.week,
  description = EXCLUDED.description,
  enabled_plans = EXCLUDED.enabled_plans,
  responsible_department = EXCLUDED.responsible_department,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- ========================================
-- 4. ROUTINES (ROTINAS OPERACIONAIS TEMPLATES)
-- ========================================
INSERT INTO routines (id, name, description, is_active, is_template, instructions, created_at, updated_at)
VALUES 
  (
    '00163adb-328b-44e6-a0e2-d1549574b472',
    'Conciliar Caixinha',
    'Conciliação do caixa pequeno/fundo fixo da empresa para controle de gastos miúdos',
    true,
    true,
    'Verificar saldo físico do caixa, conferir comprovantes e notas fiscais, lançar movimentações no sistema, identificar divergências e regularizar',
    '2025-09-01 13:26:15.738387+00',
    '2025-09-01 13:26:15.738387+00'
  ),
  (
    '0ff1886c-b20a-4df3-b5ff-6731f664aa6f',
    'Conciliar Fatura de Cartão de Crédito',
    'Processo de conciliação das faturas de cartão de crédito com os gastos realizados pela empresa',
    true,
    true,
    'Acessar portal do cartão, baixar fatura detalhada, conferir cada lançamento, classificar despesas por categoria, verificar divergências e aprovar pagamento',
    '2025-09-01 13:26:15.738387+00',
    '2025-09-01 13:26:15.738387+00'
  ),
  (
    '7021cb62-e118-44b7-9ad4-7bcab95b8919',
    'Emitir Boletos',
    'Geração e envio de boletos bancários para cobrança de clientes',
    true,
    true,
    'Acessar sistema de cobrança, gerar boletos das vendas a prazo, verificar dados dos clientes, enviar por email ou correio, registrar envios no sistema',
    '2025-09-01 13:26:15.738387+00',
    '2025-09-01 13:26:15.738387+00'
  ),
  (
    'ab2f7313-5f49-4224-bff1-8c17eb8366e7',
    'Solicitar aprovação de contas a pagar',
    'Processo de encaminhamento das contas a pagar para aprovação do gestor responsável antes do pagamento',
    true,
    true,
    'Revisar contas a pagar pendentes, organizar documentação, encaminhar para aprovação via sistema ou email, aguardar retorno e processar aprovações',
    '2025-09-01 13:26:15.738387+00',
    '2025-09-01 13:26:15.738387+00'
  ),
  (
    'bfb49ae7-6d8e-47ca-8560-efa97b255daa',
    'Enviar Movimentação Financeira para o Contador',
    'Preparação e envio da movimentação financeira mensal para o contador responsável pela contabilidade',
    true,
    true,
    'Gerar relatórios de movimentação financeira do período, organizar documentos fiscais, preparar planilhas auxiliares, enviar via email ou sistema integrado ao contador',
    '2025-09-01 13:26:15.738387+00',
    '2025-09-01 13:26:15.738387+00'
  ),
  (
    'd7dc0a33-36b1-45af-ba92-9c2ff2064b2f',
    'Conciliar Recebimentos',
    'Processo de conciliação dos recebimentos da empresa com as vendas realizadas e contas a receber',
    true,
    true,
    'Verificar recebimentos bancários, cruzar com vendas realizadas, baixar contas a receber, identificar pagamentos não identificados e regularizar pendências',
    '2025-09-01 13:26:15.738387+00',
    '2025-09-01 13:26:15.738387+00'
  ),
  (
    'eb9c32ae-6d0e-4fa2-b54f-ee20a6b99732',
    'Conciliar Banco',
    'Processo diário de conciliação bancária para garantir que os saldos contábeis estejam alinhados com os extratos bancários',
    true,
    true,
    'Acessar o sistema bancário, baixar extratos, comparar com lançamentos contábeis, identificar divergências e fazer os ajustes necessários',
    '2025-09-01 13:26:15.738387+00',
    '2025-09-01 13:26:15.738387+00'
  ),
  (
    'f4f443ce-e50c-410e-9ae6-64d42119a162',
    'Conciliar Pagamentos',
    'Conciliação dos pagamentos realizados com as contas a pagar e ordens de pagamento emitidas',
    true,
    true,
    'Verificar pagamentos efetuados via extrato bancário, cruzar com contas a pagar, baixar obrigações quitadas, identificar pagamentos divergentes e ajustar',
    '2025-09-01 13:26:15.738387+00',
    '2025-09-01 13:26:15.738387+00'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  is_template = EXCLUDED.is_template,
  instructions = EXCLUDED.instructions,
  updated_at = NOW();

-- Verificação
DO $$
BEGIN
    RAISE NOTICE '✅ Dados iniciais (seeds) inseridos com sucesso!';
END;
$$;

COMMIT;