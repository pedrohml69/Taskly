# Feature Specification: Persistência de Tarefas no Firestore

**Feature Branch**: `002-persistencia-tarefas`

**Created**: 2026-10-06

**Status**: Draft

**Input**: Substituir a lista mantida em memória no dashboard por tarefas persistidas no Firestore para o usuário autenticado, preservando o frontend, o layout, as funcionalidades atuais e a estrutura das tarefas.

---

## Objetivo

Permitir que cada usuário autenticado mantenha suas tarefas do Taskly entre visitas e recarregamentos. O Firestore passa a ser a fonte persistente das tarefas; o Firebase Authentication identifica o proprietário. Um usuário nunca pode consultar ou alterar tarefas de outra conta.

A integração deve aproveitar as páginas e componentes existentes. Não redesenhar o dashboard nem alterar os fluxos de calendário, indicadores, carga de tarefas ou criação que já funcionam.

## Histórias de Usuário

### História 1 - Manter minhas tarefas entre acessos (Prioridade: P1)

Como usuário autenticado, quero que minhas tarefas permaneçam salvas para que eu possa voltar ao dashboard e continuar minha rotina sem recriá-las.

**Motivo da prioridade**: A persistência é o objetivo principal desta feature e substitui o estado volátil atual.

**Cenários de aceitação**:

1. **Dado** que minha conta autenticada possui tarefas salvas, **quando** acesso ou recarrego o dashboard, **então** vejo minhas tarefas com nome, data, horário e estado de conclusão preservados.
2. **Dado** que minha conta não possui tarefas salvas, **quando** acesso o dashboard, **então** nenhuma tarefa de outra conta ou dado de exemplo é apresentada como tarefa minha, e os indicadores mostram os valores correspondentes a uma lista vazia.
3. **Dado** que criei uma tarefa válida no formulário existente, **quando** salvo, **então** a tarefa é persistida para minha conta e aparece no calendário e nos indicadores existentes.

### História 2 - Atualizar a conclusão da tarefa (Prioridade: P1)

Como usuário, quero marcar ou desmarcar uma tarefa como concluída e manter essa alteração após sair ou recarregar o dashboard.

**Cenários de aceitação**:

1. **Dada** uma tarefa pendente, **quando** clico nela no calendário, **então** seu estado passa a concluído e a apresentação e os indicadores existentes são atualizados.
2. **Dada** uma alteração de conclusão salva, **quando** recarrego o dashboard, **então** a tarefa continua com o estado atualizado.
3. **Dada** uma tarefa concluída, **quando** clico nela novamente, **então** ela volta ao estado pendente e essa alteração também permanece após recarregar.

### História 3 - Manter os dados separados por usuário (Prioridade: P1)

Como usuário, quero que minhas tarefas sejam privadas para que nenhuma outra conta possa lê-las ou alterá-las.

**Cenários de aceitação**:

1. **Dado** que dois usuários autenticados possuem tarefas diferentes, **quando** cada um abre o dashboard, **então** cada um vê somente as tarefas associadas à própria conta.
2. **Dado** que um usuário tenta ler, criar, alterar ou excluir tarefa associada a outro usuário, **quando** a operação é avaliada pelas regras do Firestore, **então** ela é negada.
3. **Dado** que não há usuário autenticado, **quando** uma operação tenta acessar tarefas no Firestore, **então** a operação é negada pelas regras de segurança.

## Requisitos Funcionais

