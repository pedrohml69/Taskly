# Feature Specification: Rotina / Calendário do Taskly

**Feature Branch**: `004-rotina-calendario`

**Created**: 2026-10-07

**Status**: Draft

**Input**: Integrar a rotina/calendário já existente no dashboard com a persistência de tarefas implementada na Feature 002, utilizando a estrutura atual do Firestore e preservando a interface, layout e comportamento do Taskly.

---

## Objetivo

Integrar a seção de rotina do dashboard com a fonte de dados já persistida em Firestore, sem criar uma segunda estrutura de tarefas ou uma nova camada de armazenamento.

A funcionalidade deve usar a coleção e o modelo já existentes em:

`users/{uid}/tasks/{taskId}`

O calendário da rotina deve continuar funcionando como visualização da semana atual, com navegação por dias/semana, organização por data e horário e atualização do status de conclusão a partir das tarefas do usuário autenticado.

A interface atual deve permanecer intacta: nenhuma nova tela, rota, página, modal ou rede de navegação deve ser criada. O objetivo é adaptar a rotina ao modelo persistido já implementado, não redesenhar a experiência atual.

## Contexto do Projeto e Base de Implementação

A rotina atual já existe em `src/pages/dashboard.html` e `src/scripts/dashboard.js`, com estes comportamentos principais:

- a seção de rotina exibe uma grade semanal com cabeçalho de dias e linhas de horário;
- a navegação através da semana usa os botões de anterior/próximo; 
- cada célula do calendário é agrupada por `data + horario`;
- cada tarefa aparece em sua célula correspondente;
- ao clicar em uma tarefa, o sistema alterna o estado `concluida` no Firestore;
- a criação de tarefa usa o modal existente e persiste itens com `nome`, `data`, `horario` e `concluida`;
- o dashboard considera as tarefas do usuário autenticado como a única fonte de dados para rotina, conclusão e carga de tarefas.

A funcionalidade de rotina/calendário deve respeitar esse comportamento existente e consumir a mesma base persistida em Firestore já usada pelo dashboard.

## Histórias de Usuário

### História 1 - Visualizar a rotina a partir das tarefas persistidas (Prioridade: P1)

Como usuário autenticado, quero que minha rotina mostre as tarefas salvas no Firestore para que eu veja a organização de minha semana sem depender de dados apenas em memória.

**Cenários de aceitação**:

1. Dado que o usuário está autenticado e possui tarefas persistidas, quando acessa a seção de rotina do dashboard, então a rotina exibe as tarefas organizadas por data e horário conforme o calendário atual.
2. Dado que uma tarefa foi criada em uma data e horário específicos, quando a rotina for renderizada, então ela aparece na célula correspondente do calendário.
3. Dado que o usuário não tem tarefas no Firestore, quando abre a rotina, então a visualização permanece vazia, sem tarefas de outras contas nem dados de exemplo.

### História 2 - Navegar pela rotina e manter a experiência atual (Prioridade: P1)

Como usuário, quero navegar pelas semanas e datas da rotina da mesma forma que a interface atual já permite para manter o uso natural do dashboard.

**Cenários de aceitação**:

1. Dado que a semana atual está visível, quando o usuário clica em próximo ou anterior, então a grade do calendário é atualizada para a semana correspondente.
2. Dado que a rotina usa como base a data e o horário das tarefas persistidas, quando o usuário navega entre semanas, então as tarefas são reorganizadas de acordo com a nova faixa visualizada.
3. Dado que o comportamento atual da semana e do calendário já existe, quando a integração for aplicada, então a navegação e a aparência do layout permanecem compatíveis com aquilo que a aplicação já oferece.

### História 3 - Atualizar o estado da tarefa em tempo real e manter persistência (Prioridade: P1)

Como usuário, quero alternar tarefas como concluídas ou pendentes e garantir que a alteração seja refletida tanto na rotina quanto no Firestore.

**Cenários de aceitação**:

1. Dada uma tarefa pendente exibida no calendário, quando o usuário clica nela, então seu estado de conclusão deve ser atualizado no Firestore e refletido na interface atual.
2. Dada uma tarefa concluída, quando o usuário clica novamente, então ela retorna ao estado pendente e a alteração continua persistida.
3. Dada uma alteração de conclusão, quando a página for recarregada, então a tarefa continua no mesmo estado salvo no Firestore.

### História 4 - Isolar tarefas por usuário (Prioridade: P1)

Como usuário autenticado, quero que somente minhas tarefas sejam carregadas e alteradas para que nenhuma outra conta possa acessar ou modificar o meu calendário.

**Cenários de aceitação**:

1. Dado que dois usuários usam o sistema, quando cada um acessa a rotina, então cada um vê somente as tarefas vinculadas ao seu próprio UID.
2. Dado que um usuário tenta acessar ou alterar tarefas de outra conta, quando a operação entra em contato com o Firestore, então a regra de segurança nega o acesso.
3. Dado que nenhum usuário está autenticado, quando a rotina tenta ler as tarefas, então a operação é bloqueada por autenticação.

