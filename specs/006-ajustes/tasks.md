---
description: "Task list for Ajustes Gerais do Taskly"
---

# Tasks: Ajustes Gerais do Taskly

**Input**: Documentos de design em `/specs/006-ajustes/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`

**Feature**: Verificação de e-mail, redefinição em páginas do Taskly, rotina 04:00-03:00 e integração de projetos do Board.

## Escopo

Inclui verificação de e-mail com proteção de páginas/dados privados, solicitação e conclusão de redefinição com códigos Firebase, datas civis corretas no ciclo diário e consulta de projetos/quadros/itens atuais.

Não inclui um sistema de autenticação próprio, armazenamento de senhas/códigos no Firestore, nova coleção de associações, migração de tarefas, duplicação de projetos/quadros, redesign ou compartilhamento de projetos.

## Phase 1: Setup

**Objetivo**: confirmar configurações externas e registrar o estado real do projeto antes das alterações.

- [ ] T001 [P] Confirmar no Firebase Console Email/Password, proteção contra enumeração de e-mails, domínios autorizados e URLs de ação personalizadas para verificação e redefinição; registrar pré-requisitos em `specs/006-ajustes/quickstart.md`.
- [X] T002 [P] Revisar os arquivos de cadastro/login, páginas privadas, Dashboard, Board, singleton Firebase e regras; registrar implementações reutilizáveis em `specs/006-ajustes/plan.md`.

## Phase 2: Foundational

**Objetivo**: garantir que as novas telas usem a instância e a política de rotas compartilhadas existentes.

- [X] T003 Conectar a lista de páginas privadas ao guard existente e garantir que as páginas de autenticação/ação permaneçam públicas em `src/scripts/auth-guard.js`, `src/pages/dashboard.html` e `src/pages/board.html`; reutilizar `auth` e `db` de `src/scripts/firebase-config.js` sem inicializar outra instância.

---

## Phase 3: User Story 1 - Verificar o e-mail após o cadastro (Priority: P1) - MVP

**Goal**: enviar a verificação, permitir reenvio e liberar páginas/dados privados somente após a conta ser verificada.

**Independent Test**: cadastrar uma conta única, receber/re-enviar a mensagem, verificar por link válido, voltar ao app e acessar o Dashboard; testar link inválido/expirado, estado não verificado e escrita direta nas regras.

- [X] T004 [US1] Enviar e-mail de verificação após criar conta e perfil em `src/scripts/register.js`; se o envio falhar, manter a conta criada e direcionar para nova tentativa sem recriar usuário nem perfil.
- [X] T005 [US1] Criar a tela de espera/verificação com e-mail, estados de envio, sucesso/erro, reenvio, atualização de estado e retorno ao login em `src/pages/verify-email.html`, reutilizando `src/styles/css/login.css`.
- [X] T006 [US1] Implementar o tratamento do link `verifyEmail`, validar/aplicar seu código e atualizar o usuário autenticado em `src/scripts/verify-email.js`; tratar código inválido, expirado ou já consumido.
- [X] T007 [US1] Implementar reenvio com feedback e controle de tentativas, além de `reload()` e atualização do token para reconhecer `emailVerified` após verificação noutra aba/dispositivo, em `src/scripts/verify-email.js`.
- [X] T008 [US1] Implementar o login email/senha em `src/scripts/login.js` e rotear usuários não verificados para `src/pages/verify-email.html`, preservando o acesso de volta após confirmar o endereço.
- [X] T009 [US1] Implementar em `src/scripts/auth-guard.js` o bloqueio de Dashboard/Board para usuário não verificado, com espera por estado de autenticação e atualização do usuário antes da decisão.
- [X] T010 [US1] Atualizar `firestore.rules` para exigir UID proprietário e `request.auth.token.email_verified == true` em tarefas, projetos e quadros; permitir apenas a criação do perfil próprio antes da verificação e restringir leitura/alteração privada conforme `specs/006-ajustes/data-model.md`.
- [ ] T011 [US1] Validar cadastro, criação única do perfil, reenvio, links válido/inválido/expirado, atualização de sessão, bloqueio de páginas e negação de acesso Firestore não verificado; registrar resultado em `specs/006-ajustes/quickstart.md`.

**Checkpoint**: a conta e seu perfil são criados uma única vez, o estado de verificação vem do Firebase Authentication e o usuário não verificado não acessa dados privados.

---

## Phase 4: User Story 2 - Redefinir a senha em uma página do Taskly (Priority: P1)

**Goal**: solicitar redefinição e concluir a troca da senha em uma tela do Taskly, inclusive para contas sem e-mail verificado.

