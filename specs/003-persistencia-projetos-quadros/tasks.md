# Tasks: Persistência de Projetos e Quadros

**Input**: Documentos de design em `/specs/003-persistencia-projetos-quadros/`
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/firestore-projects.md`, `quickstart.md`

**Feature**: Persistir projetos, quadros e seus itens sob o UID autenticado, mantendo a tela de board e os fluxos atuais.

## Escopo

Esta feature cobre lista/seleção/criação/renomeação de projetos, o contêiner automático único `Projeto 001`, criação/renomeação/exclusão de quadros e inclusão/exclusão de itens textuais, com isolamento Firestore por usuário. Os três projetos de exemplo não são semeados.

Não cobre novas telas, redesign, tarefas do dashboard, exclusão de projetos, preferências, colaboração ou alterações de autenticação.

## Phase 1: Regras e Contrato de Acesso

- [x] T001 Adicionar em `firestore.rules` regras explícitas para `users/{uid}/projects/{projectId}` e `users/{uid}/projects/{projectId}/boards/{boardId}`, permitindo operações somente ao UID autenticado do caminho, validando schemas/tipos, negando exclusão de projetos, permitindo exclusão de quadros somente no projeto próprio e verificando a existência do projeto pai; preservar regras existentes de perfil, tarefas e negação geral.

## Phase 2: História 1 - Listar, Selecionar e Restaurar Projetos (P1)

**Objetivo**: A pessoa vê somente seus projetos e ao selecionar um projeto vê os quadros associados.
**Teste independente**: Sessão autenticada carrega projetos próprios, seleciona projeto e restaura a seleção após recarregar.

- [x] T002 [US1] Converter a inclusão de `board.js` em `src/pages/board.html` para `type="module"`; importar `auth`, `db` e APIs Firebase necessárias em `src/scripts/board.js`; obter por seletores os elementos criados por `nav-mod.js` e observar a sessão via `onAuthStateChanged` antes de ler ou gravar.
- [x] T003 [US1] Consultar `users/{uid}/projects`, mapear IDs de documento e ordenar por `ordem`; quando vazio, criar uma única vez por transação `project-001` (`Projeto 001`, descrição vazia, ordem 0) e selecioná-lo, sem criar os três projetos de exemplo.
- [x] T004 [US1] Renderizar a lista no modal existente com os projetos carregados; persistir/restaurar seleção local por `projectId`, validar o ID contra os projetos do UID atual e migrar `taskly-project-name` legado por correspondência de nome sem usá-lo para autorização.
- [x] T005 [US1] Ao selecionar projeto no modal, fechar o modal existente, atualizar `projectName` e carregar somente seus quadros; descartar respostas assíncronas de seleções anteriores e apresentar lista vazia quando não houver quadros.
- [ ] T006 [US1] Validar no navegador que uma conta sem projetos recebe somente `Projeto 001`, sem duplicação após recarga, que o projeto fica selecionado e que se pode criar nele um quadro persistente.

## Phase 3: História 2 - Criar e Renomear Projetos (P1)

**Objetivo**: Criar e renomear projetos pelo fluxo atual e manter os dados depois de retornar.
**Teste independente**: Criar projeto pelo prompt e editar o nome no campo atual; ambos reaparecem na lista e após recarregar.

- [x] T007 [US2] Persistir criação do projeto pelo prompt existente em `board.js`, mantendo `descricao: "Novo projeto"`, atribuindo ID Firestore e ordem, selecionando após sucesso e atualizando modal/cabeçalho; em falha preservar estado anterior e informar o usuário.
- [x] T008 [US2] Persistir a alteração de `projectName` no documento do projeto ativo e atualizar o objeto usado pela lista após sucesso; restaurar nome anterior e informar falha se a gravação não ocorrer.
- [ ] T009 [US2] Validar criação/renomeação após recarga, descrição, ordem e nome exibido no cabeçalho e no modal, incluindo caminho de falha de escrita.

## Phase 4: História 3 - Persistir Quadros e Itens (P1)

**Objetivo**: Os cartões e seus itens permanecem no projeto correto com título, cor e ordem atuais.
**Teste independente**: Criar e renomear quadro, adicionar/remover itens e quadro, recarregar e comparar com a mesma seleção.

- [x] T010 [US3] Implementar leitura/renderização da subcoleção de quadros do projeto ativo em `board.js`, ordenando por `ordem` e restaurando título, classe de cor e itens; renderizar dados persistidos como texto seguro e descartar leituras obsoletas após troca de projeto.
- [x] T011 [US3] Persistir criação de quadro no projeto ativo com ID estável, título do prompt, próxima ordem, próxima cor azul/amarelo/vermelho e `itens: []`; confirmar visualmente somente após sucesso.
- [x] T012 [US3] Persistir renomeação do título do quadro pelo evento do input existente; em falha restaurar o título persistido e informar o usuário.
- [x] T013 [US3] Persistir inclusão de item textual pelo prompt e exclusão da ocorrência clicada, mantendo ordem e itens de mesmo nome; confirmar alteração local somente após Firestore concluir.
- [x] T014 [US3] Persistir exclusão do quadro pelo controle existente e remover o cartão local somente após sucesso; manter demais quadros e itens intactos.
- [ ] T015 [US3] Validar criação, renomeação, exclusão, ordem e cores dos quadros após recarga, além de inclusão/remoção de itens duplicados e estado vazio.

## Phase 5: História 4 - Isolar Dados por Usuário (P1)

**Objetivo**: Regras do banco impedem leitura ou escrita entre contas, independentemente do filtro do cliente.
**Teste independente**: Duas contas e operações diretas a caminhos próprios/alheios e sem autenticação.

- [ ] T016 [US4] Validar regras Firestore com duas contas: permitir operações previstas no próprio caminho; negar leitura/criação/alteração/exclusão sob outro UID; negar todas as operações sem autenticação; negar exclusão de projeto até para o proprietário; verificar que quadros exigem projeto pai do mesmo UID.

## Phase 6: Regressão e Revisão

- [ ] T017 Confirmar que navbar, modal de projetos, prompts, campo do cabeçalho, cartões, perfil, logout e modo noturno continuam funcionando sem mudanças de layout/CSS; confirmar que tarefas do dashboard permanecem inalteradas.
- [x] T018 Revisar os arquivos alterados para confirmar que a autorização depende do UID da sessão e das Security Rules, não de `localStorage` ou campos fornecidos pela UI; confirmar ausência de credenciais, dependências ou mudanças fora do escopo.

## Dependências e Ordem

- T001 precede validação das operações Firestore e T016.
- T002 precede T003 a T005 e todas as operações que usam a sessão/SDK.
- T003 precede T004 a T008; seleção validada é necessária para as operações do projeto ativo.
- T005 precede T010 a T015, pois define o projeto cujo conjunto de quadros é carregado.
- T006 depende de T002 a T005; T009 depende de T007 e T008; T015 depende de T010 a T014.
- T016 depende de T001; T017 e T018 são verificações finais.

## Observações de Validação

Não foi identificado runner de testes ou configuração do Emulator Suite no workspace. Validar manualmente no navegador e executar a matriz de regras em ambiente Firebase de desenvolvimento; se o Emulator Suite for configurado, usá-lo para verificar permissões sem acessar dados remotos.
