# Data Model: Taskly

## Visão Geral

O Taskly utilizará o Firebase Firestore para armazenar os dados da aplicação e o Firebase Authentication para autenticação dos usuários.

O Firebase Authentication será responsável pelas credenciais de acesso, incluindo a senha. A senha não deverá ser armazenada no Firestore.

O Firestore será responsável pelos dados da aplicação, incluindo usuários, configurações, projetos, quadros e tarefas.

A estrutura será organizada nas seguintes entidades:

* User
* Settings
* Project
* Board
* Task

O Dashboard não será uma entidade persistida. Ele será uma visualização dos dados existentes, principalmente das tarefas do usuário.

---

## User

**Objetivo:** Representar o perfil de um usuário autenticado.

**Coleção:**

```text
users/{uid}
```

**Campos:**

* `codigo`: string — código identificador do usuário.
* `nome`: string — nome do usuário.
* `email`: string — email utilizado pelo usuário.

**Identificação:**

O `uid` do documento será fornecido pelo Firebase Authentication e será utilizado como identificador principal do usuário.

**Exemplo:**

```json
{
  "codigo": "USR001",
  "nome": "Pedro",
  "email": "pedro@email.com"
}
```

**Observação:**

A senha não será armazenada nesta entidade. O Firebase Authentication será responsável pelo armazenamento e gerenciamento seguro das credenciais.

---

## Settings

**Objetivo:** Armazenar as preferências do usuário.

**Coleção:**

```text
settings/{uid}
```

**Campos iniciais:**

* `tema`: string — preferência entre os temas disponíveis.
* `notificacoes`: boolean — indica se as notificações estão habilitadas.
* `idioma`: string — idioma selecionado pelo usuário, quando aplicável.

**Exemplo:**

```json
{
  "tema": "dark",
  "notificacoes": true,
  "idioma": "pt-BR"
}
```

O documento utilizará o mesmo `uid` do usuário autenticado.

As configurações devem ser carregadas quando o usuário acessar as áreas que dependem dessas preferências e devem permanecer salvas mesmo após logout ou recarregamento da aplicação.

---

## Project

**Objetivo:** Representar um projeto criado pelo usuário.

**Coleção:**

```text
projects/{projectId}
```

**Campos:**

* `userId`: string — UID do proprietário.
* `nome`: string — nome do projeto.
* `descricao`: string — descrição do projeto.
* `status`: string — estado atual do projeto.

**Exemplo:**

```json
{
  "userId": "abc123",
  "nome": "Taskly",
  "descricao": "Sistema de gerenciamento de tarefas",
  "status": "Em andamento"
}
```

**Relacionamentos:**

* Um usuário pode possuir vários projetos.
* Um projeto pode possuir vários quadros.
* Um projeto pode possuir várias tarefas.

---

## Board

**Objetivo:** Representar um quadro utilizado para organizar tarefas dentro de um projeto.

**Coleção:**

```text
boards/{boardId}
```

**Campos:**

* `userId`: string — UID do proprietário.
* `projectId`: string — projeto ao qual o quadro pertence.
* `nome`: string — nome do quadro.

**Exemplo:**

```json
{
  "userId": "abc123",
  "projectId": "proj001",
  "nome": "Desenvolvimento"
}
```

**Relacionamentos:**

* Um projeto pode possuir vários quadros.
* Um quadro pode possuir várias tarefas.
* Um quadro pertence a um usuário por meio de `userId`.

---

## Task

**Objetivo:** Representar uma tarefa do usuário.

Todas as tarefas serão armazenadas na mesma entidade, independentemente de serem exibidas no Dashboard ou em um Quadro.

**Coleção:**

```text
tasks/{taskId}
```

**Campos:**