- **FR-001**: O sistema DEVE associar cada tarefa ao UID do usuário autenticado no Firebase Authentication.
- **FR-002**: O sistema DEVE carregar no dashboard somente as tarefas do usuário autenticado.
- **FR-003**: O sistema DEVE persistir tarefas criadas pelo formulário existente e mantê-las disponíveis após recarregar a página ou encerrar e iniciar uma nova sessão.
- **FR-004**: Cada tarefa DEVE preservar um identificador estável e os campos existentes: `nome` (texto), `data` (data no formato `YYYY-MM-DD`), `horario` (hora no formato `HH:mm`) e `concluida` (booleano).
- **FR-005**: O sistema DEVE persistir as alterações de conclusão iniciadas no calendário e reapresentar o estado salvo em todos os acessos posteriores.
- **FR-006**: Calendário, conclusão de tarefas e carga de tarefas DEVEM continuar sendo calculados a partir do mesmo conjunto de tarefas carregado para o usuário atual.
- **FR-007**: As regras de segurança do Firestore DEVEM impedir leitura ou escrita de tarefas por usuários não autenticados e impedir que um usuário leia ou altere tarefas de outro UID.
- **FR-008**: A criação e a alteração de conclusão NÃO DEVEM ser apresentadas como salvas quando a gravação no Firestore falhar. O usuário DEVE receber um retorno compreensível, sem perda silenciosa da alteração.
- **FR-009**: O carregamento de tarefas DEVE ocorrer no contexto da sessão autenticada atual; tarefas de um usuário não podem permanecer visíveis quando a sessão muda ou termina.
- **FR-010**: A integração NÃO DEVE alterar o layout, os estilos, a navegação ou as regras atuais de validação e interação do dashboard, salvo o necessário para refletir o estado persistido e informar erros de operação.

## Entidade: Tarefa

As tarefas devem ser armazenadas na estrutura:

users/{uid}/tasks/{taskId}

A tarefa persistida mantém a estrutura usada atualmente pelo dashboard:

| Campo | Tipo | Regra |
|---|---|---|
| `id` | Identificador estável do documento | Deve corresponder ao `taskId` do documento no Firestore e permanecer o mesmo entre carregamentos e atualizações. |
| `nome` | Texto | Nome informado no formulário existente. |
| `data` | Texto `YYYY-MM-DD` | Data selecionada no formulário existente. |
| `horario` | Texto `HH:mm` | Horário selecionado no formulário existente. |
| `concluida` | Booleano | Estado de conclusão, iniciado como `false` para novas tarefas. |
| proprietário | Determinado pelo caminho `users/{uid}/tasks/{taskId}` | A tarefa pertence exclusivamente ao usuário identificado pelo `uid`. |

O identificador estável da tarefa deve ser fornecido pelo ID do documento do Firestore (`taskId`) ou por outro identificador único e persistente equivalente. A propriedade da tarefa deve ser determinada pela estrutura `users/{uid}/tasks/{taskId}`. Não armazenar credenciais ou senhas nos documentos de tarefa.

## Requisitos de Compatibilidade

- A criação continua usando os campos, validações e modal existentes.
- A marcação de conclusão continua sendo feita pela interação existente no calendário.
- A organização semanal, as estatísticas de conclusão e a distribuição de carga mantêm o comportamento atual, usando dados persistidos da conta ativa.
- Preferências locais que não sejam tarefas, como o modo noturno, não fazem parte desta feature e não devem ser migradas nem alteradas.
- Os registros de exemplo declarados apenas em memória não constituem dados persistidos de usuário. Não há requisito de migração de dados locais nesta feature.

## Fora de Escopo

- Redesenho de páginas, alteração de CSS ou criação de novas telas.
- Edição do nome, data ou horário de uma tarefa, exclusão de tarefas ou colaboração entre usuários.
- Persistência de projetos, quadros, configurações ou preferências visuais.
- Mudanças no cadastro, login, logout ou fluxo de autenticação existente.
- Migração de dados de outras fontes locais para o Firestore.

## Pressupostos e Dependências

- O dashboard já é uma página protegida e a sessão do Firebase Authentication fornece o UID necessário.
- O Firebase já está inicializado para Authentication e Firestore pelo projeto.
- O formato atual da tarefa é `{ id, nome, data, horario, concluida }`; os exemplos iniciais do script estão em memória e não oferecem persistência entre sessões.
- O comportamento de erro deve reutilizar os padrões existentes do frontend sempre que possível, sem exigir uma mudança de layout.

## Critérios de Sucesso

- Uma tarefa criada por um usuário aparece novamente após recarregar o dashboard, mantendo os quatro dados funcionais e sua identidade.
- A conclusão marcada ou desmarcada permanece correta após recarregar e é refletida nos indicadores existentes.
- Em teste com duas contas, nenhuma conta consegue ler ou alterar tarefas da outra, inclusive por acesso direto ao Firestore.
- O dashboard mantém a apresentação e os fluxos atuais, sem regressão nas validações, calendário ou indicadores.
