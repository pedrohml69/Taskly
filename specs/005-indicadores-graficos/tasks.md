# Tasks: Indicadores e Gráficos do Taskly

**Input**: Documentos de design em `/specs/005-indicadores-graficos/`
**Prerequisites**: `spec.md`, `plan.md`

**Feature**: Integrar os indicadores e gráficos do dashboard com a persistência real de tarefas do usuário autenticado, reutilizando a coleção `users/{uid}/tasks/{taskId}` sem criar outra fonte de dados.

## Escopo

Esta feature cobre:

- carregamento das tarefas do usuário autenticado no dashboard;
- cálculo de conclusão por Dia/Semana/Mês;
- cálculo de carga de tarefas por período;
- atualização automática dos indicadores quando a tarefa mudar de estado;
- preservação da interface, filtros e layout atuais da página do dashboard;
- validação de isolamento por usuário e segurança do Firestore.

Não cobre:

- nova tela de analytics;
- redesign visual dos indicadores;
- nova coleção ou estrutura paralela para métricas;
- alteração de login, cadastro, logout, projetos, quadros ou rotina fora do dashboard;
- criação de relatórios externos ou compartilhamento de indicadores.

## Phase 1: Revisão do estado atual do dashboard

- [ ] T001 Revisar a lógica atual de `dashboard.js` para identificar onde os contadores, percentual, donut e carga são atualizados e quais filtros já existem por período.
- [ ] T002 Confirmar que o dashboard já trabalha com a lista de tarefas do usuário autenticado como base para os indicadores e que a sessão ativa fornece o `uid` correto do Firebase Authentication.
- [ ] T003 Verificar que o modelo persistido continua sendo `nome`, `data`, `horario`, `concluida` dentro de `users/{uid}/tasks/{taskId}` e que não há necessidade de nova estrutura de métricas.

## Phase 2: Carregamento de tarefas do usuário autenticado

**Objetivo**: os indicadores passam a refletir apenas as tarefas da conta ativa usando o mesmo modelo usado pelo restante do Taskly.
**Teste independente**: usuário autenticado com tarefas persistidas vê seus cálculos; usuário sem tarefas ou com sessão trocada não recebe dados de outra conta.

- [ ] T004 [US1] Ajustar o carregamento inicial em `src/scripts/dashboard.js` para consultar `collection(db, "users", usuario.uid, "tasks")` após `onAuthStateChanged` e mapear os documentos mantendo `{ id, nome, data, horario, concluida }`.
- [ ] T005 [US1] Garantir que os indicadores usem a mesma lista de tarefas carregada pelo dashboard, sem manter uma segunda lista de métricas ou uma fonte independente de dados.
- [ ] T006 [US1] Limpar os valores do dashboard quando a sessão terminar, trocar de conta ou ocorrer um carregamento conflitante, evitando que dados de outra conta permaneçam visíveis.
- [ ] T007 [US1] Tratar falhas de leitura de tarefas preservando o comportamento atual de feedback e sem apresentar sucesso falso ou estado inconsistente.

## Phase 3: Cálculo de conclusão e carga

**Objetivo**: manter o comportamento atual dos gráficos e contadores, mas alimentados pelos dados reais do Firestore.
**Teste independente**: total, concluidas, pendentes e percentual refletem o período atual com precisão.

- [ ] T008 [US2] Ajustar o cálculo de conclusão para considerar somente as tarefas do usuário autenticado e o período selecionado atualmente (Dia/Semana/Mês).
- [ ] T009 [US2] Preservar a lógica atual dos contadores e do donut chart, sem mudar classes, textos ou layout visual já existentes em `dashboard.html` e `dashboard.js`.
- [ ] T010 [US2] Ajustar o cálculo de carga para contar tarefas por intervalo do período ativo usando os mesmos critérios de agregação já implementados no dashboard.
- [ ] T011 [US2] Garantir que a mudança de estado de uma tarefa (`concluida` true/false) recalcule os indicadores imediatamente sem depender de uma segunda cópia dos dados.

## Phase 4: Atualização e compatibilidade de renderização

**Objetivo**: manter a página do dashboard funcionando conforme o comportamento atual após os cálculos passarem a usar Firestore.
**Teste independente**: criação, conclusão e recarga do dashboard continuam consistentes e sem regressão visual.

- [ ] T012 [US3] Validar que a criação de tarefa continua persistindo em `users/{uid}/tasks` e que os indicadores refletem a nova tarefa após a gravação bem-sucedida.
- [ ] T013 [US3] Validar que a marcação de conclusão de uma tarefa atualiza o documento correto do usuário ativo e recomputa os indicadores sem duplicar dados.
- [ ] T014 [US3] Confirmar que a navegação por Dia/Semana/Mês, os botões, o texto do período e o layout atual continuam compatíveis com a experiência existente.

## Phase 5: Segurança e isolamento por usuário

**Objetivo**: manter a separação entre contas e impedir qualquer leitura cruzada de dados.
**Teste independente**: duas contas diferentes e usuário sem autenticação não conseguem acessar métricas de outra conta.

- [ ] T015 [US4] Validar as regras do Firestore para `users/{uid}/tasks/{taskId}` e confirmar que leitura, criação e alteração continuam restritas ao `uid` autenticado. Ajustar as regras somente se houver necessidade real.
- [ ] T016 [US4] Confirmar que usuários não autenticados não conseguem carregar nem calcular indicadores a partir de tarefas de outra conta.
- [ ] T017 [US4] Confirmar que um usuário não consegue acessar ou alterar tarefas de outra conta, mesmo por chamada direta ao Firestore.

## Phase 6: Validação final e regressão

- [ ] T018 Verificar que os indicadores do dashboard refletiram corretamente as tarefas reais do usuário autenticado.
- [ ] T019 Confirmar que não há duplicação de lista de tarefas, nem coleção, nem modelo paralelo para métricas.
- [ ] T020 Revisar o diff final para garantir que as alterações ficaram restritas ao dashboard e à integração da persistência já existente.

## Dependências e ordem

- T001 a T003 devem ocorrer antes da implementação funcional, porque fixam o contexto do dashboard e do modelo atual.
- T004 a T007 antecedem a renderização correta dos indicadores e a proteção do estado por usuário.
- T008 a T011 dependem do carregamento real das tarefas do Firestore e da lógica de períodos já existente.
- T012 a T014 dependem das mudanças de estado e da compatibilidade visual do dashboard.
- T015 a T017 dependem da segurança do Firestore e do isolamento por conta.
- T018 a T020 são verificações finais após implementação e testes.

## Observações de validação

O projeto não possui um harness automatizado para testes unitários ou integração neste momento. A validação deve ocorrer principalmente no navegador, observando o comportamento real do dashboard com autenticação ativa, tarefas reais persistidas em Firestore e pelo menos duas contas diferentes em ambiente de desenvolvimento.
