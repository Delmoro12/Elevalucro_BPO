# Requirements Document

## Introduction

Este spec define os padrões e convenções que devem ser seguidos ao criar qualquer nova feature no sistema ElevaLucro BPO. O objetivo é manter consistência arquitetural, facilitar manutenção, e garantir que todas as features sigam os mesmos padrões de organização, tipos, hooks, serviços e componentes.

## Requirements

### Requirement 1

**User Story:** Como desenvolvedor, eu quero que todas as novas features sigam a mesma estrutura de pastas, para que seja fácil navegar e manter o código.

#### Acceptance Criteria

1. WHEN uma nova feature é criada THEN o sistema SHALL criar a estrutura padrão de pastas (components/, hooks/, pages/, services/, types/, utils/)
2. WHEN uma feature é criada THEN o sistema SHALL incluir arquivos index.ts para exports limpos
3. WHEN uma feature pertence ao app de clientes THEN ela SHALL ser criada em src/frontend/elevalucro_bpo_app/
4. WHEN uma feature pertence às ferramentas internas THEN ela SHALL ser criada em src/frontend/internal_tools/
5. WHEN uma feature é compartilhada THEN ela SHALL ter uma pasta shared/ com componentes reutilizáveis

### Requirement 2

**User Story:** Como desenvolvedor, eu quero que todas as features tenham tipos TypeScript consistentes, para que haja type safety e autocomplete em todo o projeto.

#### Acceptance Criteria

1. WHEN uma feature é criada THEN o sistema SHALL gerar tipos base (Entity, CreateRequest, UpdateRequest, ListResponse)
2. WHEN uma feature tem relacionamentos THEN o sistema SHALL definir tipos para as relações (com IDs e objetos populados)
3. WHEN uma feature usa Supabase THEN o sistema SHALL definir tipos compatíveis com as tabelas do banco
4. WHEN uma feature tem formulários THEN o sistema SHALL criar schemas Zod para validação
5. WHEN uma feature tem estados THEN o sistema SHALL definir enums ou union types para os estados possíveis

### Requirement 3

**User Story:** Como desenvolvedor, eu quero que todas as features tenham serviços padronizados para API, para que as chamadas sejam consistentes e reutilizáveis.

#### Acceptance Criteria

1. WHEN uma feature é criada THEN o sistema SHALL criar um service com métodos CRUD padrão (create, read, update, delete, list)
2. WHEN uma feature usa Supabase THEN o serviço SHALL usar o cliente Supabase configurado
3. WHEN uma feature tem relacionamentos THEN o serviço SHALL incluir métodos para carregar relações
4. WHEN uma feature tem filtros THEN o serviço SHALL aceitar parâmetros de filtro tipados
5. WHEN uma feature tem paginação THEN o serviço SHALL retornar metadados de paginação

### Requirement 4

**User Story:** Como desenvolvedor, eu quero que todas as features tenham hooks React consistentes, para que o gerenciamento de estado seja padronizado.

#### Acceptance Criteria

1. WHEN uma feature é criada THEN o sistema SHALL criar hooks para operações CRUD (useCreate, useUpdate, useDelete, useList, useGet)
2. WHEN uma feature tem formulários THEN o sistema SHALL criar hook useForm com validação Zod
3. WHEN uma feature tem estados de loading THEN os hooks SHALL gerenciar loading, error, e success states
4. WHEN uma feature usa cache THEN os hooks SHALL implementar invalidação de cache apropriada
5. WHEN uma feature tem permissões THEN os hooks SHALL verificar roles do usuário

### Requirement 5

**User Story:** Como desenvolvedor, eu quero que todas as features tenham componentes base consistentes, para que a UI seja uniforme e reutilizável.

#### Acceptance Criteria

1. WHEN uma feature é criada THEN o sistema SHALL criar componentes base (List, Form, Detail, Card)
2. WHEN uma feature tem tabelas THEN o sistema SHALL usar DataTable com sorting, filtering, e pagination
3. WHEN uma feature tem formulários THEN o sistema SHALL usar componentes shadcn/ui com validação
4. WHEN uma feature tem modais THEN o sistema SHALL usar Dialog do Radix UI
5. WHEN uma feature tem estados de loading THEN o sistema SHALL usar Skeleton components

### Requirement 6