**Independent Test**: usar conta de teste ainda não verificada, pedir link, abrir página própria, validar código e campos, trocar senha e entrar com a nova; repetir com códigos inválido/expirado/usado.

- [X] T012 [US2] Substituir o link placeholder de recuperação por navegação à página de solicitação em `src/pages/login.html`.
- [X] T013 [US2] Criar a página de solicitação com campo de e-mail, validação, carregamento, sucesso/erro e retorno ao login em `src/pages/forgot-password.html`, reutilizando os estilos de login existentes.
- [X] T014 [US2] Implementar `sendPasswordResetEmail` com URL de continuação da Taskly, validação do endereço e resposta genérica que não revele existência da conta em `src/scripts/forgot-password.js`.
- [X] T015 [US2] Criar a página própria de redefinição com nova senha, confirmação, controles mostrar/ocultar, envio/carregamento, mensagens e retorno ao login em `src/pages/reset-password.html`.
- [X] T016 [US2] Ler `mode` e `oobCode` do link e validar o código com `verifyPasswordResetCode` antes de habilitar a redefinição em `src/scripts/reset-password.js`; tratar código inválido, expirado ou já utilizado.
- [X] T017 [US2] Validar mínimo de seis caracteres e igualdade entre senha/confirmar senha, mantendo o texto ao alternar visibilidade, em `src/scripts/reset-password.js`.
- [X] T018 [US2] Atualizar a senha com `confirmPasswordReset`, limpar o estado sensível da página e apresentar sucesso com retorno ao login em `src/scripts/reset-password.js`; não exigir `emailVerified` nessa rota pública.
- [ ] T019 [US2] Validar solicitação com endereço malformado/inexistente, conta não verificada, links válido/inválido/expirado/usado, erros de rede, confirmação divergente e login com a nova senha; registrar em `specs/006-ajustes/quickstart.md`.

**Checkpoint**: o código é validado pelo Firebase, a senha é atualizada sem persistir código/senha no Firestore e o fluxo funciona sem verificação prévia do e-mail.

---

## Phase 5: User Story 3 - Organizar a rotina em ciclo 04:00-03:00 (Priority: P1)

**Goal**: exibir 24 horas consecutivas por ciclo e posicionar tarefas após a meia-noite na data civil seguinte, sem migrar documentos existentes.

**Independent Test**: conferir as 24 linhas, tarefas às 23:00 e 00:00-03:00, criação às 01:00, navegação semanal, indicadores e documentos antes/depois.

- [X] T020 [US3] Confirmar e preservar a sequência de `obterHorasRotina()` de 04:00-23:00 seguida por 00:00-03:00 em `src/scripts/dashboard.js`.
- [X] T021 [US3] Derivar a data civil efetiva da célula: data da coluna para 04:00-23:00 e dia seguinte para 00:00-03:00; usar a data efetiva no filtro de tarefas em `src/scripts/dashboard.js`.
- [X] T022 [US3] Passar a data civil efetiva da célula ao modal de criação em 00:00-03:00 e manter os campos existentes `nome`, `data`, `horario`, `concluida` em `src/scripts/dashboard.js`.
- [ ] T023 [US3] Validar navegação semanal, tarefas anteriores à meia-noite, criação de madrugada, conclusão e indicadores; confirmar que documentos preexistentes não foram alterados, perdidos ou duplicados e registrar em `specs/006-ajustes/quickstart.md`.

**Checkpoint**: ciclo e data civil são contínuos, com registros antigos intactos.

---

## Phase 6: User Story 4 - Consultar projetos do Board na rotina (Priority: P1)

**Goal**: associar projetos originais a horários, consultar quadros/itens atuais e remover a associação sem excluir os dados do Board.

**Independent Test**: associar múltiplos projetos, incluindo mesmo horário, expandir quadros/itens, alterar associação, recarregar e remover; verificar persistência e isolamento entre contas.

