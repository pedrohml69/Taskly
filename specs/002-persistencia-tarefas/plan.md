# Implementation Plan: Persistência de Tarefas no Firestore

**Branch**: `002-persistencia-tarefas` | **Date**: 2026-10-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-persistencia-tarefas/spec.md`

## Summary

Substituir a lista de exemplos mantida em memória no dashboard pela coleção privada `users/{uid}/tasks/{taskId}`. O Firebase Authentication identifica o UID; o Firestore persiste as tarefas e as regras de segurança impõem o isolamento no servidor.

O frontend existente permanece como está visualmente. A lógica de calendário, métricas e validações será preservada, passando a operar sobre as tarefas carregadas para a sessão autenticada.

## Technical Context

**Linguagens/Tecnologias**: HTML5, CSS3, JavaScript ES modules, Firebase Web SDK 12.4.0

**Dependências existentes**:
- Firebase Authentication, por `src/scripts/firebase-config.js`.
- Cloud Firestore, por `src/scripts/firebase-config.js`.
- Firebase Security Rules, em `firestore.rules`.

**Armazenamento**: Cloud Firestore, subcoleção `users/{uid}/tasks`.

**Autenticação**: sessão existente de Firebase Authentication; o UID recebido em `onAuthStateChanged` define o caminho da coleção.

**Testes**: Não foi identificado harness de testes ou configuração do Emulator Suite no projeto. Validar os fluxos no navegador com duas contas e validar as regras no ambiente de desenvolvimento do Firebase ou no Emulator Suite, se configurado.

**Plataforma**: Navegadores desktop, tablet e celular servidos por HTTP/HTTPS, necessário aos módulos ES e imports Firebase existentes.

**Restrições**:
- Preservar a estrutura funcional `{ id, nome, data, horario, concluida }`.
- Não armazenar `id` duplicado no documento: o ID do documento Firestore será exposto como `id` no objeto usado pelo dashboard.
- A propriedade é determinada pelo caminho `users/{uid}`, sem confiar em um UID fornecido pelo cliente nos campos da tarefa.
- Não modificar login, cadastro, logout, layout, estilos ou preferências locais.
- Não incluir migração dos exemplos locais nem de outras fontes.
- Não instalar dependências ou introduzir framework.

## Architecture

```text
Firebase Authentication
        │ onAuthStateChanged(auth)
        ▼
Dashboard JavaScript module ───── Firebase Web SDK
        │                              │
        ├── carrega users/{uid}/tasks  ├── getDocs / addDoc / updateDoc
        ├── atualiza estado e views    └── db de firebase-config.js
        ▼
Firestore Security Rules: uid do caminho deve corresponder a request.auth.uid
```

### Fluxo de carregamento

1. Converter a inclusão existente de `dashboard.js` em `dashboard.html` para `type="module"` e importar `auth`/`db` do módulo de configuração, além de `onAuthStateChanged` e as operações Firestore necessárias.
2. Inicializar o estado local de tarefas vazio; remover a lista fixa de exemplos.
3. Aguardar o callback da sessão autenticada antes de consultar `users/{uid}/tasks`.
4. Mapear cada snapshot para o formato usado pela interface, usando `snapshot.id` como `id` e mantendo os campos armazenados.
5. Atualizar calendário e gráficos depois do carregamento. Se a sessão for encerrada ou mudar, limpar imediatamente o estado da conta anterior.
6. Distinguir falha de leitura de coleção vazia por meio de feedback existente (por exemplo, `alert`), sem apresentar exemplos ou dados de outra sessão.

### Fluxo de criação e conclusão

- Preservar campos e validações atuais. Criar documento com `nome`, `data`, `horario` e `concluida: false`; Após a gravação bem-sucedida no Firestore, usar `docRef.id` como `id` local, adicionar a tarefa ao estado atual, fechar o modal e atualizar as views.
- Ao alternar conclusão, gravar `concluida` no documento do UID ativo antes de confirmar a mudança no estado local e atualizar as views.
- Em falha de gravação, manter ou restaurar o estado anterior e mostrar uma mensagem compreensível. Reutilizar o padrão atual de mensagens, sem novo componente visual.

### Regras de segurança

Adicionar uma regra explícita para `users/{uid}/tasks/{taskId}` antes do bloqueio genérico existente. Permitir leitura/criação/atualização somente quando `request.auth.uid == uid`; Permitir leitura, criação e atualização somente quando `request.auth.uid == uid`. Na criação, validar os campos `nome`, `data`, `horario` e `concluida`. Nas atualizações, permitir somente a alteração do campo `concluida`. Negar exclusão, pois não há fluxo de exclusão previsto. Preservar as regras atuais de perfil e o bloqueio para os demais caminhos.

## Arquivos previstos

- `src/pages/dashboard.html`: carregar o script do dashboard como módulo.
- `src/scripts/dashboard.js`: importar APIs Firebase, substituir os exemplos, carregar tarefas ao resolver a sessão e persistir criação/conclusão.
- `firestore.rules`: autorizar operações próprias na subcoleção de tarefas e rejeitar acesso de terceiros/não autenticados.
- `specs/002-persistencia-tarefas/data-model.md`: documentar a representação persistida.
- `specs/002-persistencia-tarefas/contracts/firestore-tasks.md`: documentar operações e matriz de acesso.

Não são previstas mudanças em HTML de conteúdo, CSS, autenticação ou dependências.

## Sequência de Implementação

1. Implementar as regras e o contrato de dados da tarefa, preservando o acesso ao perfil existente.
2. Tornar o script do dashboard módulo e integrar o carregamento autenticado do Firestore.
3. Substituir criação em memória por gravação na coleção privada e mapear o ID do documento.
4. Persistir a alternância de conclusão sem confirmar visualmente alterações não gravadas.
5. Validar conta sem tarefas, recarga, criação, alternância, erros e isolamento entre duas contas.

## Critérios de Validação

- Conta vazia começa sem tarefas de exemplo e sem contaminação entre contas.
- Criar uma tarefa persiste os quatro campos e o ID permanece estável após recarga.
- Marcar/desmarcar conclusão permanece após recarga; indicadores existentes refletem os dados carregados.
- Falha de escrita não é apresentada como sucesso.
- Regras negam acesso de usuário não autenticado e de outra conta, mesmo por operação direta ao Firestore.
- As regras de perfil continuam funcionando e o frontend não sofre alterações visuais ou regressões de interação.