**User Story:** Como desenvolvedor, eu quero que todas as features respeitem as permissões por role, para que a segurança seja mantida consistentemente.

#### Acceptance Criteria

1. WHEN uma feature é acessada THEN o sistema SHALL verificar se o usuário tem a role apropriada (client_side ou bpo_side)
2. WHEN uma feature é do app de clientes THEN ela SHALL ser acessível apenas por users com role client_side
3. WHEN uma feature é das ferramentas internas THEN ela SHALL ser acessível apenas por users com role bpo_side
4. WHEN uma feature tem ações sensíveis THEN o sistema SHALL verificar permissões específicas
5. WHEN um usuário não tem permissão THEN o sistema SHALL mostrar erro 403 ou redirecionar

### Requirement 7

**User Story:** Como desenvolvedor, eu quero que todas as features tenham roteamento consistente, para que a navegação siga os padrões do projeto.

#### Acceptance Criteria

1. WHEN uma feature é criada THEN o sistema SHALL criar rotas no App Router seguindo a convenção de grupos
2. WHEN uma feature é do app de clientes THEN as rotas SHALL estar no grupo (elevalucro_bpo_app)
3. WHEN uma feature é das ferramentas internas THEN as rotas SHALL estar no grupo (internal_tools)
4. WHEN uma feature tem páginas dinâmicas THEN o sistema SHALL usar [id] para rotas dinâmicas
5. WHEN uma feature tem sub-rotas THEN o sistema SHALL organizar em subpastas apropriadas

### Requirement 8

**User Story:** Como desenvolvedor, eu quero que todas as features tenham tratamento de erro padronizado, para que a experiência do usuário seja consistente.

#### Acceptance Criteria

1. WHEN uma feature encontra erro THEN o sistema SHALL usar toast notifications para feedback
2. WHEN uma feature falha no carregamento THEN o sistema SHALL mostrar error boundary apropriado
3. WHEN uma feature tem validação THEN o sistema SHALL mostrar erros de campo específicos
4. WHEN uma feature tem erro de rede THEN o sistema SHALL permitir retry da operação
5. WHEN uma feature tem erro de permissão THEN o sistema SHALL redirecionar ou mostrar mensagem apropriada

### Requirement 9

**User Story:** Como desenvolvedor, eu quero que todas as features tenham testes básicos, para que a qualidade do código seja mantida.

#### Acceptance Criteria

1. WHEN uma feature é criada THEN o sistema SHALL criar testes unitários para services
2. WHEN uma feature tem hooks THEN o sistema SHALL criar testes para os hooks customizados
3. WHEN uma feature tem componentes THEN o sistema SHALL criar testes de renderização básicos
4. WHEN uma feature tem formulários THEN o sistema SHALL testar validação e submissão
5. WHEN uma feature tem integração THEN o sistema SHALL criar testes de integração com mocks

### Requirement 10

**User Story:** Como desenvolvedor, eu quero que todas as features detectem automaticamente o ambiente (local/produção), para que não haja erros de configuração entre ambientes.

#### Acceptance Criteria

1. WHEN uma feature é criada THEN o sistema SHALL detectar automaticamente se está em ambiente local ou produção
2. WHEN o ambiente é detectado THEN o sistema SHALL usar as configurações corretas de banco de dados
3. WHEN uma feature usa Supabase THEN ela SHALL conectar automaticamente no banco correto baseado no ambiente
4. WHEN há mudança de ambiente THEN o sistema SHALL validar as configurações na inicialização
5. WHEN uma feature tem configurações específicas por ambiente THEN o sistema SHALL aplicar as corretas automaticamente

### Requirement 11

**User Story:** Como desenvolvedor, eu quero que todas as features tenham documentação básica, para que outros desenvolvedores possam entender e contribuir.

#### Acceptance Criteria

1. WHEN uma feature é criada THEN o sistema SHALL criar README.md explicando a feature
2. WHEN uma feature tem componentes complexos THEN o sistema SHALL documentar props e usage
3. WHEN uma feature tem hooks THEN o sistema SHALL documentar parâmetros e retorno
4. WHEN uma feature tem serviços THEN o sistema SHALL documentar métodos e tipos
5. WHEN uma feature tem configurações THEN o sistema SHALL documentar variáveis de ambiente necessárias