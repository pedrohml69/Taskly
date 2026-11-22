# Implementation Plan: Kanban Fixo e Ajustes na Navbar

**Branch**: `007-kanban-fixo-navbar` | **Date**: 2026-11-22 | **Spec**: [spec.md](spec.md)

## Summary

Adaptar o Board existente ao modelo Kanban por projeto usando a subcoleção já utilizada em `users/{uid}/projects/{projectId}/boards`. Fazer, Fazendo e Feito serão documentos fixos por projeto; Revisar será documentada somente quando adicionada pelo usuário.

Os textos das tarefas continuarão representados pelo array `itens` já persistido em cada documento de quadro. Os documentos antigos de quadros personalizados permanecerão intocados no Firestore e não serão exibidos nem migrados. O ajuste da navbar será limitado ao pseudo-elemento da opção ativa.

## Technical Context

**Linguagens/Tecnologias**: HTML5, CSS3, JavaScript ES modules, Firebase Web SDK 12.4.0.

**Estrutura atual**:
- `board.html` mantém o cabeçalho do projeto, o modal de projetos e o botão visual já usado para adicionar cartões.
- `board.js` já gerencia autenticação, projetos, seleção, Firestore, carregamento de quadros, itens e transações de movimentação.
- `board.css` contém os cartões, cores, botão de adicionar, estados de arrastar e responsividade.
- `nav-mod.js` cria a navbar compartilhada das páginas Dashboard e Board.
- `nav-mod.css` define o indicador ativo.
- `dashboard.js` persiste tarefas em `users/{uid}/tasks/{taskId}`.
- `firestore.rules` já protege perfil, tarefas e projetos/quadros por UID.

**Observação do estado atual**:
- A interface HTML/CSS do Board continua baseada nos componentes originais.
- O código atual já possui constantes e fluxos parciais para colunas fixas, mas ainda reutiliza a estrutura de quadros genérica.
- A implementação final deverá reconciliar o comportamento de criação de quadros, renomeação, exclusão e filtro de documentos antigos para aplicar de forma inequívoca o modelo fixo.

## Constitution Check

| Restrição | Decisão |
|---|---|
| Não redesenhar | Reutilizar `.board-card`, `.board-items`, `.board-item`, `.add-card`, modal e classes de cor existentes. |
| Mudanças mínimas | Alterar principalmente `board.js`, ajustes pontuais em `board.html`, `board.css`, `nav-mod.css` e `firestore.rules`. |
| Não afetar Dashboard | Não alterar `dashboard.js`, `users/{uid}/tasks` ou suas regras. |
| Não migrar dados antigos | Não consultar/exibir nem copiar documentos personalizados antigos. |
| Sem autenticação nova | Continuar aguardando `onAuthStateChanged` e usando o UID da sessão. |

## Modelo de Dados Planejado

O caminho continua sendo:

```text
users/{uid}/projects/{projectId}/boards/{boardId}
```

IDs reservados:

| ID | Nome | Ordem | Cor | Obrigatória |
|---|---|---:|---|---|
| `kanban-fazer` | Fazer | 0 | `quadro-azul` | Sim |
| `kanban-fazendo` | Fazendo | 1 | `quadro-amarelo` | Sim |
| `kanban-feito` | Feito | 2 | `quadro-vermelho` | Sim |
| `kanban-revisar` | Revisar | 3 | classe visual já usada | Não |

Documento de coluna:

```json
{
  "nome": "Fazer",
  "ordem": 0,
  "cor": "quadro-azul",
  "itens": []
}
```

As tarefas continuam sendo strings ordenadas em `itens`. Não será criada coleção separada para tarefas do Kanban nem vínculo com `users/{uid}/tasks`.

Documentos antigos serão ignorados pelo filtro de IDs aceitos pelo novo Board. Não serão removidos, renomeados ou convertidos.

## Arquitetura de Implementação

### 1. Inicialização por projeto

Ao selecionar ou restaurar um projeto:

1. Consultar somente `users/{currentUid}/projects/{projectId}/boards`.
2. Garantir por transação os três documentos fixos.
3. Criar somente documentos inexistentes; nunca substituir itens já existentes.
4. Restaurar também `kanban-revisar` quando ele existir.
5. Filtrar qualquer outro `boardId` no cliente.
6. Ordenar por `ordem` e renderizar com os componentes atuais.

O uso de IDs determinísticos evita que recargas ou abas criem colunas duplicadas.

### 2. Tarefas e movimentação

Manter o fluxo atual:

- Prompt existente cria uma string em `itens`.
- O clique de exclusão remove pela ocorrência no índice, preservando itens duplicados.
- Drag-and-drop move o índice entre os arrays `itens` das duas colunas.
- A movimentação deve usar transação Firestore para ler os dois documentos e atualizar seus arrays atomicamente.
- Atualizações locais só devem ser confirmadas após sucesso Firestore.
- A seleção anterior não pode aplicar resposta assíncrona ao projeto atualmente ativo.

Não adicionar campos como status, prazo ou vínculo com Dashboard; isso mantém compatibilidade com o modelo atual.

### 3. Coluna Revisar

Adicionar Revisar cria com ID `kanban-revisar`, `nome: "Revisar"`, `ordem: 3`, uma cor reutilizada do visual atual e `itens: []`.

O botão existente `#addProject` será usado como controle de adicionar Revisar. Ele deve deixar de criar quadros arbitrários e deve ficar oculto enquanto Revisar existir.

Remover Revisar:

1. Exibir confirmação antes da operação.
2. Informar que a coluna e suas tarefas serão excluídas.
3. Remover o documento `kanban-revisar` do projeto ativo.
4. Confirmar visualmente a remoção somente após sucesso Firestore.
5. Não mover ou preservar automaticamente tarefas da coluna removida.

### 4. Restrições das colunas fixas

Os três IDs fixos serão somente leitura na interface:

- Não oferecem botão de excluir.
- Não oferecem edição do título.
- Não podem ser renomeados por handlers existentes.

Documentos antigos com outros IDs não deverão ser exibidos. Nenhum botão atual permitirá criar, renomear ou remover quadros personalizados.

### 5. Security Rules

Preservar todas as regras de perfil e tarefas existentes.

Aumentar a validação da subcoleção de quadros:

- Exigir usuário autenticado, UID igual ao caminho e projeto pai existente.
- Validar `nome`, `ordem`, `cor` e `itens`.
- Permitir criação dos três IDs fixos com nomes, ordem e cor reservados.
- Permitir criar Revisar somente com o ID reservado e seus dados válidos.
- Permitir atualização de uma coluna somente para mudar `itens`.
- Proibir alteração de `nome`, `ordem` ou `cor` nas quatro colunas reservadas.
- Proibir exclusão das três colunas fixas.
- Permitir exclusão de Revisar.
- Não alterar regras de `users/{uid}/tasks`.

Os IDs personalizados antigos podem permanecer como documentos existentes sem migração. Regras futuras não precisam transformá-los nem criá-los por operações do novo Board.

### 6. Navbar

O ajuste será concentrado no pseudo-elemento `.links a::before` compartilhado:

- Preservar largura, cor `var(--tab-active)`, raio e forma atuais.
- Ajustar altura e posição vertical somente o necessário para o fundo cobrir toda a altura das letras.
- Reutilizar o mesmo posicionamento em `board.css` e `nav-mod.css`, evitando diferenças entre páginas.
- Manter a centralização horizontal atual.
- Não alterar `nav`, sua altura, padding, logo, links, perfil ou estado móvel.
- No breakpoint móvel, continuar ocultando o indicador porque o menu já utiliza o layout atual.

Como o Board importa tanto `board.css` quanto `nav-mod.css`, a alteração não deve causar conflito de regras equivalentes. O plano é corrigir ambos ou remover a duplicação de `.links a::before` no CSS do Board, preferindo `nav-mod.css` como fonte compartilhada.

## Arquivos Necessários

