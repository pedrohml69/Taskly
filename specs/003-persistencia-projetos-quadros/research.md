# Research: Persistência de Projetos e Quadros

## Decisões

### 1. Caminho e isolamento

**Decisão:** Usar `users/{uid}/projects/{projectId}/boards/{boardId}`.

**Justificativa:** O caminho representa a relação usuário → projeto → quadros e permite verificar propriedade pelo UID autenticado sem confiar em campo `userId` do cliente. Também facilita carregar apenas quadros do projeto selecionado.

**Alternativas consideradas:** Coleções globais `projects/{projectId}` e `boards/{boardId}` com filtros por `userId`; rejeitadas porque exigem validação de propriedade em campos de dados e ampliam o risco de consultas não filtradas.

### 2. Campos do projeto

**Decisão:** Persistir `nome`, `descricao` e `ordem`.

**Justificativa:** `nome` e `descricao` são os campos efetivamente apresentados por `board.js`; `ordem` preserva a sequência da lista fixa e dos projetos criados. Não persistir `status` de modelos genéricos anteriores, pois a tela não o utiliza.

### 3. Campos do quadro e itens

**Decisão:** Persistir `nome`, `ordem`, `cor` e array ordenado `itens` de strings no documento do quadro.

**Justificativa:** O código atual cria cartões com título, ordem de inserção e classes de cor cíclica; cada cartão mantém textos simples que podem ser adicionados ou removidos. O array preserva exatamente o tipo de conteúdo atual, sem inventar status ou tarefa.

**Alternativa considerada:** Subcoleção de documentos por item. Não escolhida porque os itens não têm identidade/campos próprios na interface atual; o array permite substituir o conteúdo do quadro em uma operação. A remoção deve ser pela ocorrência clicada para permitir nomes duplicados.

### 4. Identidade e projeto-contêiner inicial

**Decisão:** Usar IDs Firestore como identificadores estáveis e, quando a coleção estiver vazia, criar somente `project-001` com o nome neutro `Projeto 001`, descrição vazia e ordem zero.

**Justificativa:** A tela de quadros precisa de um projeto ativo para que o botão de adicionar quadro funcione. Um único contêiner vazio fornece esse contexto sem carregar os três projetos de exemplo. O ID determinístico e uma transação evitam duplicação entre abas.

### 5. Estado do projeto selecionado

**Decisão:** Manter a seleção como estado de navegação local, guardando `projectId` após a primeira seleção. Ler o valor legado `taskly-project-name` apenas para localizar um projeto carregado do UID atual e migrar a preferência para o ID.

**Justificativa:** O código existente já guarda a seleção em `localStorage`; ela não é configuração nem dado de autorização. O ID é menos ambíguo que o nome, e a validação contra a coleção da conta evita reutilizar seleção de outra conta.

### 6. Integração do Firebase SDK

**Decisão:** Carregar `board.js` como módulo ES e importar as funções Firestore e Authentication dos módulos/URLs já usados. Usar seletores DOM explícitos para elementos da navbar quando a visibilidade depender de nomes globais criados pelo script clássico.

**Justificativa:** `firebase-config.js` já exporta `auth`/`db` como módulos. `board.js` é atualmente clássico e não consegue importar diretamente o SDK. O HTML carrega `nav-mod.js` antes de board.js, mas IDs/declarações globais não devem ser uma dependência implícita da inicialização modular.

### 7. Segurança e operação offline

**Decisão:** Firestore Security Rules devem proteger operações por UID e validar esquemas. A UI só confirma alterações depois do sucesso da gravação; erros usam feedback simples existente.

**Justificativa:** Filtro de consulta no JavaScript não substitui autorização no banco. O projeto não declara fila offline ou UI de sincronização; estado otimista poderia afirmar persistência que falhou.

### 8. Renderização de texto persistido

**Decisão:** Inserir nomes e itens lidos do Firestore como texto por `textContent`/nós DOM, não interpolá-los como HTML.

**Justificativa:** Esses valores são definidos pelo usuário e passam a ser carregados de uma fonte persistente. O conteúdo visual continua igual e evita interpretar marcação em nomes de projeto, quadros e itens.

## Verificações do repositório

- `board.js` é script clássico incluído por `board.html`; Firebase já é inicializado em `src/scripts/firebase-config.js` usando SDK 12.4.0 em módulos ES.
- A página protegida já inclui `auth-guard.js` como módulo.
- Projetos fixos atuais têm apenas `nome`/`descricao`; criação solicita nome e usa descrição `Novo projeto`.
- A seleção atual salva o nome em `localStorage` sob `taskly-project-name`; o campo de nome pode ser alterado.
- Cartões são criados sob o projeto visual atual, têm nome editável, cor cíclica, exclusão e textos de itens adicionáveis/removíveis.
- Projetos, quadros e itens não têm persistência Firestore implementada em `board.js`.
- `dashboard.js` lida com as tarefas do calendário e não possui lógica de projetos/quadros.
- `firestore.rules` já contém regras de perfil e tarefas sob `users/{uid}` e uma regra final de negação; regras novas precisam coexistir com ambas.
- Não foi identificada configuração Firebase local, runner de testes ou configuração do Emulator Suite; plano de validação inclui navegador e regras em ambiente de desenvolvimento.

## Questões resolvidas

- Projetos e quadros devem pertencer à sessão atual; mudar projeto troca o conjunto de quadros renderizado.
- Os itens continuam textos simples e não se tornam tarefas do dashboard.
- Contas sem projetos recebem somente um contêiner vazio `Projeto 001`; os três projetos de exemplo não são criados.
- Estado de seleção local não concede autorização nem substitui documentos do Firestore.
- Preferências, tema e dados de perfil permanecem fora desta persistência.
