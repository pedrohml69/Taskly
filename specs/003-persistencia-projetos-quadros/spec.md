# Feature Specification: Persistência de Projetos e Quadros

**Feature Branch**: `003-persistencia-projetos-quadros`

**Created**: 2026-10-06

**Status**: Draft

**Input**: Persistir no Firestore os projetos, quadros e itens atualmente mantidos em memória/localmente pela tela de board, vinculando-os à conta autenticada e preservando o frontend existente.

---

## Objetivo

Substituir os dados voláteis de projetos e quadros por registros do Firestore associados ao usuário autenticado. Ao retornar à tela de board, o usuário deve encontrar seus projetos, o projeto selecionado, seus quadros e os itens adicionados aos quadros.

A página atual continua sendo a interface oficial. A lista de projetos permanece no modal existente e a visualização/edição de quadros permanece na página de board. Não criar telas, rotas ou estilos novos.

## Comportamento Atual Considerado

- A versão anterior de `board.js` continha três projetos fixos de exemplo; esses dados não pertencem ao usuário e não devem ser persistidos nem recriados.
- Criar projeto solicita um nome por `prompt`, usa a descrição “Novo projeto” e acrescenta o projeto à lista em memória.
- Selecionar projeto no modal atualiza o campo `projectName`, fecha o modal e guarda o nome selecionado em `localStorage` (`taskly-project-name`). O campo do projeto também pode ser alterado e seu valor é salvo localmente.
- Quadros são criados na página atual por `prompt`; cada cartão tem título editável, cor cíclica azul/amarelo/vermelho, botão de exclusão e lista de itens.
- Itens são textos criados por `prompt` e podem ser excluídos individualmente. Projetos, quadros e itens não são carregados de uma fonte persistente.
- `dashboard.js` é responsável pelas tarefas do dashboard e não implementa projetos ou quadros. Esta feature não modifica a persistência de tarefas existente.

## Histórias de Usuário

### História 1 - Consultar e selecionar meus projetos (Prioridade: P1)

Como usuário autenticado, quero ver e selecionar meus projetos existentes para abrir o contexto de trabalho correspondente na página de board.

**Cenários de aceitação**:

1. **Dado** que minha conta possui projetos, **quando** abro “Ver todos projetos”, **então** a lista existente apresenta cada projeto com seu nome e descrição.
2. **Dado** que seleciono um projeto, **quando** o modal fecha, **então** o cabeçalho mostra o nome do projeto selecionado e a página apresenta os quadros pertencentes a esse projeto.
3. **Dado** que retorno à página após recarregar ou iniciar nova sessão, **quando** minha seleção anterior ainda pertence à minha conta, **então** o mesmo projeto e seus quadros são restaurados.
4. **Dado** que a conta ainda não possui projetos, **quando** abro a tela, **então** é criado uma única vez o projeto-contêiner vazio `Projeto 001`, ele fica selecionado e posso adicionar quadros pelo controle existente.

### História 2 - Criar e renomear projetos (Prioridade: P1)

Como usuário autenticado, quero criar projetos e atualizar o nome do projeto ativo para organizar meus quadros.

**Cenários de aceitação**:

1. **Dado** que informo um nome não vazio no fluxo existente de criação, **quando** confirmo, **então** o projeto é salvo na minha conta, aparece na lista e fica selecionado como no fluxo atual.
2. **Dado** que altero o campo de nome do projeto ativo, **quando** a alteração é confirmada, **então** o nome salvo do projeto e sua apresentação na lista são atualizados.
3. **Dado** que a criação ou atualização falha, **quando** a operação termina, **então** a interface não apresenta o dado como persistido e informa a falha sem perder silenciosamente o valor digitado.

### História 3 - Persistir quadros e itens (Prioridade: P1)

Como usuário, quero que os quadros e os itens adicionados a eles permaneçam no projeto correto para continuar meu trabalho após voltar à aplicação.

**Cenários de aceitação**:

