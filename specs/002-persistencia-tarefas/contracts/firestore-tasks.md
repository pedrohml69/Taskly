# Contract: Firestore Tasks

## Recurso

**Collection path:** `users/{uid}/tasks`

**Document path:** `users/{uid}/tasks/{taskId}`

O contrato usa chamadas do Firebase Web SDK diretamente pelo frontend; não há endpoint HTTP próprio.

## Documento persistido

```json
{
  "nome": "Estudar programação",
  "data": "2026-10-06",
  "horario": "08:00",
  "concluida": false
}
```

O ID do documento é o `id` estável no objeto do dashboard. UID e ID não são duplicados como campos do documento.

## Operações

### Listar tarefas próprias

- Operação: leitura da coleção `users/{currentUser.uid}/tasks`.
- Autenticação: obrigatória.
- Resultado: lista de documentos convertidos em `{ id, nome, data, horario, concluida }`.
- Coleção vazia: estado normal com lista vazia.
- Falha: informar que as tarefas não puderam ser carregadas; não usar fixtures como fallback.

### Criar tarefa

- Operação: criar documento na coleção do UID ativo, com ID Firestore gerado automaticamente.
- Campos: `nome`, `data`, `horario`, `concluida` (`false`).
- Validação de UI existente continua em vigor.
- Sucesso: usar o ID retornado pelo Firestore e então atualizar o estado/renderização existentes.
- Falha: preservar a UI como não salva e exibir mensagem compreensível.

### Atualizar conclusão

- Operação: atualizar `concluida` em `users/{currentUser.uid}/tasks/{taskId}`.
- Campos atualizáveis: somente `concluida`.
- Sucesso: confirmar a alteração no estado local e redesenhar as views existentes.
- Falha: manter o valor anterior no estado/renderização e exibir mensagem compreensível.

### Excluir

Não existe operação de exclusão na interface desta feature. As regras devem negar exclusão.

## Matriz de autorização

| Ator/operação | Listar/ler | Criar | Atualizar conclusão | Excluir |
|---|---:|---:|---:|---:|
| Não autenticado | Negado | Negado | Negado | Negado |
| Usuário autenticado no UID do caminho | Permitido | Permitido com schema válido | Permitido somente para `concluida` | Negado |
| Usuário autenticado em outro UID | Negado | Negado | Negado | Negado |

## Segurança e compatibilidade

- A autorização é sempre decidida pelas Firestore Security Rules, nunca apenas por filtro no JavaScript.
- Regras de perfil atuais não devem ser removidas ou enfraquecidas.
- Uma regra genérica de negação deve continuar protegendo caminhos não incluídos neste contrato.
- Nenhum dado de senha ou credencial deve ser gravado na coleção de tarefas.
