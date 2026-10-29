# Feature Specification: Indicadores e Gráficos do Taskly

**Feature Branch**: `005-indicadores-graficos`

**Created**: 2026-10-07

**Status**: Draft

**Input**: Integrar os indicadores e gráficos já existentes no dashboard ao conjunto de tarefas persistidas no Firestore, reutilizando a fonte de dados atual `users/{uid}/tasks/{taskId}` e preservando a interface e o comportamento já existentes.

---

## Objetivo

Permitir que o dashboard apresente indicadores e gráficos sobre a conclusão e a carga de tarefas do usuário autenticado, usando como fonte os dados reais armazenados no Firestore e mantendo a estrutura já utilizada pelo projeto.

A funcionalidade deve reutilizar a mesma coleção de tarefas persistidas que alimenta a rotina/calendário e não deve criar uma segunda estrutura de tarefas, gráfico ou fonte de dados paralela. O objetivo é adaptar e integrar os indicadores que já existem no dashboard ao estado real do usuário autenticado, sem redesenhar a experiência atual.

A funcionalidade deve operar sobre a estrutura já persistida no Firestore:

`users/{uid}/tasks/{taskId}`

Os indicadores devem considerar somente as tarefas pertencentes ao usuário autenticado. As regras e os dados devem continuar isolados por conta, sem qualquer compartilhamento entre usuários ou uso de outra coleção para métricas.

## Contexto do Projeto e Base de Implementação

Os indicadores e gráficos atuais já existem em `src/pages/dashboard.html` e `src/scripts/dashboard.js`, com a seguinte lógica:

- seção de conclusão de tarefas com período Dia / Semana / Mês;
- donut chart para porcentagem de conclusão;
- contadores de concluídas, pendentes e total;
- seção de carga de tarefas com período Dia / Semana / Mês;
- cálculo derivado da lista de tarefas do usuário autenticado;
- atualização dos indicadores sempre que a lista de tarefas muda ou quando a conclusão é alterada.

A funcionalidade deve usar esse comportamento já existente como referência e adaptar a fonte de dados ao modelo persistido em Firestore. A interface atual deve permanecer intacta: a página do dashboard, seus controles e os elementos visuais existentes continuam sendo a base de funcionamento.

## Histórias de Usuário

### História 1 - Visualizar indicadores com dados reais do usuário (Prioridade: P1)

Como usuário autenticado, quero que os indicadores do dashboard reflitam minhas tarefas reais para que eu veja meu progresso e minha carga de trabalho no contexto correto.

**Cenários de aceitação**:

1. Dado que o usuário está autenticado e possui tarefas persistidas, quando abre o dashboard, então os indicadores de conclusão e carga apresentam valores calculados a partir das tarefas do próprio usuário.
2. Dado que o usuário não tem tarefas no Firestore, quando abre a seção de indicadores, então os contadores e os gráficos exibem zero ou estado equivalente ao dashboard atual, sem dados de outra conta.
3. Dado que a tarefa foi criada, alterada ou concluída, quando os dados mudam, então os indicadores refletem esse novo estado sem criar outra fonte de dados.

### História 2 - Reaproveitar a mesma fonte de tarefas da rotina e do dashboard (Prioridade: P1)

Como usuário, quero que o progresso e a carga sejam calculados a partir das mesmas tarefas que aparecem na rotina para manter a consistência entre o calendário e os indicadores.

**Cenários de aceitação**:

1. Dado que uma tarefa aparece no calendário e está persistida em Firestore, quando o usuário acessa a seção de conclusão ou carga, então o mesmo conjunto de tarefas alimenta os indicadores.
2. Dado que a tarefa recebe mudança de estado de conclusão, quando o usuário volta à seção de indicadores, então os valores são recalculados a partir do estado persistido no Firestore.
3. Dado que os gráficos e indicadores já existem, quando a feature for integrada, então a lógica continua compatível com o dashboard atual e não exige nova experiência ou nova página.

### História 3 - Isolar indicadores por usuário (Prioridade: P1)

Como usuário autenticado, quero que meus indicadores sempre reflitam apenas as tarefas da minha conta.

**Cenários de aceitação**:

1. Dado que existem tarefas de dois usuários distintos, quando cada um acessa o dashboard, então cada conta vê somente o seu próprio cálculo de conclusão e carga.
2. Dado que um usuário tenta acessar dados de outra conta por caminho direto no Firestore, quando o sistema avalia a operação, então a regra de segurança bloqueia o acesso.
3. Dado que não há usuário autenticado, quando o dashboard tenta calcular indicadores, então o cálculo não é realizado e a operação é bloqueada pela sessão.

