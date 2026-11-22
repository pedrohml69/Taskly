# Tasks: Kanban Fixo e Ajustes na Navbar

**Input**: `spec.md` e `plan.md` da Spec 007

**Feature**: Transformar o Board atual em um Kanban fixo por projeto e ajustar somente o indicador da navbar.

**Critério obrigatório**: preservar integralmente o design visual original do Taskly.

## Fase 1 - Preparação e estrutura do Kanban

- [x] T001 [P] Documentar no plano de implementação os IDs reservados `kanban-fazer`, `kanban-fazendo`, `kanban-feito` e `kanban-revisar`, seus nomes, ordens e cores.
- [x] T002 Refatorar `src/scripts/board.js` para separar a estrutura fixa do Kanban da lógica genérica de criação de quadros.
- [x] T003 Adaptar `src/scripts/board.js` para garantir os três documentos fixos em todo projeto selecionado, sem alterar colunas já existentes ou suas tarefas.
- [x] T004 Adaptar `src/scripts/board.js` para filtrar a renderização e ignorar todos os documentos de quadros antigos que não sejam IDs reservados do Kanban.
- [x] T005 [P] Remover ou desabilitar na interface os fluxos de criação, renomeação e exclusão de quadros personalizados.
- [x] T006 Implementar em `src/scripts/board.js` a adição de `kanban-revisar` pelo controle existente `#addProject`, criando somente uma vez por projeto.
- [x] T007 Implementar em `src/scripts/board.js` a remoção de `kanban-revisar` após confirmação, excluindo o documento e todas as tarefas contidas nele.
- [x] T008 Garantir que a interface não permita renomear ou remover Fazer, Fazendo e Feito e que suas tarefas permaneçam intactas.

**Dependências**: T002 depende de T001; T003 depende de T002; T004 depende de T002; T005 depende de T002; T006 depende de T003 e T005; T007 depende de T006; T008 depende de T003.

## Fase 2 - Persistência no Firestore

- [x] T009 Preservar o caminho Firestore `users/{uid}/projects/{projectId}/boards/{boardId}` e associar todas as operações ao UID da sessão.
- [x] T010 [P] Garantir em `src/scripts/board.js` a criação idempotente das três colunas fixas por projeto usando transação Firestore.
- [x] T011 Adaptar a criação de tarefas existentes para atualizar o array `itens` da coluna selecionada no Firestore antes de confirmar a apresentação.
- [x] T012 Adaptar a exclusão de tarefas existentes para remover somente a ocorrência selecionada no array `itens`, preservando itens duplicados e sua ordem.
- [x] T013 Adaptar o movimento por arrastar e soltar para remover uma tarefa da coluna de origem e adicioná-la à coluna de destino por transação Firestore.
- [x] T014 Confirmar que respostas assíncronas de uma seleção anterior não alteram o projeto ou o Kanban atualmente ativo.
- [x] T015 Atualizar `firestore.rules` para validar o modelo de colunas reservado sem modificar as regras de perfil e da coleção de tarefas do Dashboard.
- [x] T016 Restringir em `firestore.rules` renomeação, mudança de ordem ou mudança de cor das três colunas fixas.
- [x] T017 Permitir em `firestore.rules` a criação e exclusão somente controlada de Revisar e negar exclusão das três colunas fixas.
- [x] T018 [P] Preservar os projetos existentes e a persistência de `users/{uid}/tasks/{taskId}` sem migração ou alteração.
- [x] T019 Implementar a estratégia para ignorar documentos antigos de quadros personalizados sem ler, copiar, migrar ou apagar esses documentos.

**Dependências**: T010 depende de T003 e T009; T011 depende de T010; T012 depende de T010 e T011; T013 depende de T010 e T012; T014 depende de T003 e T013; T015 depende de T001 e T009; T016 depende de T015; T017 depende de T015; T018 pode ser executado em paralelo após T009; T019 depende de T004 e T009.

## Fase 3 - Interface do Board

- [x] T020 Reutilizar `.board-card`, `.board-items`, `.board-item`, `.add-card` e as classes `quadro-azul`, `quadro-amarelo` e `quadro-vermelho` existentes.
- [x] T021 Adaptar `src/scripts/board.js` para renderizar somente as três colunas obrigatórias e Revisar quando existir.
- [x] T022 Adaptar o controle `#addProject` para funcionar como adição de Revisar, mantendo o visual e o padrão atual do botão.
- [x] T023 Ocultar ou desativar o controle de adicionar Revisar enquanto a coluna estiver presente.
- [x] T024 Reutilizar o controle existente de exclusão somente para remover Revisar, com confirmação antes da ação.
- [x] T025 Remover da interface os controles de exclusão e edição de título das colunas obrigatórias.
- [x] T026 [P] Fazer ajustes mínimos em `src/styles/css/board.css` somente quando necessário para apresentar os estados fixos sem alterar cores, tipografia, bordas, sombras, espaçamentos ou responsividade.
- [x] T027 Garantir que estados vazios, tarefas, arrastar e soltar e a responsividade existente sejam preservados no novo Kanban.
- [x] T028 Não modificar o modal de projetos, o cabeçalho do projeto, o perfil, o logout ou o modo noturno além do mínimo necessário ao novo fluxo.