* `userId`: string — UID do usuário proprietário.
* `projectId`: string ou null — projeto relacionado à tarefa.
* `boardId`: string ou null — quadro relacionado à tarefa.
* `titulo`: string — título da tarefa.
* `descricao`: string ou null — descrição da tarefa.
* `prioridade`: string — prioridade da tarefa.
* `prazo`: timestamp ou null — prazo de entrega.
* `status`: string — situação atual da tarefa.

**Exemplo de tarefa independente:**

```json
{
  "userId": "abc123",
  "projectId": null,
  "boardId": null,
  "titulo": "Estudar para prova",
  "descricao": "Revisar conteúdo da disciplina",
  "prioridade": "Alta",
  "prazo": "2026-10-10",
  "status": "Pendente"
}
```

**Exemplo de tarefa vinculada a um quadro:**

```json
{
  "userId": "abc123",
  "projectId": "proj001",
  "boardId": "board001",
  "titulo": "Implementar login",
  "descricao": "Conectar o formulário ao Firebase Authentication",
  "prioridade": "Alta",
  "prazo": "2026-10-08",
  "status": "Em andamento"
}
```

### Regras

* `userId` deve corresponder ao usuário autenticado.
* `titulo` é obrigatório.
* `status` deve possuir um valor permitido.
* `prioridade` deve possuir um valor permitido.
* `projectId` pode ser nulo quando a tarefa não estiver relacionada a um projeto.
* `boardId` pode ser nulo quando a tarefa não estiver relacionada a um quadro.
* Quando `boardId` estiver preenchido, ele deverá corresponder a um quadro pertencente ao usuário.
* Quando `projectId` estiver preenchido, ele deverá corresponder a um projeto acessível ao usuário.

---

## Dashboard

O Dashboard não será armazenado como uma entidade independente.

Ele será construído a partir dos dados persistidos no Firestore.

As informações apresentadas no Dashboard serão obtidas principalmente a partir da entidade `Task`.

Exemplos:

* tarefas pendentes;
* tarefas concluídas;
* tarefas com prazo próximo;
* tarefas atrasadas;
* tarefas do dia;
* quantidade de tarefas por status;
* progresso das atividades.

Isso evita duplicação de dados.

---

## Relações

A estrutura principal será:

```text
User
 │
 ├─────────────── Settings
 │
 ├─────────────── Tasks
 │
 └─────────────── Projects
                    │
                    ├── Boards
                    │      │
                    │      └── Tasks
                    │
                    └── Tasks
```

Uma tarefa pode existir sem projeto ou quadro:

```text
User
 └── Task
```

Uma tarefa pode pertencer a um projeto:

```text
User
 └── Project
       └── Task
```

Uma tarefa pode pertencer a um quadro:

```text
User
 └── Project
       └── Board
             └── Task
```

---

## Estrutura do Firestore

```text
users/
  {uid}/
    codigo
    nome
    email

settings/
  {uid}/
    tema
    notificacoes
    idioma

projects/
  {projectId}/
    userId
    nome
    descricao
    status

boards/
  {boardId}/
    userId
    projectId
    nome

tasks/
  {taskId}/
    userId
    projectId
    boardId
    titulo
    descricao
    prioridade
    prazo
    status
```

---

## Firebase Authentication

As credenciais de autenticação não serão armazenadas no Firestore.

O Firebase Authentication será responsável por:

* email;
* senha;
* autenticação;
* sessão;
* UID do usuário;
* logout.

O `uid` fornecido pelo Firebase Authentication será utilizado para relacionar o usuário autenticado aos documentos do Firestore.

---

## Segurança

As Firebase Security Rules deverão garantir que cada usuário somente possa acessar e modificar os dados aos quais possui permissão.

O `userId` dos documentos deverá ser comparado com o UID do usuário autenticado.

As configurações de um usuário somente poderão ser acessadas pelo próprio usuário.

Projetos, quadros e tarefas deverão possuir regras que impeçam acesso entre usuários diferentes.

A senha nunca deverá ser armazenada em `users`, `settings` ou qualquer outra coleção do Firestore.