## Requisitos Funcionais

- **FR-001**: O sistema DEVE usar o Firebase Authentication para identificar o usuário atual e calcular os indicadores somente com as tarefas do seu UID.
- **FR-002**: O sistema DEVE derivar os indicadores e gráficos a partir da coleção `users/{uid}/tasks/{taskId}` e NÃO DEVE criar uma segunda coleção, uma subcoleção, um campo paralelo ou outro modelo de dados para métricas.
- **FR-003**: A seção de conclusão do dashboard DEVE calcular o total, concluídas, pendentes e percentual com base nas tarefas do usuário autenticado e no período ativo atual (dia, semana ou mês).
- **FR-004**: A seção de carga de tarefas DEVE calcular a distribuição por dia, semana ou mês a partir das tarefas do usuário autenticado e do mesmo conjunto persistido que alimenta a rotina/calendário.
- **FR-005**: Os indicadores DEVEM refletir mudanças reais de estado da tarefa, especialmente criação, conclusão e reset de conclusão, sem depender de dados locais independentes.
- **FR-006**: Os gráficos e indicadores DEVEM continuar a respeitar o período atual da interface já implementada no dashboard, sem criar novos filtros ou regras fora do modelo atual.
- **FR-007**: O dashboard DEVE preservar a interface existente, os elementos visuais, os textos, a estrutura e os controles atuais, sem criar novas telas, rotas, páginas ou telas de analytics.
- **FR-008**: A lógica de cálculo DEVE usar as tarefas persistidas em Firestore, mantendo os campos já existentes (`nome`, `data`, `horario`, `concluida`) e o identificador do documento do Firestore.
- **FR-009**: Quando a lista de tarefas do usuário autentificado mudar, os indicadores devem ser recalculados sem exigir uma nova estrutura de dados ou uma segunda cópia de tarefa.
- **FR-010**: O acesso às tarefas para cálculo dos indicadores DEVE continuar sendo isolado por UID e protegido pelas regras de segurança existentes do Firestore.
- **FR-011**: Qualquer falha de leitura ou gravação do Firestore DEVE ser tratada no mesmo padrão visual e de feedback já existente no dashboard, sem apresentar sucesso falso ou dados inconsistentes.

## Entidade: Tarefa

Os indicadores devem continuar operando sobre o mesmo documento persistido do usuário autenticado:

`users/{uid}/tasks/{taskId}`

A tarefa segue a estrutura usada pelo projeto:

| Campo | Tipo | Regra |
|---|---|---|
| `id` | Identificador do documento | Deve corresponder ao `taskId` do Firestore e ser estável entre carregamentos e atualizações. |
| `nome` | Texto | Nome da tarefa informada pela interface. |
| `data` | Texto `YYYY-MM-DD` | Data da tarefa, usada pela rotina e pelos gráficos. |
| `horario` | Texto `HH:mm` | Horário da tarefa, usado para organização da rotina e distribuição de carga. |
| `concluida` | Booleano | Estado de conclusão da tarefa; define os totais e o percentual de conclusão. |
| proprietário | Definido pelo caminho `users/{uid}/tasks/{taskId}` | A tarefa pertence somente ao usuário autenticado em `uid`. |

Não deve haver campos novos ou coleções paralelas para indicadores. Os dados dos indicadores devem ser derivados diretamente das tarefas existentes.

## Fluxo de Funcionamento da Funcionalidade

### 1. Carregamento do usuário autenticado

Ao iniciar o dashboard, o sistema deve identificar o usuário autenticado pelo `uid` do Firebase Authentication. A partir disso, a lista de tarefas deve ser carregada do caminho do próprio usuário e usada como base para os indicadores e gráficos.

### 2. Cálculo da conclusão

A seção de conclusão deve filtrar as tarefas do usuário autenticado conforme o período ativo atual:

- Dia;
- Semana;
- Mês.

Em seguida:

- `total` = número de tarefas no período;
- `concluidas` = tarefas com `concluida === true` no período;
- `pendentes` = total - concluidas;
- `percentual` = porcentagem de conclusão calculada sobre o total do período.

A apresentação deve continuar igual ao dashboard atual, incluindo o donut, os contadores e o texto do título do período.

### 3. Cálculo de carga de tarefas

A seção de carga deve contar quantas tarefas existem em cada intervalo do período selecionado:

A seção de carga deve manter exatamente os intervalos e critérios de agrupamento já utilizados pelo dashboard atual para cada período selecionado. A implementação não deve introduzir novos horários, intervalos ou regras de agrupamento.

A carga deve ser calculada usando as tarefas do usuário autenticado e a mesma estrutura de dados já usada pela rotina.