- [X] T024 [US4] Manter a associação no campo opcional `rotina.horario` do projeto em `users/{uid}/projects/{projectId}`; não criar `scheduledProjects`, conforme `specs/006-ajustes/data-model.md`.
- [X] T025 [US4] Carregar e listar apenas projetos do UID autenticado em `src/scripts/dashboard.js`, validando seleção pelos documentos da conta atual.
- [X] T026 [US4] Persistir e alterar apenas `rotina.horario` no documento original do projeto e atualizar a interface somente após sucesso em `src/scripts/dashboard.js`.
- [X] T027 [US4] Expandir a entrada da rotina para exibir todos os quadros e itens ordenados consultados da subcoleção original em `src/scripts/dashboard.js` e `src/pages/dashboard.html`; inserir conteúdo como texto, sem HTML vindo de dados.
- [X] T028 [US4] Tratar projetos sem quadros/itens e referências inválidas sem interromper os demais; garantir que mudanças no Board sejam refletidas ao recarregar a rotina em `src/scripts/dashboard.js`.
- [X] T029 [US4] Remover somente o campo `rotina` com `deleteField()` e confirmar que o projeto, quadros e itens continuam no Board em `src/scripts/dashboard.js`.
- [X] T030 [US4] Validar `rotina.horario` como hora real de `00:00` a `23:59` em `firestore.rules`, mantendo proprietário e claim verificado.
- [ ] T031 [US4] Testar associação, alteração, mesmo horário, recarga, conteúdo atualizado, remoção sem exclusão e isolamento com duas contas; registrar em `specs/006-ajustes/quickstart.md`.

**Checkpoint**: associação no projeto original, conteúdo atual no Dashboard, remoção não destrutiva e acesso isolado.

---

## Phase 7: Polish e validação cruzada

**Objetivo**: confirmar os fluxos completos e evitar regressões fora das histórias individuais.

- [ ] T032 Executar o fluxo completo de verificação e acesso privado descrito em `specs/006-ajustes/quickstart.md`, incluindo retorno após verificar em outra aba/dispositivo.
- [ ] T033 Executar o fluxo completo de redefinição do `specs/006-ajustes/quickstart.md` em conta verificada e não verificada, confirmando que senhas/códigos não são persistidos.
- [ ] T034 Executar os cenários de ciclo e dados preexistentes do `specs/006-ajustes/quickstart.md`, incluindo navegação, indicadores e virada de data.
- [ ] T035 Executar os cenários Board/Dashboard e regras do `specs/006-ajustes/quickstart.md` com duas contas; usar Emulator Suite somente se estiver configurado.
- [ ] T036 Regressar cadastro, login, logout, tarefas, projetos, quadros, calendário e indicadores em viewport desktop/móvel e atualizar `specs/006-ajustes/quickstart.md` com dependências/configurações externas efetivamente verificadas.
- [ ] T037 Revisar alterações em `src/`, `firestore.rules` e `specs/006-ajustes/` para confirmar ausência de coleções paralelas, tokens/senhas persistidos, dependências extras e mudanças visuais fora do escopo.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: confirmar domínio, templates e opções do Firebase antes de testar links de ação.
- **Foundational (Phase 2)**: os módulos novos reutilizam o singleton e as páginas privadas carregam o guard antes das histórias.
- **US1 (Phase 3)**: primeiro incremento funcional; estabelece verificação e acesso condicionado.
- **US2 (Phase 4)**: independente da rotina/Board, mas compartilha `login.html` e `login.js` com US1; integrar depois da base de login.
- **US3 (Phase 5)**: depende da revisão do modelo civil de tarefas.
- **US4 (Phase 6)**: depende do modelo `rotina.horario`; integra no mesmo `dashboard.js` da US3 e deve considerar sua regra de datas.
- **Polish (Phase 7)**: depende das histórias a entregar.

### User Story Dependencies

- **US1 (P1)**: MVP recomendado; não depende das outras histórias.
- **US2 (P1)**: depende da estrutura base de login/rotas públicas de US1; redefinição permanece acessível mesmo sem verificação.
- **US3 (P1)**: independente das histórias de autenticação após Setup/Foundational.
- **US4 (P1)**: independente da autenticação funcional após Setup/Foundational, mas sua renderização deve ser integrada após a regra civil da US3 por compartilharem `dashboard.js`.

### Parallel Opportunities

- T001 e T002 podem ser feitos em paralelo.
- Após a fundação, US3 pode avançar em paralelo com US1/US2 se arquivos diferentes forem atribuídos.
- US1 e US2 compartilham `login.html`/`login.js`; concluir a base de login de US1 antes da ação de recuperação de US2.
- US3 e US4 compartilham `dashboard.js`; não editar o arquivo simultaneamente e integrar a associação após o mapeamento de data da US3.
- Revisão de `firestore.rules` pode ser feita em paralelo com a construção visual das páginas, após concordar sobre `email_verified` e o formato do projeto.

## Implementation Strategy

Entregar US1 como primeiro MVP, pois a política de acesso depende da verificação de e-mail. Em seguida concluir US2, depois US3 e US4 em ordem integrada. Validar cada história pelo seu teste independente e executar a regressão final no navegador. Não introduzir harness ou Emulator Suite sem configuração existente; registrar claramente qualquer etapa que dependa do Firebase Console.
