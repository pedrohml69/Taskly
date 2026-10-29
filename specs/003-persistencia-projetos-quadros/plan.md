# Implementation Plan: Persistência de Projetos e Quadros

**Branch**: `003-persistencia-projetos-quadros` | **Date**: 2026-10-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-persistencia-projetos-quadros/spec.md`

## Summary

Substituir a lista fixa/em memória de projetos e os cartões/itens montados somente no DOM por registros Firestore sob `users/{uid}/projects/{projectId}`. Quadros serão subcoleção do projeto, associando-os ao proprietário pelo caminho e evitando campo de UID controlado pelo cliente.

A tela atual de board permanece como única interface. Projetos, quadros e itens serão carregados e atualizados nos controles que já existem. A persistência de tarefas no dashboard, a navegação geral, perfil, logout e estilos ficam fora das alterações.

## Technical Context

**Linguagens/Tecnologias**: HTML5, CSS3, JavaScript ES modules, Firebase Web SDK 12.4.0

**Dependências existentes**:
- Firebase Authentication e Firestore via `src/scripts/firebase-config.js`.
- Firebase Security Rules em `firestore.rules`.
- Navbar e modal de perfil injetados por `src/scripts/nav-mod.js`.

**Armazenamento**: Cloud Firestore, projetos sob `users/{uid}/projects`, quadros sob a subcoleção `projects/{projectId}/boards`.

**Autenticação**: UID emitido pelo Firebase Authentication; aguardar `onAuthStateChanged` antes de carregar ou escrever dados.

**Testes**: Não há harness ou configuração do Emulator Suite identificados. Validar fluxos no navegador e regras em ambiente Firebase de desenvolvimento ou Emulator Suite quando configurado.

**Restrições**:
- Preservar os campos de projeto e interações existentes, sem adicionar campos de status não utilizados.
- Persistir ordem e cor dos quadros porque afetam a apresentação atual.
- Preservar itens simples como textos ordenados; não convertê-los em tarefas do dashboard.
- Não confiar em UID vindo da interface; o caminho inclui o UID da sessão.
- Se a coleção estiver vazia, criar somente o contêiner neutro `Projeto 001`; não criar os projetos fixos de exemplo.
- Não modificar autenticação, dashboard de tarefas, CSS, layout ou dependências.

## Arquitetura e Fluxos

```text
Firebase Authentication
        │ onAuthStateChanged
        ▼
board.js como módulo ───────── Firebase Web SDK / firebase-config.js
        │                              │
        ├── users/{uid}/projects       ├── leitura / criação / atualização / exclusão
        └── projects/{projectId}/boards
                                       ▼
                        Firestore Security Rules por UID e projeto pai
```

### Carregamento e projetos

1. Converter a inclusão de `board.js` em `board.html` para `type="module"`; importar `auth`, `db` e as funções Firestore existentes.
2. Aguardar o usuário autenticado e consultar `users/{uid}/projects`.
3. Se a coleção estiver vazia, criar por transação o documento `project-001` com `nome: "Projeto 001"`, `descricao: ""` e `ordem: 0`; usar o mesmo ID determinístico para evitar duplicação entre abas. Não criar os três exemplos antigos.
4. Mapear os documentos usando `snapshot.id` como ID em memória e ordenar por `ordem`.
5. Restaurar uma seleção local somente após validar que pertence aos projetos do UID atual; se não houver seleção válida, selecionar o projeto disponível (incluindo o contêiner recém-criado). Compatibilizar o antigo `taskly-project-name` por nome somente entre documentos carregados.
6. Mostrar os projetos no modal existente. Selecionar projeto carrega seus quadros e atualiza o título existente.

### Quadros, itens e alterações

- Consultar `users/{uid}/projects/{projectId}/boards`, mapear ID do documento, ordenar por `ordem` e renderizar título, cor e itens.
- Criar projeto com o nome do prompt e `descricao: "Novo projeto"`; somente atualizar lista/cabeçalho após a gravação.
- Alterar o nome → salvar no Firestore → somente após sucesso atualizar lista/cabeçalho.
- Criar quadro no projeto ativo; definir `nome`, `ordem`, `cor` (sequência atual) e `itens: []`. Salvar antes de adicionar o cartão confirmado à tela.
- Persistir edição de título e exclusão de quadro por seu ID estável.
- Itens são strings ordenadas no documento do quadro. Ao adicionar/excluir, atualizar o array completo após sucesso; excluir pela ocorrência vinculada ao elemento clicado, mantendo duplicatas de mesmo texto independentes.
- Em falha de operação, não confirmar a alteração na lista local e exibir feedback compreensível usando os padrões existentes. Evitar respostas assíncronas de uma seleção anterior substituírem o projeto atualmente selecionado.
- Tratar textos vindos do Firestore como texto, usando APIs DOM seguras, sem mudar o estilo visual.

### Segurança

Adicionar regras explícitas para documentos de projeto e sua subcoleção de quadros antes da negação geral, preservando as regras existentes de perfil e tarefas. Exigir sessão e igualdade entre `request.auth.uid` e `{uid}` em todas as operações. Validar os esquemas e tipos; negar exclusão de projeto, que não existe na UI; permitir exclusão de quadro conforme controle atual. Operações de quadro devem exigir projeto pai existente no caminho daquele UID.

## Arquivos previstos

- `src/pages/board.html`: carregar `board.js` como módulo.
- `src/scripts/board.js`: importar SDK; carregar, selecionar e persistir projetos, quadros e itens; manter os componentes atuais.
- `firestore.rules`: regras de proprietário para projetos e quadros, mantendo regras atuais de perfil e tarefas.
- `specs/003-persistencia-projetos-quadros/data-model.md`: documentação do modelo observado.
- `specs/003-persistencia-projetos-quadros/contracts/firestore-projects.md`: contrato de operações e matriz de acesso.

Não são previstas alterações em `dashboard.js`, `dashboard.html`, `nav-mod.js`, CSS ou fluxo de autenticação.

## Sequência de Implementação

1. Acrescentar regras para caminhos de projeto e quadro sem enfraquecer regras existentes.
2. Converter board.js para módulo e implementar carga autenticada, criação idempotente do único contêiner quando necessário e restauração segura da seleção.
3. Ligar listagem, criação e renomeação de projeto às operações Firestore.
4. Ligar carga, criação, renomeação, exclusão de quadro e inclusão/exclusão de itens aos documentos do projeto selecionado.
5. Validar persistência, seleção, projeto vazio/inicial, falhas de gravação, duas contas e regressões da página atual.

## Critérios de Validação

- Usuário sem projeto recebe somente `Projeto 001`, selecionado e sem quadros; recargas não duplicam o contêiner.
- Criar/renomear projeto e selecionar outro projeto mantém a lista e os quadros certos após recarregar.
- Quadros e itens permanecem com nomes, ordem, cores e conteúdo após recarregar.
- Remoções no fluxo existente são refletidas no Firestore; falhas não são apresentadas como sucesso.
- Regras negam acesso não autenticado e acesso cruzado por UID, inclusive em chamadas diretas.
- Layout, controles, perfil, logout, modo noturno e tarefas do dashboard não sofrem regressão.
