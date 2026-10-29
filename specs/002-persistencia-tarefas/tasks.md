# Tasks: Persistência de Tarefas no Firestore

**Input**: Documentos de design em `/specs/002-persistencia-tarefas/`
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/firestore-tasks.md`, `quickstart.md`

**Feature**: Persistir tarefas do dashboard na subcoleção Firestore do usuário autenticado, preservando o frontend e o comportamento atual.

## Escopo

Esta feature cobre:

- Leitura e criação de tarefas no caminho `users/{uid}/tasks/{taskId}`;
- Persistência da conclusão marcada no calendário;
- Isolamento das tarefas pelas Firebase Security Rules;
- Revalidação de calendário, indicadores, carga de tarefas e fluxos atuais.

Não cobre edição de nome/data/horário, exclusão, migração de exemplos, colaboração ou alterações visuais.

## Phase 1: Regras e Contrato de Acesso

- [x] T001 Adicionar regra explícita para `users/{uid}/tasks/{taskId}` em `firestore.rules`,permitindo leitura, criação e atualização apenas quando `request.auth.uid == uid`, validando schema e tipos (`nome`, `data`, `horario`, `concluida`), permitindo update somente de `concluida`, negando exclusão e preservando as regras atuais de perfil e negação geral.

## Phase 2: História 1 - Persistir e Carregar Minhas Tarefas (P1)

**Objetivo**: As tarefas da conta autenticada permanecem disponíveis após recarregar, sem exibir exemplos ou dados de outra conta.
**Teste independente**: Conta vazia carrega lista vazia; criar uma tarefa e recarregar retorna os mesmos campos e ID.

- [x] T002 [US1] Alterar a inclusão de `dashboard.js` em `src/pages/dashboard.html` para `type="module"` e importar `auth`, `db` e as funções Firebase necessárias de `src/scripts/firebase-config.js` e dos módulos Firebase existentes.
- [x] T003 [US1] Remover a lista fixa de exemplos e iniciar `tarefas` vazia em `src/scripts/dashboard.js`; observar o estado de autenticação, consultar somente `users/{uid}/tasks` após obter o usuário e mapear cada documento para `{ id: snapshot.id, nome, data, horario, concluida }`.
- [x] T004 [US1] Limpar as tarefas exibidas quando a sessão terminar ou mudar; renderizar calendário e gráficos após o carregamento da conta atual e informar falhas de leitura sem tratar erro como coleção vazia nem usar exemplos como fallback.
- [x] T005 [US1] Substituir o `push` em memória do handler existente de `saveTask` em `src/scripts/dashboard.js` por criação Firestore com `nome`, `data`, `horario` e `concluida: false`; somente após sucesso adicionar o documento com o ID Firestore ao estado, fechar o modal e atualizar as views; em falha, manter a tarefa não salva e informar o usuário.
- [ ] T006 [US1] Validar no navegador conta sem documentos, criação de tarefa válida, persistência após recarga, campos preservados, ID estável e ausência de duplicação; confirmar que os dados aparecem no calendário e nos indicadores existentes.

## Phase 3: História 2 - Persistir a Conclusão (P1)

**Objetivo**: Marcar e desmarcar uma tarefa persiste e continua refletido nas views já existentes.
**Teste independente**: Alternar conclusão, recarregar e confirmar o mesmo estado e os totais correspondentes.

- [x] T007 [US2] Atualizar o handler de clique da tarefa em `src/scripts/dashboard.js` para gravar `concluida` no documento do UID ativo antes de confirmar a mudança local e redesenhar calendário e gráficos; em falha, manter/restaurar o valor anterior e exibir mensagem compreensível.
- [ ] T008 [US2] Validar que marcar e desmarcar conclusão persiste após recarregar e que os indicadores de conclusão e carga continuam usando os dados atualizados da conta ativa.

## Phase 4: História 3 - Isolar os Dados por Usuário (P1)

**Objetivo**: Somente o proprietário autenticado pode ler ou alterar documentos sob seu UID.
**Teste independente**: Com duas contas, cada uma vê os próprios documentos; tentativas diretas de acesso cruzado e não autenticado são negadas.

- [ ] T009 [US3] Validar as regras Firestore com pelo menos duas contas: permitir leitura/criação/atualização no próprio caminho, negar exclusão inclusive ao proprietário, negar todas as operações para caminhos de outro UID e negar todas as operações sem autenticação; confirmar que update altera somente `concluida`.

## Phase 5: Regressão e Revisão

- [ ] T010 Confirmar que calendário semanal, validações atuais do modal, gráficos de conclusão/carga, perfil, logout, navegação e modo noturno continuam funcionando sem alteração visual.
- [x] T011 Revisar os arquivos alterados para confirmar que nenhum UID é aceito do estado fornecido pelo cliente como autoridade, nenhuma credencial é salva e não foram adicionadas dependências ou mudanças fora do escopo.

## Dependências e Ordem

- T001 deve ser concluída antes de validar as operações Firestore do dashboard em um ambiente com regras aplicadas.
- T002 precede T003, T004, T005 e T007, pois a integração usa módulos ES.
- T003 precede T004, T005 e T007, que dependem do estado carregado e do UID ativo.
- T006 depende da conclusão de T002 a T005.
- T008 depende de T007; T009 depende de T001.
- T010 e T011 são verificações finais após as histórias implementadas.

## Observações de Validação

O projeto não possui harness de testes nem configuração do Emulator Suite identificados nos documentos de pesquisa. Executar os cenários pelo navegador e validar as regras no ambiente de desenvolvimento Firebase; se o Emulator Suite for configurado, usá-lo para automatizar a matriz de acesso.