### 4. Atualização dos indicadores

Quando o estado de uma tarefa mudar, seja por criação, conclusão ou desmarcação, os indicadores devem recalcular automaticamente a partir dos dados persistidos no Firestore. A atualização deve acontecer sem criar outra cópia orquestrada de tarefas e sem mudar as seções ou componentes existentes.

### 5. Reuso da rotina e do dashboard

A rotina/calendário e os indicadores devem operar sobre a mesma lista de tarefas do usuário autenticado, sem criar um estado paralelo para métricas. A integração deve respeitar a lógica já existente na aplicação e somente consumir e calcular a partir do modelo persistido.

## Requisitos de Compatibilidade e Não Redesenho

- A funcionalidade deve manter a página de dashboard e a estrutura já existente em `dashboard.html`.
- A interface atual dos indicadores e gráficos não deve ser redesenhada, renomeada ou reformulada.
- A funcionalidade deve usar os textos, classes, estrutura e elementos visuais já presentes em `dashboard.js` e `dashboard.html`.
- Não devem ser criadas novas telas, páginas, menus, rotas ou modais para indicadores.
- Não devem ser criados campos, coleções ou modelos de dados específicos para gráficos ou analytics.
- Nenhum dado de outra conta deve ser carregado ou incorporado aos indicadores.

## Fora de Escopo

- Criação de analytics externos ou relatórios administrativos.
- Compartilhamento de indicadores entre usuários.
- Persistência de métricas ou cálculos em uma coleção própria.
- Alteração de autenticação, login, cadastro, logout ou navegação geral.
- Alteração em projetos, quadros ou rotina/calendário.
- Mudança no modelo de tarefa ou estrutura de dados já persistidos.
- Criação de painéis adicionais fora do dashboard atual.

## Pressupostos e Dependências

- O dashboard já possui a seção de conclusão e carga de tarefas com seus elementos e filtros.
- O sistema já carrega as tarefas do usuário autenticado no mesmo arquivo do dashboard.
- O Firebase Authentication fornece o UID correto da sessão ativa.
- O Firestore já possui os dados de tarefas no caminho `users/{uid}/tasks/{taskId}` e deve continuar sendo a fonte de verdade.
- A rotina/calendário e os indicadores já compartilham a mesma base de tarefas no dashboard atual; a feature deve preservar esse uso e manter consistência.

## Regras de Segurança

Quando o estado de uma tarefa mudar, seja por criação, conclusão ou desmarcação, os indicadores devem ser recalculados a partir do conjunto de tarefas atualmente carregado pelo dashboard, desde que esse conjunto tenha sido atualizado após a confirmação da operação no Firestore. Não deve ser criada uma segunda cópia de tarefas nem uma consulta independente apenas para os indicadores.

As regras devem garantir que:

- somente usuários autenticados possam acessar as tarefas que alimentam os indicadores;
- o `uid` autenticado deve corresponder ao caminho da tarefa;
- a leitura e a atualização de dados para indicadores não permitam acesso cruzado entre contas;
- qualquer tentativa de ler ou escrever tarefas de outra conta continue sendo negada pelas regras do Firestore.

## Critérios de Sucesso

- Os indicadores do dashboard refletem as tarefas reais do usuário autenticado.
- Os gráficos e contadores usam os dados persistidos em `users/{uid}/tasks/{taskId}` sem criar uma segunda fonte de dados.
- A conclusão e a carga de tarefas são recalculadas corretamente após criação, atualização ou mudança de conclusão.
- A navegação por Dia/Semana/Mês e a estrutura do dashboard continuam funcionando sem regressão.
- A troca de conta ou a ausência de autenticação não exibe dados de outra pessoa.
- O dashboard continua preservando o layout, os estilos e o comportamento atual.

## Restrições Técnicas

- A funcionalidade deve usar `onAuthStateChanged` e o `uid` da sessão para carregar as tarefas do usuário autenticado.
- Os cálculos devem derivar diretamente do conjunto de tarefas persistidas e não de uma segunda lista separada ou outra coleção.
- Antes de criar qualquer nova estrutura de dados, deve-se verificar se a tarefa existente já responde ao requisito.
- A implementação deve priorizar adaptação do que já existe em vez de criar uma experiência nova ou paralela.

## Resultado Esperado

A funcionalidade de indicadores e gráficos do Taskly deve continuar sendo a mesma parte do dashboard, mas alimentada pelas tarefas persistidas do usuário autenticado em Firestore. Os indicadores devem refletir o progresso e a carga reais da conta ativa, mantendo a interface e o comportamento atual do Taskly e sem criar qualquer segunda fonte de dados ou modelo paralelo.