## Requisitos Funcionais

- **FR-001**: O sistema DEVE utilizar a autenticação do Firebase para identificar o usuário atual e carregar somente as tarefas pertencentes ao seu UID.
- **FR-002**: O sistema DEVE consumir a estrutura já existente de tarefas em `users/{uid}/tasks/{taskId}` e NÃO DEVE criar uma nova coleção, subcoleção, campo ou modelo alternativo para tarefas da rotina.
- **FR-003**: A rotina DEVE carregar as tarefas do usuário autenticado no dashboard a partir do Firestore e manter a organização por `data` e `horario` conforme o comportamento atual da aplicação.
- **FR-004**: A rotina DEVE renderizar tarefas usando os mesmos critérios de organização já presentes no dashboard: agrupamento por dia e horário, preservando a grade semanal e a navegação atual.
- **FR-005**: A criação, alteração e conclusão de tarefas DEVEM refletir o estado real persistido no Firestore sem criar outra fonte de dados local para a rotina.
- **FR-006**: A navegação deve seguir exatamente o comportamento atualmente implementado no dashboard, incluindo os controles de anterior e próximo e os limites já definidos pelo código existente. A implementação não deve criar novas regras de navegação que não estejam presentes no comportamento atual.
- **FR-007**: O sistema DEVE manter a experiência do dashboard sem criar nova interface, nova rota ou nova página para a rotina/calendário.
- **FR-008**: A rotina DEVE respeitar o modelo atual de tarefa já utilizado no projeto: `nome`, `data`, `horario`, `concluida` e o identificador do documento Firestore (`taskId`).
- **FR-009**: As alterações de conclusão devem ser persistidas no mesmo documento da tarefa e reapresentadas na rotina após recarrego ou troca de sessão.
- **FR-010**: O sistema DEVE impedir leitura ou escrita de tarefas de outros usuários por meio das regras de segurança existentes do Firestore, sem introduzir uma estrutura paralela de permissões.
- **FR-011**: A rotina DEVE continuar funcionando dentro do dashboard existente, usando o mesmo calendário, os mesmos controles e o mesmo padrão visual já implementados.
- **FR-012**: Quaisquer falhas de leitura ou gravação no Firestore DEVEM ser tratadas comFeedback existente, sem apresentação de sucesso falso e sem alterar a interface de calendário ou de tarefas.

## Entidade: Tarefa

A rotina deve operar sobre o mesmo documento já usado pela persistência do Taskly:

`users/{uid}/tasks/{taskId}`

A estrutura da tarefa deve continuar sendo a existente no projeto:

| Campo | Tipo | Regra |
|---|---|---|
| `id` | Identificador estável do documento | Deve corresponder ao `taskId` do documento no Firestore e permanecer consistente entre carregamentos e updates. |
| `nome` | Texto | Nome da tarefa digitado na interface atual. |
| `data` | Texto `YYYY-MM-DD` | Data da tarefa no formato já usado pela rotina. |
| `horario` | Texto `HH:mm` | Horário da tarefa no formato já usado no dashboard. |
| `concluida` | Booleano | Estado de conclusão da tarefa, em linha com os controles existentes. |
| proprietário | Definido pelo caminho `users/{uid}/tasks/{taskId}` | A tarefa pertence apenas ao usuário autenticado no `uid`. |

Não deve haver novos campos de tarefa para a rotina. O calendário deve usar a representação já existente e persistida no Firestore.

## Fluxo de Funcionamento da Rotina

### 1. Carregamento do usuário autenticado

Ao iniciar o dashboard, o sistema deve aguardar a sessão ativa do Firebase Authentication e obter o `uid` atual. A rotina deve somente buscar tarefas do usuário autenticado e não acessar coleções genéricas ou compartilhadas.

### 2. Carregamento de tarefas existentes

A rotina deve consultar `collection(db, "users", usuario.uid, "tasks")` e mapear cada documento em um objeto da mesma estrutura já usada pelo dashboard (`id`, `nome`, `data`, `horario`, `concluida`).

Essa carga deve ocorrer antes da renderização da grade semanal e deve ser reutilizada para:

- rotina/calendário;
- indicadores de conclusão;
- gráficos de carga de tarefas;
- atualização de estado de conclusão.

### 3. Organização da rotina por data e horário

As tarefas devem continuar sendo organizadas pelas mesmas regras já presentes no código atual:

- `data` define o dia da semana e do calendário;
- `horario` define a linha do horário dentro do dia;
- múltiplas tarefas com a mesma data e horário devem aparecer na mesma célula e respeitar a organização já existente no layout atual;
- a renderização deve seguir a grade semanal da seção rotina do dashboard, sem alterar as classes, estrutura ou estilos dos componentes visuais.

### 4. Navegação da semana

A rotina deve manter o comportamento atual de navegação:

- a semana inicial deve partir da semana atual;
- os botões de anterior e próximo devem alterar o início da semana;
- a organização visual do intervalo da semana e dos dias do calendário deve continuar igual à atual;
- a lógica precisa respeitar a data atual e evitar navegação para semanas anteriores ao intervalo permitido pela aplicação.

### 5. Atualização de tarefas e conclusão

Quando o usuário clicar em uma tarefa do calendário para alternar o estado de conclusão:

- a aplicação deve manter o mesmo fluxo atual de atualização do estado de `concluida`;
- o valor deve ser salvo no Firestore no mesmo documento da tarefa; 
- a rotina deve refletir a alteração sem criar uma cópia local separada de dados;
- a operação deve ser ignorada ou abortada se houver conflito de sessão e se o usuário autenticado não for mais o mesmo.

### 6. Criação e manutenção de tarefas

A criação de tarefa continua ocorrendo pelo modal e fluxo já existentes. O item adicionando no dashboard deve persistir diretamente em:

`users/{uid}/tasks/{taskId}`

A rotina deve reapresentar o item recém-criado após o sucesso da gravação no Firestore e manter a mesma lógica de renderização do dashboard.

## Requisitos de Compatibilidade e Não Redesenho

- A rotina deve continuar usando os controles, páginas e estilos já presentes em `dashboard.html` e `dashboard.js`.
- Não devem ser criadas novas telas, rotas, modais, paginas extras ou coleções paralelas.
- Não deve haver migração de tarefa para estrutura diferente, mesmo que o modelo atual seja em memória antes da feature 002.
- O projeto deve continuar respeitando a organização atual do dashboard em relação à rotina, carga de tarefas e conclusão.
- Qualquer ajuste necessário para integrar a rotina com Firestore deve ser mínimo e compatível com o comportamento já existente.

## Fora de Escopo

- Criação de nova tela de calendário ou rotina independente do dashboard.
- Criação de outra coleção de tarefas, como `routineTasks`, `calendarTasks` ou `tasksCalendar`.
- Alteração da estrutura do documento de tarefa, campos extras ou campos paralelos.
- Mudança de autenticação, login, logout, cadastro ou hub de perfil.
- Persistência de projetos, quadros ou outra funcionalidade em paralelo à rotina.
- Redesenho visual da rotina ou alteração de CSS de forma estrutural.

## Pressupostos e Dependências

- O dashboard já está autenticado e protegido por `auth-guard`.
- O Firebase Authentication e o Firestore já estão configurados e prontos para uso.
- A persistência de tarefas já está implementada em `users/{uid}/tasks` e deve ser reaproveitada pela rotina.
- A rotina e os gráficos do dashboard já compartilham a mesma lista em memória de tarefas e esta lista deve continuar sendo alimentada pela base persistida do usuário autenticado.
- O layout atual da rotina e das partes de conclusão e carga de tarefas continua sendo o ponto de referência para a integração.

## Regras de Segurança

As regras de segurança do Firestore devem continuar sendo as já definidas para tarefas e a rotina não deve exigir uma nova regra específica para um modelo paralelo.

As regras devem garantir que:

- somente usuários autenticados possam ler ou gravar suas tarefas;
- o `uid` da sessão deve corresponder ao caminho `users/{uid}/tasks/{taskId}`;
- um usuário não autenticado seja bloqueado em qualquer tentativa de acesso;
- qualquer operação de criação, leitura, atualização ou exclusão de tarefas continue limitada ao dono do documento;
- a rotina não introduza nenhuma exceção que conceda acesso a outra conta ou ao estado global.

## Critérios de Sucesso

- O dashboard de rotina exibe as tarefas do usuário autenticado organizadas conforme o calendário atual.
- A rotina usa a mesma coleção e estrutura de tarefas da Feature 002, sem nova fonte de dados.
- A navegação semanal mantém a experiência atual do Taskly.
- A alternância de conclusão é persistida em Firestore e permanece após recarregar a página.
- Nenhuma conta consegue visualizar ou alterar tarefas de outra conta.
- O comportamento visual, o layout e os controles da rotina continuam compatíveis com a interface existente.

## Restrições Técnicas

- A implementação deve usar `onAuthStateChanged` e o `uid` da sessão para carregar tarefas do usuário ativo.
- A rotina deve usar os mesmos dados persistidos que já alimentam o dashboard e não gerar duplicação de dados.
- Antes de adicionar qualquer campo novo, deve-se verificar se o modelo atual já atende à necessidade funcional.
- A funcionalidade deve priorizar adaptação do que já existe em vez de estruturar um modelo paralelo ou novo conjunto de regras.

## Resultado Esperado

A rotina/calendário do Taskly deve continuar sendo a mesma visualização do dashboard, mas alimentada pelas tarefas persistidas no Firestore do usuário autenticado. A funcionalidade deve reutilizar a estrutura de tarefa atual, manter os dados isolados por usuário e respeitar a interface e os padrões já implementados no projeto.