| Arquivo | Alteração planejada |
|---|---|
| `src/pages/board.html` | Ajustar o texto/título/acessibilidade do controle existente para a ação de adicionar ou remover Revisar, sem recriar a interface. |
| `src/scripts/board.js` | Separar IDs reservados da estrutura genérica, garantir colunas fixas, filtrar dados antigos, controlar Revisar e impedir alterações nas colunas obrigatórias. |
| `src/styles/css/board.css` | Ajustar somente estilos necessários para alinhamento visual do novo estado ou pseudo-elemento da navbar, sem redesenhar o Board. |
| `src/styles/css/nav-mod.css` | Ajustar apenas `.links a::before` no desktop. |
| `firestore.rules` | Restringir criação/atualização/exclusão das colunas reservadas. |
| `specs/007-kanban-fixo-navbar/*` | Registrar especificação, modelo e contratos da feature. |

Arquivos fora do escopo:

- `src/scripts/dashboard.js`
- `src/pages/dashboard.html`
- `src/styles/css/dashboard.css`
- `src/scripts/firebase-config.js`
- `src/scripts/auth-guard.js`
- arquivos de autenticação e perfil

## Impactos e Riscos

| Risco | Mitigação |
|---|---|
| Existem documentos antigos e novos na mesma subcoleção | Filtrar estritamente pelos IDs reservados no cliente. |
| Colunas fixas podem ser gravadas com nome/cor incorretos por dados legados | Validar e normalizar somente no carregamento; Security Rules impedir alterações inválidas futuras. |
| Remoção de Revisar pode perder tarefas | Confirmar antes da exclusão e deixar essa ação explícita na UI. |
| Resposta assíncrona de projeto anterior pode sobrescrever tela atual | Manter geração atual de carregamento e UID/projeto ativo nas verificações. |
| Movimento simultâneo pode perder atualização | Usar transação Firestore sobre origem e destino. |
| Duplicação de CSS da navbar | Centralizar `.links a::before` em `nav-mod.css` e evitar CSS conflitante no Board. |

## Estratégia de Testes

### Fluxos manuais

- Conta sem projetos recebe `Projeto 001` e três colunas vazias sem documentos personalizados novos.
- Projeto criado recebe três colunas vazias independentemente de outros projetos.
- Fazer, Fazendo e Feito não podem ser renomeados ou removidos.
- Revisar pode ser adicionada uma vez e removida após confirmação.
- Remover Revisar com tarefas exclui o documento e as tarefas.
- Tarefa criada em cada coluna persiste após recarregar.
- Drag-and-drop remove o item da origem e acrescenta ao destino.
- Itens com nomes duplicados são removidos pela ocorrência correta.
- Voltar ao projeto restaura a configuração de Revisar e os itens.

### Dados antigos

- Documentos personalizados existentes permanecem no Firestore.
- Eles não aparecem no novo Kanban.
- Projetos e tarefas do Dashboard permanecem íntegros.

### Autorização

- Usuário autenticado lê e altera somente seus próprios documentos.
- Outro UID é negado.
- Usuário não autenticado é negado.
- Exclusão das colunas fixas é negada.
- Exclusão de Revisar é permitida no projeto próprio.
- Alteração de nome, ordem ou cor das colunas fixas é negada.

### Regressão visual

- Comparar Board antes/depois em desktop e mobile.
- Confirmar que cores, tamanhos, bordas, espaçamento e modal não mudaram.
- Comparar Dashboard e navbar em modo claro e escuro.
- Confirmar que o indicador permanece dentro do alinhamento atual e envolve o texto.

## Sequência Recomendada

1. Definir/atualizar as regras Firestore das colunas reservadas.
2. Refatorar `board.js` para inicializar e renderizar apenas IDs reservados.
3. Adaptar criação e remoção do controle existente para Revisar.
4. Restringir handlers de renomeação/exclusão das colunas fixas.
5. Preservar a transação de movimentação e validar concorrência.
6. Ajustar o pseudo-elemento da navbar.
7. Executar regressão manual do Board, Dashboard, projetos e navbar.