1. **Dado** um projeto selecionado, **quando** crio um quadro pelo botão existente, **então** o quadro é salvo nesse projeto e aparece na área de board com o título e a próxima cor da sequência atual.
2. **Dado** um quadro existente, **quando** altero seu título, **então** a alteração é salva e reaparece após recarregar.
3. **Dado** um quadro, **quando** adiciono um item pelo fluxo existente, **então** o texto é salvo no quadro e aparece na lista na ordem de criação.
4. **Dado** um quadro com itens, **quando** excluo um item ou o quadro pelo controle existente, **então** somente o registro correspondente é removido da persistência e da visualização.
5. **Dado** que volto a um projeto, **quando** seus quadros são carregados, **então** títulos, ordem, cores, itens e estado vazio de quadros sem itens são representados como antes.

### História 4 - Isolar projetos e quadros por usuário (Prioridade: P1)

Como usuário, quero que somente minha conta possa acessar meus projetos, quadros e itens.

**Cenários de aceitação**:

1. **Dado** que duas contas possuem projetos diferentes, **quando** cada uma acessa a tela de board, **então** cada conta vê apenas seus próprios projetos e conteúdos.
2. **Dado** que um usuário tenta ler, criar, alterar ou excluir dados no caminho de outro UID, **quando** o Firestore avalia a operação, **então** ela é negada.
3. **Dado** que não existe sessão autenticada, **quando** uma operação tenta acessar os dados, **então** ela é negada pelas regras do Firestore.

## Requisitos Funcionais

- **FR-001**: O sistema DEVE usar o UID da sessão atual do Firebase Authentication como limite de propriedade dos projetos, quadros e itens.
- **FR-002**: O sistema DEVE carregar somente os projetos e seus dados pertencentes ao UID autenticado.
- **FR-003**: O sistema DEVE persistir os campos de projeto usados atualmente: `nome` e `descricao`; projetos criados pelo fluxo existente iniciam com a descrição “Novo projeto”.
- **FR-004**: O sistema DEVE persistir a criação e a alteração do nome do projeto ativo, atualizando o modal e o cabeçalho existente após confirmação.
- **FR-005**: O sistema DEVE associar cada quadro a um projeto do mesmo usuário autenticado.
- **FR-006**: O sistema DEVE preservar para cada quadro seu identificador estável, título, ordem de exibição, cor atual e itens associados.
- **FR-007**: O sistema DEVE persistir a inclusão e exclusão de quadros e a inclusão e exclusão de itens pelos controles existentes.
- **FR-008**: Itens do quadro DEVEM preservar o conteúdo textual e a ordem atual; não devem receber status ou campos de tarefa que não existam no comportamento presente.
- **FR-009**: A seleção de projeto DEVE restaurar os quadros do projeto selecionado sem criar novas páginas ou rotas. O identificador local usado para lembrar a seleção é apenas estado de navegação e deve ser validado contra os projetos carregados da conta atual.
- **FR-010**: As operações de gravação DEVEM apresentar sucesso somente após confirmação do Firestore; falhas DEVEM gerar retorno compreensível e não podem resultar em perda silenciosa da alteração.
- **FR-011**: As regras de segurança do Firestore DEVEM negar acesso de usuários não autenticados e de qualquer conta a projetos, quadros ou itens sob o UID de outra conta.
- **FR-012**: A integração NÃO DEVE alterar o layout, os estilos, a navegação existente ou o fluxo de autenticação.
- **FR-013**: Quando a coleção estiver vazia, o sistema DEVE criar uma única vez o projeto-contêiner `Projeto 001` (ID `project-001`, descrição vazia, ordem 0), selecioná-lo e associar a ele os quadros criados. Não criar os três projetos fixos de exemplo.

## Modelo de Dados

A propriedade é representada pelos caminhos Firestore, sem confiar em um `userId` enviado pelo cliente:

```text
users/{uid}/projects/{projectId}
users/{uid}/projects/{projectId}/boards/{boardId}
```

### Projeto

| Campo | Tipo | Regra |
|---|---|---|
| `nome` | string | Obrigatório; nome apresentado na lista e no cabeçalho. |
| `descricao` | string | Obrigatório; texto apresentado abaixo do nome; vazia no projeto-contêiner automático. |
| `ordem` | number | Ordem relativa do projeto na lista, preservada após recarregar; o primeiro projeto criado recebe ordem 0. |

