# Contract: Firestore Projects and Boards

## Recursos

```text
users/{uid}/projects/{projectId}
users/{uid}/projects/{projectId}/boards/{boardId}
```

As operações são chamadas do Firebase Web SDK no cliente autenticado; não há endpoint HTTP ou backend próprio.

## Projeto

```json
{
  "nome": "Projeto Taskly",
  "descricao": "Desenvolvimento do sistema",
  "ordem": 2
}
```

O ID do documento é o `id` exposto à UI. Não incluir campo de UID como autoridade de acesso.

### Listar

- Listar apenas `users/{currentUser.uid}/projects`.
- Se a coleção estiver vazia, criar idempotentemente `project-001` com `nome: "Projeto 001"`, `descricao: ""` e `ordem: 0`, e então retornar esse documento.
- Não criar os três projetos fixos de exemplo.
- Ordenar por `ordem` antes de renderizar.
- Uma falha de leitura é diferente de uma lista vazia; informar erro sem renderizar dados de exemplo como carregados.

### Criar e atualizar

- Criação explícita pelo prompt existente usa `descricao: "Novo projeto"` e a próxima `ordem` após o contêiner/projetos existentes.
- Atualização de nome escreve no projeto ativo e, após sucesso, atualiza cabeçalho e lista.
- Só confirmar a operação no estado da UI após sucesso Firestore; em falha preservar o valor anterior e informar o usuário.

## Quadro

```json
{
  "nome": "Planejamento",
  "ordem": 0,
  "cor": "quadro-azul",
  "itens": ["Definir escopo"]
}
```

### Listar e selecionar

- Ler quadros somente da subcoleção do projeto ativo pertencente ao UID atual.
- Ordenar por `ordem`; exibir nome, classe de cor e itens.
- Ignorar resposta assíncrona de projeto que deixou de estar ativo.

### Criar/atualizar/remover

- Criar quadro no projeto selecionado com ID de documento Firestore, nome fornecido, ordem de inserção, cor seguinte da sequência visual e lista `itens` vazia.
- Edição de título altera somente `nome`.
- Adição/remoção de item atualiza o array `itens` preservando ordem e duplicatas.
- Exclusão remove o documento de quadro.
- Falha não confirma a alteração na UI e apresenta feedback compreensível.

## Matriz de autorização

| Ator/operação | Projetos: listar/ler | Projetos: criar/atualizar | Projetos: excluir | Quadros: ler/criar/atualizar/excluir |
|---|---:|---:|---:|---:|
| Não autenticado | Negado | Negado | Negado | Negado |
| Proprietário autenticado | Permitido | Permitido com schema válido | Negado | Permitido no projeto próprio |
| Outro UID autenticado | Negado | Negado | Negado | Negado |

Toda regra de quadro deve validar o UID do caminho e a existência do projeto pai sob esse mesmo UID.

## Compatibilidade

- Regras devem coexistir com o perfil `users/{uid}/profile/main`, as tarefas `users/{uid}/tasks/{taskId}` e a regra geral de negação.
- Não persistir dados de login, perfil, tema ou configurações neste contrato.
- Nenhum nome ou item armazenado deve ser interpretado como HTML ao renderizar.
