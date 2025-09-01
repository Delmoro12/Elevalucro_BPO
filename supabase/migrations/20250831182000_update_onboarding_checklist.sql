-- Delete existing onboarding checklist records
DELETE FROM onboarding_checklist;

-- Insert new onboarding checklist items based on the onboarding presentation structure
-- Semana 1 - Diagnóstico e Organização
INSERT INTO onboarding_checklist (title, description, week, display_order) VALUES
('Reunião de kick-off e alinhamento de expectativas', 'Primeira reunião para entender necessidades, estabelecer expectativas e alinhar o processo de trabalho com o cliente', 1, 1),
('Coleta de informações e acessos necessários', 'Reunir documentos da empresa, extratos bancários, acessos a sistemas existentes e outras informações necessárias para iniciar o trabalho', 1, 2),
('Análise das informações e definição do fluxo operacional', 'Análise detalhada da situação financeira atual da empresa e definição dos fluxos de trabalho personalizados', 1, 3);

-- Semana 2 - Implementação
INSERT INTO onboarding_checklist (title, description, week, display_order) VALUES
('Configurações das ferramentas e acessos', 'Configuração das ferramentas de trabalho, criação de acessos e preparação do ambiente técnico para operação', 2, 1),
('Mapeamento da situação financeira atual', 'Análise completa da situação financeira atual da empresa, identificando pendências e oportunidades de melhoria', 2, 2),
('Criação do plano de contas personalizado', 'Desenvolvimento de um plano de contas específico para a empresa, considerando suas necessidades e características do negócio', 2, 3),
('Categorização de despesas e receitas', 'Organização e categorização de todas as despesas e receitas da empresa para melhor controle e relatórios', 2, 4),
('Elaboração do budget', 'Criação do orçamento anual da empresa com base no histórico e projeções de crescimento', 2, 5),
('Cadastros das contas bancárias e saldos iniciais', 'Cadastro de todas as contas bancárias da empresa e definição dos saldos iniciais para conciliação', 2, 6),
('Cadastro das formas de pagamento e recebimento', 'Configuração de todas as formas de pagamento e recebimento utilizadas pela empresa', 2, 7),
('Treinamento no app e dashboard', 'Treinamento completo do cliente para utilização das ferramentas, app mobile e dashboard web', 2, 8);

-- Semana 3 - Operação Assistida
INSERT INTO onboarding_checklist (title, description, week, display_order) VALUES
('Início da conciliação bancária', 'Início do processo diário de conciliação bancária com acompanhamento próximo e ajustes necessários', 3, 1),
('Início do processo de aprovação de pagamentos', 'Implementação do fluxo de aprovação de pagamentos com o cliente, testando e ajustando o processo', 3, 2),
('Ajustes finos nos processos', 'Refinamento dos processos implementados baseado na experiência inicial e feedback do cliente', 3, 3),
('Resolução de pendências identificadas', 'Tratamento de todas as pendências financeiras identificadas durante o mapeamento inicial', 3, 4),
('Acompanhamento diário próximo', 'Acompanhamento intensivo da operação para garantir que todos os processos estejam funcionando corretamente', 3, 5);

-- Semana 4 - Operação Plena  
INSERT INTO onboarding_checklist (title, description, week, display_order) VALUES
('Entrega do primeiro relatório gerencial', 'Preparação e entrega do primeiro conjunto completo de relatórios gerenciais da empresa', 4, 1),
('Apresentação de DRE e indicadores', 'Apresentação detalhada do DRE (Demonstrativo de Resultado do Exercício) e principais indicadores financeiros', 4, 2),
('Primeira reunião de consultoria', 'Primeira sessão de consultoria mensal com análise estratégica e recomendações para melhoria (plano Avançado)', 4, 3),
('Transição para operação regular', 'Finalização do período de onboarding e transição para a operação regular com todos os processos estabilizados', 4, 4);