Quando não houver projetos, criar deterministicamente `users/{uid}/projects/project-001` com `nome: "Projeto 001"`, `descricao: ""` e `ordem: 0`. A transação deve impedir duplicação entre abas. Projetos criados pelo usuário usam IDs Firestore próprios. O campo `status` descrito em modelos genéricos anteriores não é usado pela tela atual e não faz parte desta feature.

### Quadro

| Campo | Tipo | Regra |
|---|---|---|
| `nome` | string | Obrigatório; título exibido no input editável do cartão. |
| `ordem` | number | Ordem de apresentação dos cartões no projeto. |
| `cor` | string | Uma das classes já usadas: `quadro-azul`, `quadro-amarelo` ou `quadro-vermelho`. |
| `itens` | array de strings | Textos dos itens na ordem em que aparecem; pode ser vazio. |

`boardId` é o identificador estável fornecido pelo documento Firestore. Excluir um cartão remove o respectivo documento; itens estão embutidos no quadro e a exclusão de um item remove somente sua ocorrência correspondente, inclusive quando houver nomes repetidos.

## Requisitos de Compatibilidade

- Manter o modal existente de projetos, os prompts de criação, o input de nome do projeto, os cartões de quadro e seus controles.
- Não criar projetos de exemplo pré-preenchidos. Se não houver nenhum projeto, manter somente o contêiner genérico `Projeto 001`, criado automaticamente para receber quadros.
- Manter a sequência de cores azul, amarelo e vermelho na criação de quadros; cor e ordem devem ser restauradas por projeto.
- O modo noturno, o perfil e o logout continuam com o comportamento atual. Preferências e configurações não passam a ser persistidas no Firestore.
- A seleção armazenada localmente não concede acesso: todo conteúdo é consultado e autorizado pelo UID autenticado.
- O estado em memória de quadros/itens não oferece dados duráveis antes desta feature; não há migração de cartões ou itens de sessões anteriores. O nome selecionado já salvo em `localStorage` pode ser associado a um projeto carregado da mesma conta pelo nome, sem tratar esse valor local como registro autoritativo.
- Documentos `starter-*` criados pela versão incorreta anterior não são recriados nem apagados automaticamente; sua remoção exige ação explícita no Firestore.

## Fora de Escopo

- Novas telas, rotas, redesign ou mudanças em HTML/CSS não necessárias à integração dos dados.
- Persistência de configurações, perfil, preferências visuais ou notificações.
- Mudanças no login, cadastro, logout ou controle de sessão existente.
- Colaboração, compartilhamento, permissões por função ou acesso entre usuários.
- Projetos, quadros e itens de outro usuário; integração dos itens simples dos quadros com as tarefas do dashboard.
- Exclusão de projetos, que não existe no fluxo atual.
- PHP, MySQL, backend próprio ou substituição do Firebase Web SDK.

## Pressupostos e Dependências

- A página de board já é protegida pelo Firebase Authentication e o usuário autenticado fornece o UID.
- `firebase-config.js` já inicializa e exporta `auth` e `db` usando Firebase Web SDK 12.4.0.
- A estrutura abaixo do cartão reflete apenas itens textuais, sem status, prazo ou conclusão.
- O projeto selecionado determina o conjunto de cartões exibido na página atual; selecionar outro projeto não altera nem mistura os dados do projeto anterior.
- A autorização deve ser imposta por Firebase Security Rules, além de qualquer filtro no cliente.

## Critérios de Sucesso

- Uma conta vazia recebe somente `Projeto 001`, sem quadros; quadros criados nele e projetos criados/renomeados pelo usuário permanecem após recarregar.
- A seleção de um projeto carrega somente os seus quadros; quadros, cores, ordem e itens permanecem após recarregar.
- Criar e excluir quadros/itens atualiza Firestore e a tela existente sem alterar seu visual.
- Testes com duas contas confirmam isolamento também por acesso direto ao Firestore.
- O fluxo de login, perfil, logout, modo noturno e a persistência separada das tarefas do dashboard continuam inalterados.
