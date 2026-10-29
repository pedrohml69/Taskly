# Data Model: Projetos e Quadros

## Propriedade e caminhos

```text
users/{uid}/projects/{projectId}
users/{uid}/projects/{projectId}/boards/{boardId}
```

- `{uid}` vem da sessão Firebase Authentication e é o limite de propriedade.
- `projectId` e `boardId` são os IDs estáveis dos documentos Firestore e são expostos como `id` nos objetos JavaScript.
- Não duplicar UID como campo de autorização. A existência de documento pai de projeto deve ser verificada para operações em quadros.

## Project

**Origem atual:** projetos criados pelo usuário têm `nome` e `descricao`; projetos novos usam descrição `Novo projeto`. Uma coleção vazia recebe somente um contêiner neutro para os quadros.

**Documento:** `users/{uid}/projects/{projectId}`

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `nome` | string | Sim | Não vazio; texto exibido no modal e cabeçalho. |
| `descricao` | string | Sim | Texto exibido na lista; novos projetos iniciam como `Novo projeto`; vazia no contêiner automático. |
| `ordem` | number | Sim | Posição na lista; ordem 0 no contêiner automático ou no primeiro projeto criado. |

**Contêiner automático (criado somente se a coleção estiver vazia):**

| ID | Nome | Descrição | Ordem |
|---|---|---|---:|
| `project-001` | Projeto 001 | string vazia | 0 |

Uma transação cria o documento determinístico uma única vez. Não criar os antigos projetos de exemplo. Projetos criados pelo usuário depois recebem IDs Firestore próprios.

## Board

**Origem atual:** cada cartão contém título editável, recebe uma classe da sequência azul/amarelo/vermelho, mantém itens textuais e pode ser excluído.

**Documento:** `users/{uid}/projects/{projectId}/boards/{boardId}`

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `nome` | string | Sim | Não vazio; valor exibido no input de título do cartão. |
| `ordem` | number | Sim | Posição do cartão dentro do projeto. |
| `cor` | string | Sim | Um de `quadro-azul`, `quadro-amarelo`, `quadro-vermelho`. |
| `itens` | array de strings | Sim | Textos na ordem de exibição; array vazio para quadro sem itens. |

**Exemplo** (`users/abc123/projects/project01/boards/board01`):

```json
{
  "nome": "Planejamento",
  "ordem": 0,
  "cor": "quadro-azul",
  "itens": ["Definir escopo", "Revisar protótipo"]
}
```

Ao remover um item, identificar a ocorrência clicada, não apenas o texto, para que itens repetidos possam ser removidos individualmente.

## Estado de seleção

A seleção do projeto é estado de navegação da interface, não documento de domínio nem autorização. Persistir localmente o `projectId`; ao restaurar, confirmar que ele existe na lista carregada para o UID atual. O antigo `taskly-project-name` pode ser usado uma vez para localizar um projeto da conta pelo nome, sem confiar nele como registro.

## Acesso e integridade

- Só o UID autenticado pode listar/criar/alterar projetos sob seu caminho.
- Exclusão de projeto permanece desabilitada pelas regras nesta feature.
- Só o proprietário pode ler/criar/alterar/excluir quadros dentro de seu projeto; o projeto pai deve existir.
- Toda operação exige usuário autenticado. Caminhos de outros UIDs são negados.
- Criar e renomear projeto usa os campos `nome`, `descricao`, `ordem`; atualizar cabeçalho altera `nome`.
- Atualização de quadro usa `nome`, `ordem`, `cor`, `itens`; exclusão do documento remove o quadro e seus itens embutidos.
- O conteúdo de quadros permanece separado das tarefas do dashboard.