**Dependências**: T021 depende de T003 e T004; T022 depende de T006 e T021; T023 depende de T007 e T022; T024 depende de T007 e T021; T025 depende de T008 e T021; T026 depende de T020 e T021; T027 depende de T020 a T026; T028 deve acompanhar T021 sem depender de alterações fora do Board.

## Fase 4 - Ajuste da navbar

- [x] T029 Ajustar exclusivamente `.links a::before` em `src/styles/css/nav-mod.css` para envolver verticalmente todo o texto da opção ativa.
- [x] T030 Preservar largura, cor `var(--tab-active)`, raio, centralização horizontal e alinhamento horizontal atuais do indicador.
- [x] T031 Não alterar `nav`, sua altura geral, padding, links, logo, perfil ou o comportamento responsivo existente.
- [x] T032 Alinhar ou remover a duplicação da regra `.links a::before` em `src/styles/css/board.css`, mantendo `nav-mod.css` como padrão compartilhado.
- [x] T033 [P] Manter oculto o indicador móvel no breakpoint existente e preservar o menu responsivo.

**Dependências**: T029 pode iniciar em paralelo à implementação do Board; T030 depende de T029; T031 depende de T029; T032 depende de T029; T033 depende de T029.

## Fase 5 - Testes e validação

- [ ] T034 Criar um projeto novo e verificar a criação das três colunas obrigatórias vazias.
- [ ] T035 Recarregar a página e verificar que Fazer, Fazendo e Feito permanecem fixos e suas tarefas persistem.
- [ ] T036 Testar criação e exclusão de tarefas em cada coluna, incluindo nomes duplicados.
- [ ] T037 Testar movimentação de tarefas entre todas as combinações possíveis das colunas obrigatórias.
- [ ] T038 Testar adição de Revisar e confirmar que ela pode existir somente uma vez por projeto.
- [ ] T039 Testar remoção cancelada e remoção confirmada de Revisar, incluindo exclusão das tarefas nela existentes.
- [ ] T040 Atualizar a página após adicionar, remover ou mover tarefas e verificar a persistência completa.
- [ ] T041 Verificar que cada projeto possui seu próprio conjunto de colunas e tarefas.
- [ ] T042 Criar documentos antigos personalizados em ambiente de teste e confirmar que eles não aparecem no novo Kanban e não são alterados.
- [ ] T043 Confirmar que os projetos existentes não são removidos ou modificados pelo novo modelo.
- [ ] T044 Testar no navegador uma conta sem projeto e confirmar a criação única de `Projeto 001` com apenas o Kanban vazio.
- [ ] T045 Testar duas contas e confirmar isolamento por UID em projetos e colunas.
- [ ] T046 Testar acesso cruzado, acesso sem autenticação e tentativas de excluir ou alterar colunas fixas diretamente no Firestore.
- [ ] T047 Confirmar que as tarefas de `users/{uid}/tasks` no Dashboard continuam criadas, atualizadas e exibidas corretamente.
- [ ] T048 Comparar o Board e o restante das páginas em modo claro e escuro antes e depois da implementação.
- [ ] T049 Validar desktop, tablet e celular, conferindo layout, responsividade e preservação dos componentes originais.
- [ ] T050 Validar em Dashboard e Board que o indicador ativo cobre completamente o texto selecionado sem alterar a altura da navbar.
- [ ] T051 Validar que não houve redesign em telas fora do escopo e que nenhuma página perdeu funcionalidade existente.

**Dependências**: T034 depende de T010 e T021; T035 depende de T034 e T013; T036 depende de T011 e T012; T037 depende de T013 e T036; T038 depende de T006 e T022; T039 depende de T007 e T038; T040 depende de T011 a T013 e T038; T041 depende de T003 e T009; T042 depende de T004 e T019; T043 depende de T009 e T018; T044 depende de T003 e T010; T045 depende de T015 a T017; T046 depende de T015 a T017; T047 depende de T018; T048 depende de T020 a T032; T049 depende de T020 a T033; T050 depende de T029 a T033; T051 depende de todas as fases.

## Execução paralela sugerida

Depois da preparação inicial:

- Estrutura do Board: T002–T008.
- Persistência e regras: T009–T019 podem avançar em paralelo após T001/T002.
- Interface reutilizando CSS existente: T020–T028 pode avançar em paralelo à implementação da navbar.
- Navbar: T029–T033 pode avançar independentemente do Board.
- Validação: iniciar testes de regras e dados após T015–T017; iniciar testes visuais após T020–T033.

## Status da validação

Execuções disponíveis neste ambiente:

- `node --check` validou a sintaxe de `src/scripts/board.js` e `src/scripts/dashboard.js`.
- Uma prévia HTTP local do workspace foi iniciada com Node e respondeu `200 OK` para `board.html` e `nav-mod.css`.
- Não há Emulator Suite configurado nem sessão Firebase autenticada disponível para executar a matriz manual de Firestore e os cenários visuais de navegador.
- Os testes T034–T051 dependem de ambiente Firebase autenticado e validação manual no navegador, portanto permanecem pendentes até serem executados pelo responsável pelo aplicativo.
