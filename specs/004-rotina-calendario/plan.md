# Implementation Plan: Rotina / Calendário do Taskly

**Branch**: `004-rotina-calendario` | **Date**: 2026-10-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-rotina-calendario/spec.md`

## Summary

Integrar a seção de rotina do dashboard ao modelo persistido já implementado em Firestore, reutilizando a estrutura existente de tarefas em `users/{uid}/tasks/{taskId}`. A rotina continuará sendo renderizada na mesma página do dashboard, mantendo a grade semanal, a navegação, os gráficos e os controles atuais, sem criar outra coleção, outra interface ou outra fonte de dados para tarefas.

A implementação deve aproveitar o estado do usuário autenticado e as tarefas já persistidas para alimentar a visualização do calendário, a marcação de conclusão, a navegação por semana e os indicadores de desempenho do dashboard. Qualquer mudança no fluxo deve ser compatível com o que já existe no projeto.

## Technical Context

**Linguagens/Tecnologias**: HTML5, CSS3, JavaScript ES modules, Firebase Web SDK 12.4.0

**Dependências existentes**:
- Firebase Authentication e Firestore já configurados em `src/scripts/firebase-config.js`.
- Dashboard atual em `src/pages/dashboard.html` e `src/scripts/dashboard.js`.
- Regras de segurança em `firestore.rules` para tarefas do usuário.
- Navegação, perfil, modal e estilos já implementados e fora do escopo desta feature.

**Armazenamento**: Firestore, com tarefas sob `users/{uid}/tasks/{taskId}`.

**Autenticação**: utilização de `onAuthStateChanged` do Firebase para identificar o UID ativo e carregar somente os documentos pertencentes a esse usuário.

**Testes**: não há harness automatizado identificado. A validação será principalmente no navegador e, quando disponível, por regras do Firebase/Emulator Suite.

**Restrições**:
- Não criar nova coleção ou modelo paralelo para tarefas da rotina.
- Preservar a estrutura atual de tarefa: `nome`, `data`, `horario`, `concluida` e ID do documento.
- Não alterar layout, página, estilos, rotas, modais ou navegação do dashboard.
- Não confiar em UID do cliente; o proprietário das tarefas deve ser o `uid` da sessão autenticada.
- As tarefas devem ter o Firestore como fonte persistente. O dashboard pode continuar utilizando seu estado em memória atual para renderização, desde que esse estado seja alimentado pelos dados persistidos e não funcione como fonte independente.
- Não alterar autenticação, projetos, quadros, perfil, logout ou modo noturno.

## Arquitetura e Fluxos

```text
Firebase Authentication
        │ onAuthStateChanged
        ▼
Dashboard / rotina ───── Firebase Web SDK / firebase-config.js
        │                              │
        └── users/{uid}/tasks/{taskId} ── leitura / criação / atualização
                                             │
                                             ▼
                              Firestore Security Rules por UID
```

### Carregamento e rotina

1. Manter a página atual do dashboard como ponto único de entrada para a rotina/calendário.
2. Aguardar `onAuthStateChanged` antes de carregar tarefas e antes de qualquer gravação de conclusão.
3. Consultar `collection(db, "users", usuario.uid, "tasks")` e mapear cada documento para `{ id, nome, data, horario, concluida }`.
4. Reaproveitar a mesma lista persistida de tarefas que já alimenta o dashboard. A rotina deve utilizar esses dados para sua própria renderização. Os indicadores e gráficos existentes não devem ser redesenhados ou implementados nesta feature; caso já consumam a mesma lista de tarefas, devem continuar funcionando sem criar uma nova fonte de dados.
5. Garantir que a conclusão da tarefa persiste no Firestore e mantém os dados compartilhados já utilizados pelo dashboard, sem implementar ou alterar a lógica específica dos indicadores/gráficos.

### Organização visual da rotina

- A rotina deve seguir a lógica já existente do calendário semanal.
- O agrupamento por `data + horario` continua sendo a base da renderização.
- A navegação por semana continua a mesma, sem novos comportamentos ou limites de calendário fora do padrão atual.
- A visualização da semana e os horários devem ser renderizados em linha com a grade atual da aplicação.

### Atualização de tarefas

- A criação de tarefa continua usando o modal e o fluxo atual do dashboard.
- A conclusão da tarefa continua sendo acionada pela interação atual com o item no calendário.
- Em ambos os casos, os documentos da tarefa devem ser persistidos em Firestore apenas no caminho do usuário autenticado.
- A alteração local deve ocorrer somente após sucesso de gravação e deve ser sempre consistente com o estado do Firestore.

### Segurança

- Manter as regras existentes de `users/{uid}/tasks/{taskId}` como base de autorização.
- Exigir a autenticação e validá-la contra o `uid` do caminho do documento.
- Proibir acesso de usuários não autenticados e acesso cruzado entre contas.
- Continuar permitindo apenas os campos atualmente usados pela tarefa, sem qualquer campo extra para rotina/calendário.

## Arquivos previstos

- `src/pages/dashboard.html`: manter a estrutura atual da rotina e manter a mesma página do dashboard.
- `src/scripts/dashboard.js`: integrar carregamento e atualização de tarefas persistidas no Firestore sem alterar o layout atual.
- `firestore.rules`: somente revisar/validar as regras existentes para garantir que continuam compatíveis com a rotina. Nenhuma alteração será feita caso as regras atuais já atendam aos requisitos.
- `specs/004-rotina-calendario/spec.md`: especificação funcional da feature.
- `specs/004-rotina-calendario/tasks.md`: checklist de implementação e validação.

Não são previstas alterações em `auth-guard.js`, `firebase-config.js`, `nav-mod.js`, páginas extra, CSS ou fluxo de autenticação, salvo ajustes mínimos para refletir um estado persistido já aprovado.

## Sequência de Implementação

1. Revisar e alinhar a rotina atual ao fluxo de autenticação e ao carregamento de tarefas já implementado.
2. Ajustar `dashboard.js` para carregar as tarefas persistidas do usuário autenticado a partir de `users/{uid}/tasks`.
3. Validar que a rotina renderiza as tarefas corretamente por data e horário sem duplicação de dados nem uso de lista fixa em memória.
4. Garantir que a criação de tarefa persiste no Firestore e reaparece no calendário após sucesso.
5. Garantir que a conclusão de tarefa também persiste e atualiza os gráficos/indicadores sem quebrar o comportamento atual.
6. Validar a navegação semanal e o comportamento dos indicadores para garantir compatibilidade visual e funcional.
7. Validar regras de segurança e acesso isolado por usuário.

## Critérios de Validação

- O usuário autenticado vê somente as suas tarefas organizadas na rotina e no calendário semanal.
- As tarefas persistidas em Firestore continuam visíveis entre recargas e sessões.
- A criação e a conclusão de tarefas refletem o estado atual do Firestore sem duplicar dados.
- A navegação da semana continua funcionando como no dashboard atual.
- A rotina e os gráficos de conclusão/carga usam os mesmos dados persistidos da conta ativa.
- Usuários diferentes não conseguem ler ou alterar tarefas uns dos outros.
- Layout, visual e controles permanecem compatíveis com a experiência atual do Taskly.
