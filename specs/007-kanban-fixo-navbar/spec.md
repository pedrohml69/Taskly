# Feature Specification: Kanban Fixo e Ajustes na Navbar

**Feature Branch**: `007-kanban-fixo-navbar`

**Status**: Ready for Planning

**Input**: Transformar o Board em Kanban fixo sem redesenhar a interface atual e ajustar exclusivamente o indicador da opção ativa da navbar.

## Objetivo

Substituir a criação e edição livre de quadros personalizados por um Kanban por projeto, reutilizando integralmente os componentes, estilos, cores e interações existentes do Taskly.

Os dados antigos dos quadros personalizados não serão migrados nem reaproveitados pelo novo Kanban. Projetos existentes e tarefas do Dashboard continuarão intactos.

## Histórias de usuário

### História 1 - Kanban fixo por projeto

Cada projeto deve apresentar as colunas obrigatórias **Fazer**, **Fazendo** e **Feito**. Seus nomes e existência não podem ser alterados pelo usuário.

Cada projeto pode ainda apresentar uma quarta coluna opcional chamada **Revisar**, que pode ser adicionada e removida.

Ao remover **Revisar**, o usuário deve confirmar a ação. Confirmada a remoção, a coluna e todas as tarefas nela contidas serão excluídas.

### História 2 - Tarefas do Kanban

O usuário deve continuar criando e removendo tarefas nos componentes já existentes do Board. Uma tarefa pode ser movida entre colunas, inclusive pela interação de arrastar e soltar já preparada no frontend.

Cada movimentação e alteração deve persistir no Firestore e permanecer após recarregar.

### História 3 - Preservação visual

O Board deve manter o visual atual: componentes, cores, tipografia, espaçamento, bordas, sombras, tamanhos e responsividade existentes. Nenhum redesign ou substituição de componentes é permitido.

### História 4 - Navbar

Somente o indicador da página ativa deve ser ajustado para envolver completamente o texto selecionado, de cima até embaixo, com espaçamento adequado. A altura da navbar e os demais elementos não devem ser alterados.

## Requisitos funcionais

- **FR-001**: O sistema DEVE manter no mínimo Fazer, Fazendo e Feito em todo projeto.
- **FR-002**: Os nomes e a existência das três colunas obrigatórias não podem ser editados ou removidos.
- **FR-003**: O usuário DEVE poder adicionar Revisar uma única vez por projeto.
- **FR-004**: O usuário DEVE poder remover Revisar após confirmação explícita.
- **FR-005**: A remoção confirmada de Revisar DEVE excluir a coluna e suas tarefas.
- **FR-006**: Tarefas DEVEM ser armazenadas por projeto e coluna no Firestore.
- **FR-007**: Movimentações entre colunas DEVEM persistir a alteração.
- **FR-008**: Quadros personalizados antigos não DEVEM ser consultados, exibidos ou migrados pelo novo Kanban.
- **FR-009**: Projetos existentes e tarefas de `users/{uid}/tasks` não podem ser alterados.
- **FR-010**: Somente o UID proprietário pode acessar os dados do projeto e de suas colunas.
- **FR-011**: O indicador ativo da navbar DEVE cobrir todo o texto, preservando cor, forma e comportamento responsivo.

## Fora de escopo

- Migração ou limpeza automática de dados antigos dos quadros.
- Integração das tarefas do Kanban com a coleção de tarefas do Dashboard.
- Redesenho de páginas, componentes ou estilos.
- Alterações em autenticação, perfil, logout ou modo noturno.
