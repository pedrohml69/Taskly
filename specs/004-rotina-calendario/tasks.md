# Tasks: Rotina / Calendário do Taskly

**Input**: Documentos de design em `/specs/004-rotina-calendario/`
**Prerequisites**: `spec.md`, `plan.md`, `research.md` (quando existir), `data-model.md` (quando existir), `quickstart.md` (quando existir)

**Feature**: Integrar a rotina/calendário do dashboard com a persistência já implementada de tarefas do usuário autenticado, reutilizando a coleção `users/{uid}/tasks/{taskId}` sem criar outra fonte de dados.

## Escopo

Esta feature cobre:

- carregamento e uso das tarefas persistidas do usuário autenticado;
- renderização da rotina semanal com as tarefas organizadas por data e horário;
- persistência da conclusão e da criação de tarefas no mesmo modelo atual;
- manutenção do comportamento de navegação e layout já existentes;
- validação do isolamento por usuário e regras de segurança.

Não cobre:

- nova tela de calendário;
- redesign visual da rotina;
- nova coleção ou estrutura de tarefas;
- alteração de autenticação, projetos, quadros ou outras funcionalidades fora do dashboard.

## Phase 1: Revisão do Estado Atual e Alinhamento da Rotina

- [ ] T001 Revisar a seção de rotina em `src/scripts/dashboard.js` para confirmar que a lista de tarefas já é a base de renderização do calendário, dos indicadores e dos gráficos.
- [ ] T002 Confirmar que a autenticação do Firebase já fornece o `uid` do usuário atual antes do carregamento de tarefas e antes da atualização de conclusão.
- [ ] T003 Verificar que o modelo persistido já usado no projeto continua sendo `nome`, `data`, `horario`, `concluida`, com o documento no path `users/{uid}/tasks/{taskId}`.

## Phase 2: Carregamento da Rotina a partir do Firestore

**Objetivo**: a rotina exibe apenas as tarefas do usuário autenticado usando o mesmo modelo de persistência já implementado.
**Teste independente**: usuário autenticado com tarefas persistidas carrega a rotina corretamente; usuário sem tarefas ou com sessão trocada não vê dados de outra conta.

- [ ] T004 [US1] Ajustar o carregamento inicial em `src/scripts/dashboard.js` para consultar `collection(db, "users", usuario.uid, "tasks")` após `onAuthStateChanged` e mapear os documentos mantendo `{ id, nome, data, horario, concluida }`.
- [ ] T005 [US1] Garantir que a rotina utilize o conjunto de tarefas carregado do Firestore pelo dashboard, sem manter uma segunda lista independente ou dados de exemplo como fonte de dados.
- [ ] T006 [US1] Limpar a visualização quando a sessão terminar, trocar de conta ou ocorrer conflito de carregamento, evitando que o calendário mostre tarefas de outra conta.
- [ ] T007 [US1] Validar falhas de leitura e manter o comportamento atual de feedback de erro sem criar estado silencioso ou lista vazia falsa.

## Phase 3: Persistência da Criação e da Conclusão

**Objetivo**: criação e conclusão continuem usando a mesma estrutura de tarefa do Firestore e permaneçam visíveis na rotina.
**Teste independente**: criar tarefa, recarregar, marcar e desmarcar conclusão, confirmar visibilidade e persistência.

- [ ] T008 [US2] Confirmar que o fluxo de criação de tarefa em `dashboard.js` já grava correctamente em `users/{uid}/tasks` e que a nova tarefa aparece na rotina sem nova coleção.
- [ ] T009 [US2] Ajustar o clique da tarefa no calendário para atualizar `concluida` no documento correto do usuário ativo, sem criar outro estado local para a conclusão.
- [ ] T010 [US2] Garantir que a mudança de conclusão reinicializa a renderização do calendário e mantenha o estado persistido em Firestore.
- [ ] T011 [US2] Validar que a falha de gravação não seja reportada como sucesso e que a UI continue consistente com o estado real do banco.

## Phase 4: Navegação e Compatibilidade Visual

**Objetivo**: a rotina continua a funcionar com a mesma navegação semanal, layout e controles já existentes.
**Teste independente**: navegar para semanas anteriores e futuras; confirmar que não há regressão visual ou funcional.

- [ ] T012 [US3] Validar que os botões de navegação da semana continuam funcionando conforme o comportamento atual, sem regras novas ou alterações de layout.
- [ ] T013 [US3] Confirmar que o agrupamento por dia e horário continua funcionando com os dados do Firestore e que múltiplas tarefas compartilhando a mesma célula seguem o comportamento atual.
- [ ] T014 [US3] Verificar que os indicadores e gráficos existentes continuam recebendo os mesmos dados persistidos da conta ativa, sem implementar, redesenhar ou alterar sua lógica nesta feature.

## Phase 5: Segurança e Isolamento por Usuário

**Objetivo**: as tarefas da rotina continuam isoladas por usuário e protegidas pelas regras existentes.
**Teste independente**: duas contas diferentes, acesso cruzado e acesso sem autenticação negados.

- [ ] T015 [US4] Validar as regras de Firestore para `users/{uid}/tasks/{taskId}` e confirmar que leitura, criação e atualização continuam restritas ao `uid` da sessão autenticada. Alterar as regras somente se a validação identificar alguma necessidade real para esta feature.
- [ ] T016 [US4] Confirmar que um usuário não autenticado não consegue ler ou gravar tarefas e que as tentativas são bloqueadas.
- [ ] T017 [US4] Confirmar que um usuário não consegue acessar ou alterar tarefas de outra conta, mesmo em chamadas diretas ao Firestore.

## Phase 6: Validação Final e Regressão

- [ ] T018 Confirmar que rotina, calendário, navegação e indicadores continuam funcionando sem regressão visual ou funcional.
- [ ] T019 Confirmar que não há duplicação de fontes de dado, nem nova coleção, nem esquema paralelo de tarefas.
- [ ] T020 Revisar os arquivos alterados para assegurar que as mudanças ficaram restritas ao dashboard e à integração de persistência já existente.

## Dependências e Ordem

- T001 a T003 devem ocorrer antes da implementação funcional, porque estabelecem a base do comportamento atual e do modelo de dados.
- T004 a T007 antecedem a renderização final da rotina e a validação de carregamento da conta ativa.
- T008 a T011 dependem do carregamento de tarefas e da base do dashboard persistida.
- T012 a T014 dependem da rotina funcionando com dados reais do Firestore.
- T015 a T017 dependem das regras de segurança do Firestore e do fluxo de autenticação.
- T018 a T020 são verificações finais após implementação e testes.

## Observações de Validação

O projeto não possui harness de testes automatizados nem configuração do Emulator Suite identificada. A validação deve ocorrer no navegador, observando o comportamento real do calendário, da rotina e do dashboard com autenticação ativa e com duas contas em ambientes de desenvolvimento ou Firebase configurado.
