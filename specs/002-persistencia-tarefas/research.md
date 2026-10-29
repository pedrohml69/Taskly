# Research: Persistência de Tarefas no Firestore

## Decisões

### 1. Organização dos documentos

**Decisão:** Armazenar tarefas em `users/{uid}/tasks/{taskId}`.

**Justificativa:** A especificação atual define esse caminho. O UID no caminho permite que as regras verifiquem a propriedade sem confiar em um campo `userId` enviado pelo navegador e facilita a leitura somente da coleção da conta ativa.

**Alternativa considerada:** Uma coleção global `tasks/{taskId}` com campo de proprietário e filtro por `userId`. Não escolhida porque exigiria validar o campo em todas as operações e a spec determina a subcoleção por usuário.

### 2. Identificador da tarefa

**Decisão:** Usar o ID do documento Firestore como `id` exposto ao estado JavaScript. Não duplicar o ID nem o UID nos dados do documento.

**Justificativa:** O identificador é estável entre leituras e atualizações; a propriedade já está representada no caminho.

### 3. Integração do SDK ao dashboard

**Decisão:** Converter a tag do dashboard para `type="module"` e importar `auth`, `db` e as funções necessárias do Firebase SDK a partir das URLs/arquivos já usados pelo projeto.

**Justificativa:** `dashboard.js` é atualmente um script clássico, enquanto o Firebase Web SDK e `firebase-config.js` usam módulos ES. A pesquisa local não encontrou funções globais do dashboard consumidas por outros scripts; as referências encontradas a `window` são leituras do perfil/logout. A conversão permite aguardar a sessão de Authentication sem introduzir dependência ou ponte global adicional.

**Alternativa considerada:** Criar um módulo separado de persistência e compartilhar estado/eventos entre ele e o script clássico. Não escolhida porque exigiria um contrato global ou reorganização adicional sem benefício necessário para este fluxo pequeno.

### 4. Carregamento das tarefas

**Decisão:** Fazer uma leitura pontual da subcoleção do usuário ao resolver a sessão autenticada, usando `getDocs`.

**Justificativa:** O dashboard precisa restaurar o estado após abrir/recarregar; colaboração em tempo real não faz parte do escopo. Uma leitura pontual preserva o fluxo atual sem manter listeners para uma tela cuja sessão pode mudar.

**Alternativa considerada:** `onSnapshot` em tempo real. Não escolhida porque a spec não requer sincronização simultânea e ela aumenta a necessidade de controlar/desinscrever listeners em mudanças de sessão.

### 5. Escrita e estado da interface

**Decisão:** Aguardar a confirmação de `addDoc` ou `updateDoc` antes de refletir uma nova tarefa ou conclusão como salva na interface.

**Justificativa:** A spec proíbe sucesso silencioso em falha e o dashboard não tem uma fila offline ou estado de sincronização visual. O padrão de `alert` já existe no projeto e evita alteração de layout.

**Alternativa considerada:** Atualização otimista com rollback. Não escolhida porque pode apresentar temporariamente um estado não persistido e exige lidar com concorrência de cliques e reversões.

### 6. Validação de segurança

**Decisão:** Aplicar regras explícitas no caminho próprio, verificando autenticação, formato dos campos e operações permitidas; manter negação para caminhos restantes.

**Justificativa:** A validação do cliente não protege dados Firestore. O escopo prevê apenas criação e atualização do booleano `concluida`; não há exclusão ou edição de outros campos na UI.

**Alternativa considerada:** Confiar no filtro do cliente ou nas validações do dashboard. Rejeitada porque operações diretas ao Firestore ignorariam essas validações.

## Verificações do repositório

- `firebase-config.js` já exporta `auth` e `db` e importa os SDKs Firebase versão 12.4.0 por módulos.
- `dashboard.html` carrega hoje `auth-guard.js` como módulo e `dashboard.js` como script clássico.
- `dashboard.js` mantém três tarefas de exemplo em memória; criação adiciona à lista e clique alterna `concluida` apenas localmente.
- Calendário, estatísticas de conclusão e carga consomem a mesma lista em memória.
- `firestore.rules` protege o perfil em `users/{uid}/profile/main` e nega o restante por regra abrangente; a nova regra deve coexistir com a regra de perfil.
- Não foi identificado arquivo de dependências, runner de testes ou configuração do Firebase Emulator Suite na estrutura fornecida. A validação automatizada depende de configuração externa; o plano prevê validação no navegador e das regras.

## Questões resolvidas

- A leitura não deve ocorrer antes de conhecer o UID autenticado.
- Usuário sem documentos deve receber lista vazia, não as tarefas de exemplo atuais.
- Falha na criação/atualização não deve ser tratada como gravação concluída.
- Modo noturno e outros dados que não sejam tarefas permanecem no armazenamento local atual.
- Migração dos exemplos em memória não faz parte desta feature.
