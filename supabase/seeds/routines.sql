-- Seed data for routines table
-- Contains the standard routine tasks for companies

INSERT INTO routines (
    name, description, is_active, is_template, instructions
) VALUES

-- Routine 1: Conciliar Banco
('Conciliar Banco',
 'Processo diário de conciliação bancária para garantir que os saldos contábeis estejam alinhados com os extratos bancários',
 true,
 true,
 'Acessar o sistema bancário, baixar extratos, comparar com lançamentos contábeis, identificar divergências e fazer os ajustes necessários'),

-- Routine 2: Solicitar aprovação de contas a pagar
('Solicitar aprovação de contas a pagar',
 'Processo de encaminhamento das contas a pagar para aprovação do gestor responsável antes do pagamento',
 true,
 true,
 'Revisar contas a pagar pendentes, organizar documentação, encaminhar para aprovação via sistema ou email, aguardar retorno e processar aprovações'),

-- Routine 3: Conciliar Caixinha
('Conciliar Caixinha',
 'Conciliação do caixa pequeno/fundo fixo da empresa para controle de gastos miúdos',
 true,
 true,
 'Verificar saldo físico do caixa, conferir comprovantes e notas fiscais, lançar movimentações no sistema, identificar divergências e regularizar'),

-- Routine 4: Conciliar Recebimentos
('Conciliar Recebimentos',
 'Processo de conciliação dos recebimentos da empresa com as vendas realizadas e contas a receber',
 true,
 true,
 'Verificar recebimentos bancários, cruzar com vendas realizadas, baixar contas a receber, identificar pagamentos não identificados e regularizar pendências'),

-- Routine 5: Conciliar Pagamentos
('Conciliar Pagamentos',
 'Conciliação dos pagamentos realizados com as contas a pagar e ordens de pagamento emitidas',
 true,
 true,
 'Verificar pagamentos efetuados via extrato bancário, cruzar com contas a pagar, baixar obrigações quitadas, identificar pagamentos divergentes e ajustar'),

-- Routine 6: Conciliar Fatura de Cartão de Crédito
('Conciliar Fatura de Cartão de Crédito',
 'Processo de conciliação das faturas de cartão de crédito com os gastos realizados pela empresa',
 true,
 true,
 'Acessar portal do cartão, baixar fatura detalhada, conferir cada lançamento, classificar despesas por categoria, verificar divergências e aprovar pagamento'),

-- Routine 7: Emitir Boletos
('Emitir Boletos',
 'Geração e envio de boletos bancários para cobrança de clientes',
 true,
 true,
 'Acessar sistema de cobrança, gerar boletos das vendas a prazo, verificar dados dos clientes, enviar por email ou correio, registrar envios no sistema'),

-- Routine 8: Enviar Movimentação Financeira para o Contador
('Enviar Movimentação Financeira para o Contador',
 'Preparação e envio da movimentação financeira mensal para o contador responsável pela contabilidade',
 true,
 true,
 'Gerar relatórios de movimentação financeira do período, organizar documentos fiscais, preparar planilhas auxiliares, enviar via email ou sistema integrado ao contador');

-- Create indexes for better performance (if not already created by migration)
CREATE INDEX IF NOT EXISTS idx_routines_name ON routines(name);
CREATE INDEX IF NOT EXISTS idx_routines_is_active ON routines(is_active);
CREATE INDEX IF NOT EXISTS idx_routines_is_template ON routines(is_template);
CREATE INDEX IF NOT EXISTS idx_routines_created_at ON routines(created_at);