# Tasks: Autenticação e Conta do Usuário

**Input**: Design documents from `/specs/001-autenticacao-usuario/`
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/firebase-auth.md`

**Feature**: Fazer o sistema de cadastro, login, sessão, logout, perfil e configurações funcionar utilizando o frontend existente e Firebase.

## Escopo desta feature

Esta feature será responsável por:

- Cadastro de usuário;
- Login com email e senha;
- Controle da sessão autenticada;
- Proteção das páginas privadas;
- Identificação do usuário atualmente autenticado;
- Exibição dos dados reais do usuário no perfil;
- Logout;
- Configurações existentes;
- Segurança do perfil no Firestore;
- Validação dos fluxos de autenticação.

Não fazem parte desta feature:

- Persistência de tarefas;
- Persistência de projetos;
- Persistência de quadros;
- Persistência de itens dos quadros;
- Sistema funcional de notificações;
- Recuperação de senha;
- Login social;
- MFA;
- Colaboração entre usuários.

---

## Phase 1: Verificar a integração Firebase existente

- [ ] T001 Confirmar que `firebase-config.js` inicializa corretamente Firebase Authentication e Firestore.
- [ ] T002 Confirmar que o provedor Email/Password está habilitado no Firebase Authentication.
- [ ] T003 Confirmar que o cadastro existente em `register.js` cria o usuário no Firebase Authentication.
- [ ] T004 Confirmar que o cadastro existente cria o perfil em `users/{uid}/profile/main`.
- [ ] T005 Confirmar que o perfil utiliza os campos atuais `name`, `email`, `createdAt` e `updatedAt`.
- [ ] T006 Confirmar que a senha não é armazenada no Firestore.
- [ ] T007 Corrigir somente problemas encontrados na integração existente, sem alterar a estrutura visual das páginas.

---

## Phase 2: Implementar Login

- [ ] T008 Criar a lógica de login utilizando Firebase Authentication com email e senha.
- [ ] T009 Conectar a lógica de login ao formulário existente em `login.html`.
- [ ] T010 Validar email e senha antes de realizar a tentativa de autenticação.
- [ ] T011 Tratar credenciais inválidas com uma mensagem compreensível ao usuário.
- [ ] T012 Tratar erros de conexão e demais erros relevantes do Firebase Authentication.
- [ ] T013 Redirecionar o usuário para `dashboard.html` após login realizado com sucesso.
- [ ] T014 Impedir o envio normal do formulário quando os dados forem inválidos.

---

## Phase 3: Controle de sessão

- [ ] T015 Criar uma lógica compartilhada para verificar o estado de autenticação do Firebase.
- [ ] T016 Verificar a sessão do usuário ao abrir páginas protegidas.
- [ ] T017 Redirecionar usuários não autenticados para `login.html`.
- [ ] T018 Permitir acesso ao dashboard somente quando existir usuário autenticado.
- [ ] T019 Permitir que a sessão continue válida após recarregar a página.
- [ ] T020 Tratar corretamente uma sessão inválida ou encerrada.
- [ ] T021 Aplicar a verificação de autenticação às páginas privadas existentes do Taskly.

---

## Phase 4: Usuário atualmente autenticado

- [ ] T022 Obter o usuário atualmente autenticado através do Firebase Authentication.
- [ ] T023 Utilizar o `uid` do usuário autenticado para localizar seu perfil no Firestore.
- [ ] T024 Buscar o documento `users/{uid}/profile/main`.
- [ ] T025 Substituir os dados fixos de `Tasklo` pelo nome e email do usuário autenticado.
- [ ] T026 Atualizar a área de perfil existente para exibir os dados reais do usuário.
- [ ] T027 Atualizar os elementos de identificação do usuário no dashboard e menu quando aplicável.
- [ ] T028 Tratar corretamente a situação em que o perfil não for encontrado.

---

## Phase 5: Logout

- [ ] T029 Adicionar uma ação de logout ao menu/área de usuário existente.
- [ ] T030 Implementar o logout utilizando Firebase Authentication.
- [ ] T031 Após o logout, redirecionar o usuário para `login.html`.
- [ ] T032 Garantir que páginas protegidas não possam continuar sendo acessadas após o logout.
- [ ] T033 Garantir que uma nova tentativa de acessar uma página protegida após o logout redirecione para o login.

---

## Phase 6: Perfil e configurações

- [ ] T034 Manter a estrutura visual existente do modal de perfil.
- [ ] T035 Substituir os dados fixos do perfil pelos dados do usuário autenticado.
- [ ] T036 Manter a aba de configurações existente.
- [ ] T037 Manter o funcionamento do modo noturno utilizando `localStorage`.
- [ ] T038 Garantir que a preferência de modo noturno continue sendo aplicada após recarregar a página.
- [ ] T039 Manter o controle visual de notificações sem implementar um sistema funcional de notificações nesta feature.
- [ ] T040 Evitar criar uma coleção de configurações no Firestore enquanto não houver necessidade de persistir configurações adicionais.

---

## Phase 7: Segurança do perfil

- [ ] T041 Criar ou ajustar as Firebase Security Rules para proteger os documentos de perfil.
- [ ] T042 Permitir que um usuário autenticado leia somente seu próprio perfil.
- [ ] T043 Permitir que um usuário autenticado altere somente seu próprio perfil, quando a operação for disponibilizada pela aplicação.
- [ ] T044 Impedir acesso de usuários não autenticados aos perfis.
- [ ] T045 Garantir que o acesso ao perfil utilize o `uid` autenticado como referência.
- [ ] T046 Validar as regras utilizando pelo menos duas contas diferentes.

---

## Phase 8: Validação do fluxo completo

- [ ] T047 Testar cadastro com dados válidos.
- [ ] T048 Testar cadastro utilizando email já registrado.
- [ ] T049 Testar cadastro com senha inválida.
- [ ] T050 Testar cadastro com confirmação de senha diferente.
- [ ] T051 Testar login com credenciais válidas.
- [ ] T052 Testar login com senha incorreta.
- [ ] T053 Testar login com email inválido.
- [ ] T054 Testar acesso ao dashboard sem autenticação.
- [ ] T055 Testar permanência da sessão após recarregar a página.
- [ ] T056 Testar exibição do nome e email do usuário autenticado.
- [ ] T057 Testar logout.
- [ ] T058 Testar tentativa de retornar a uma página protegida após logout.
- [ ] T059 Testar modo noturno e sua persistência local.
- [ ] T060 Testar isolamento do perfil entre duas contas diferentes.
- [ ] T061 Verificar que as funcionalidades existentes do dashboard e board continuam funcionando após a integração da autenticação.
- [ ] T062 Verificar que a integração não altera desnecessariamente o HTML/CSS e a identidade visual existentes.

---

## Phase 9: Revisão final

- [ ] T063 Revisar os arquivos modificados e remover código duplicado ou desnecessário relacionado à autenticação.
- [ ] T064 Confirmar que não existem senhas ou dados sensíveis armazenados no código ou Firestore.
- [ ] T065 Confirmar que não foram introduzidas dependências ou frameworks desnecessários.
- [ ] T066 Confirmar que o fluxo Cadastro → Login → Dashboard → Perfil → Logout está funcionando.
- [ ] T067 Confirmar que todas as páginas protegidas possuem verificação de autenticação.
- [ ] T068 Confirmar que os critérios de aceitação definidos em `spec.md` estão atendidos.