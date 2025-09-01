-- ======================================
-- Seed Data for Onboarding and Routines
-- ======================================
-- Popula as tabelas com dados iniciais

-- 1. Popular onboarding_checklist
INSERT INTO onboarding_checklist (title, description, week, display_order, is_active) VALUES 
('Configurar conta bancária', 'Vincular conta bancária principal da empresa ao sistema', 1, 1, true),
('Enviar documentos fiscais', 'Enviar contrato social, cartão CNPJ e documentos necessários', 1, 2, true),
('Configurar categorias de despesas', 'Definir categorias e centros de custos da empresa', 1, 3, true),
('Primeiro acesso ao sistema', 'Realizar primeiro acesso e configurar senha', 1, 4, true),

('Importar plano de contas', 'Importar ou configurar plano de contas contábil', 2, 1, true),
('Cadastrar fornecedores principais', 'Cadastrar os 10 principais fornecedores', 2, 2, true),
('Cadastrar clientes principais', 'Cadastrar os 10 principais clientes', 2, 3, true),
('Configurar integrações bancárias', 'Conectar APIs bancárias para conciliação automática', 2, 4, true),

('Primeira conciliação bancária', 'Realizar primeira conciliação bancária do mês', 3, 1, true),
('Lançar contas a pagar', 'Lançar todas as contas a pagar do mês', 3, 2, true),
('Lançar contas a receber', 'Lançar todas as contas a receber do mês', 3, 3, true),
('Gerar primeiro relatório', 'Gerar e revisar primeiro DRE', 3, 4, true),

('Reunião de alinhamento', 'Reunião com consultor BPO para alinhamento', 4, 1, true),
('Aprovar fluxo de trabalho', 'Aprovar e validar fluxo de trabalho estabelecido', 4, 2, true),
('Treinar equipe interna', 'Treinar colaboradores no uso do sistema', 4, 3, true),
('Finalizar onboarding', 'Revisar e concluir processo de onboarding', 4, 4, true)
ON CONFLICT DO NOTHING;

-- 2. Popular routines
INSERT INTO routines (name, description, category, frequency, priority, is_active, is_template) VALUES 
-- Rotinas Financeiras
('Conciliação bancária', 'Conciliar extratos bancários com lançamentos do sistema', 'financeiro', 'daily', 'high', true, true),
('Lançamento de contas a pagar', 'Registrar todas as contas a pagar', 'financeiro', 'daily', 'high', true, true),
('Lançamento de contas a receber', 'Registrar todas as contas a receber', 'financeiro', 'daily', 'high', true, true),
('Cobrança de inadimplentes', 'Realizar cobrança de clientes em atraso', 'financeiro', 'weekly', 'medium', true, true),
('Fechamento de caixa', 'Fechar e conferir caixa do dia', 'financeiro', 'daily', 'medium', true, true),

-- Rotinas Fiscais
('Emissão de notas fiscais', 'Emitir NFs de vendas e serviços', 'fiscal', 'daily', 'high', true, true),
('Organização de documentos fiscais', 'Organizar e arquivar documentos fiscais', 'fiscal', 'weekly', 'medium', true, true),
('Apuração de impostos', 'Calcular impostos a pagar', 'fiscal', 'monthly', 'high', true, true),
('Envio de obrigações acessórias', 'Enviar SPED, DCTF, etc', 'fiscal', 'monthly', 'high', true, true),

-- Rotinas Operacionais
('Backup de dados', 'Realizar backup dos dados da empresa', 'operacional', 'daily', 'critical', true, true),
('Relatório gerencial mensal', 'Gerar DRE e indicadores do mês', 'operacional', 'monthly', 'high', true, true),
('Fluxo de caixa projetado', 'Atualizar projeção de fluxo de caixa', 'operacional', 'weekly', 'medium', true, true),
('Análise de inadimplência', 'Analisar índices de inadimplência', 'operacional', 'monthly', 'medium', true, true),

-- Rotinas de Compliance
('Conferência de contratos', 'Revisar contratos vigentes', 'compliance', 'monthly', 'low', true, true),
('Atualização cadastral', 'Atualizar dados cadastrais de clientes/fornecedores', 'compliance', 'quarterly', 'low', true, true),
('Revisão de processos', 'Revisar e otimizar processos internos', 'compliance', 'quarterly', 'medium', true, true)
ON CONFLICT DO NOTHING;

-- Log de conclusão
DO $$ 
BEGIN 
  RAISE NOTICE 'Seed data inserted successfully for onboarding_checklist and routines tables';
END $$;