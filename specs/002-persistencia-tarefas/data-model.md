# Data Model: Tarefas do Dashboard

## Task

**Objetivo:** Persistir uma tarefa criada no dashboard e mantê-la isolada na conta que a criou.

**Caminho Firestore:**

```text
users/{uid}/tasks/{taskId}
```

- `{uid}` é o UID fornecido pelo Firebase Authentication.
- `{taskId}` é o ID estável do documento do Firestore.
- O ID não precisa ser duplicado nos campos do documento; ao carregar, `snapshot.id` é mapeado para `id` no objeto consumido pelo dashboard.
- A propriedade é determinada pelo caminho. Não incluir um `userId` informado pelo cliente como fonte de autorização.

**Campos do documento:**

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `nome` | string | Sim | Nome da tarefa, não vazio após trim. |
| `data` | string | Sim | Data civil no formato `YYYY-MM-DD`, como enviada pelo input date. |
| `horario` | string | Sim | Hora no formato `HH:mm`, como enviada pelo input time. |
| `concluida` | boolean | Sim | `false` na criação; booleano alternado pela ação existente do calendário. |

**Exemplo de documento** (`users/abc123/tasks/autoId`):

```json
{
  "nome": "Estudar programação",
  "data": "2026-10-06",
  "horario": "08:00",
  "concluida": false
}
```

**Objeto em memória do dashboard:**

```json
{
  "id": "autoId",
  "nome": "Estudar programação",
  "data": "2026-10-06",
  "horario": "08:00",
  "concluida": false
}
```

## Regras de integridade e acesso

- Apenas usuário autenticado cujo `request.auth.uid` corresponda ao `{uid}` do caminho pode listar, ler, criar ou atualizar os documentos da subcoleção.
- Dados de criação contêm somente `nome`, `data`, `horario` e `concluida`, com os tipos e formatos previstos.
- Atualização permitida nesta feature altera somente `concluida`; nome, data e horário ficam imutáveis no escopo atual.
- Exclusão não é disponibilizada nesta feature e deve permanecer negada pelas regras.
- Usuários não autenticados e demais UIDs não podem ler nem modificar a coleção.
- O perfil em `users/{uid}/profile/main` é um documento separado e mantém as regras já existentes.

## Relação com o Dashboard

O Dashboard não é persistido como entidade. Calendário, conclusão e carga derivam da coleção de tarefas carregada para o UID ativo. Um resultado vazio é diferente de uma falha de leitura e não deve reintroduzir as tarefas de exemplo.
