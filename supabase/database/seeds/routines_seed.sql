-- Seed data for routines table
-- Generated from local Supabase database

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
  updated_at = now();