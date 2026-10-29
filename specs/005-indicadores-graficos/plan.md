# Implementation Plan: Indicadores e Gráficos do Taskly

**Branch**: `005-indicadores-graficos` | **Date**: 2026-10-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-indicadores-graficos/spec.md`

## Summary

Integrar os indicadores e gráficos do dashboard ao modelo persistido já utilizado pelo Taskly em Firestore, reaproveitando a fonte de verdade `users/{uid}/tasks/{taskId}`. A seção de conclusão e a seção de carga devem continuar sendo renderizadas na página atual do dashboard, mantendo o comportamento, os filtros por Dia/Semana/Mês, os contadores e o donut chart atuais, sem criar uma segunda coleção, um modelo paralelo de métricas ou uma nova página de analytics.

A implementação deve usar o UID autenticado para carregar somente as tarefas da conta ativa e recalcular os indicadores a partir dos dados persistidos. O objetivo é manter a superfície atual do dashboard intacta, adaptando a lógica já existente para o fluxo real do usuário e garantindo que os indicadores sejam consistentes com a rotina e com o calendário.

## Technical Context

**Linguagens/Tecnologias**: HTML5, CSS3, JavaScript ES modules, Firebase Web SDK 12.4.0

**Dependências existentes**:
- Firebase Authentication e Firestore já configurados em `src/scripts/firebase-config.js`.
- Dashboard atual em `src/pages/dashboard.html` e `src/scripts/dashboard.js`.
- Regras de segurança em `firestore.rules` para tarefas do usuário.
- Estrutura de tarefas persistidas em `users/{uid}/tasks/{taskId}`.
- Elementos visuais e controles dos indicadores já implementados e fora do escopo de redesign.

**Armazenamento**: Firestore, com tarefas sob `users/{uid}/tasks/{taskId}`.

**Autenticação**: uso de `onAuthStateChanged` para identificar o `uid` do usuário ativo e restringir o carregamento dos dados ao próprio usuário.

**Testes**: não há harness automatizado identificado. A validação será principalmente no navegador e, quando houver suporte, por ensaios de regras e consultas do Firebase/Emulator Suite.

**Restrições**:
- Não criar nova coleção, subcoleção, campo paralelo ou tabela de métricas para indicadores.
- Preservar a estrutura de tarefa já existente: `nome`, `data`, `horario`, `concluida` e ID do documento.
- Não redesenhar a página do dashboard, os textos, os filtros, os gráficos ou os elementos visuais atuais.
- Não alterar autenticação, login, cadastro, logout, navegação geral, projetos ou quadros.
- A UI deve continuar sendo a mesma, apenas alimentada por dados reais do Firestore.
- Os cálculos devem derivar da coleção de tarefas do usuário autenticado e não de uma cópia local separada como fonte de verdade.

## Arquitetura e Fluxos

```text
Firebase Authentication
        │ onAuthStateChanged
        ▼
Dashboard / indicadores ─── Firebase Web SDK / firebase-config.js
        │                              │
        └── users/{uid}/tasks/{taskId} ── leitura / atualização
                                             │
                                             ▼
                              Firestore Security Rules por UID
```

### Carregamento e autenticação

1. Manter a página atual do dashboard como ponto único de entrada para os indicadores.
2. Aguardar `onAuthStateChanged` antes de carregar a lista de tarefas e antes de qualquer cálculo de conclusão/carga.
3. Obter o `uid` do usuário ativo e consultar apenas `collection(db, "users", usuario.uid, "tasks")`.
4. Mapear os documentos em objetos com `id`, `nome`, `data`, `horario`, `concluida` e qualquer campo já existente necessário para a rotina e os indicadores.
5. Reaproveitar a mesma lista de tarefas que alimenta a rotina e o calendário, em vez de criar uma segunda estrutura de dados para métricas.

### Cálculo do indicador de conclusão

- A seção de conclusão deve seguir a mesma lógica já implementada no dashboard para os períodos Dia / Semana / Mês.
- O cálculo deve considerar somente as tarefas pertencentes ao usuário autenticado.
- `total` = número de tarefas no período selecionado.
- `concluidas` = tarefas com `concluida === true`.
- `pendentes` = `total - concluidas`.
- `percentual` = porcentagem de conclusão sobre o total do período.
- O donut chart, os contadores e o texto do período devem continuar usando os mesmos elementos e classes existentes.

### Cálculo da carga de tarefas

- A seção de carga deve contar tarefas por intervalo do período ativo usando os mesmos critérios já implementados pela UI.
- O agrupamento por dia, semana ou mês deve ser preservado exatamente como hoje.
- A carga deve ser calculada sobre o mesmo conjunto de tarefas do usuário autenticado e não sobre outra estrutura ou coleção paralela.
- Qualquer ajuste deve respeitar a regra atual de exibição do dashboard sem mudança de layout ou nomenclatura.

### Atualização dos indicadores

- Quando uma tarefa é criada, alterada, concluída ou reaberta, os indicadores devem recalcular automaticamente com o novo estado persistido do Firestore.
- A atualização deve reutilizar o conjunto de tarefas já carregado pelo dashboard, sem criar uma segunda lista independente de tarefas nem uma fonte de dados separada exclusivamente para os indicadores.
- O dashboard deve continuar refletindo os dados reais após cada mudança no Firestore.

### Segurança e isolamento por usuário

- O carregamento e os cálculos devem sempre usar o `uid` autenticado e nunca um `uid` arbitrário informado no cliente.
- A leitura de indicadores deve respeitar o mesmo nível de proteção da rotina e das regras de segurança do Firestore.
- Usuários não autenticados não devem ter acesso nem ao cálculo nem à leitura de tarefas da conta ativa.
- Dados de outras contas nunca devem aparecer no dashboard do usuário atual.

## Arquivos previstos

- `src/pages/dashboard.html`: manter a estrutura atual dos indicadores e gráficos.
- `src/scripts/dashboard.js`: integrar o carregamento de tarefas persistidas do usuário autenticado e os cálculos de conclusão/carga.
- `firestore.rules`: revisão final para confirmar que as regras de acesso continuam compatíveis com a modelagem atual.
- `specs/005-indicadores-graficos/spec.md`: especificação funcional da feature.
- `specs/005-indicadores-graficos/tasks.md`: checklist de implementação e validação.

Não são previstas alterações em `auth-guard.js`, `firebase-config.js`, `nav-mod.js`, CSS, páginas extras, ou fluxo de login/cadastro, salvo ajustes mínimos para alinhar a lógica de dados já validada.

## Sequência de Implementação

1. Revisar a estrutura atual do dashboard e identificar os pontos de cálculo de conclusão, carga, filtros e renderização gráfica.
2. Ajustar `dashboard.js` para obter o `uid` autenticado e carregar `users/{uid}/tasks` em vez de depender de uma fonte independente.
3. Validar que os indicadores usam a mesma lista de tarefas da rotina/calendário e que o conjunto permanece isolado por usuário.
4. Garantir que o cálculo de `total`, `concluidas`, `pendentes` e percentual preserve os períodos ativos já existentes.
5. Garantir que a seção de carga mantém os mesmos intervalos e critérios que a versão atual do dashboard.
6. Validar que mudanças em tarefa (criação, edição, conclusão e desmarcação) atualizam imediatamente os indicadores.
7. Confirmar que não há vazamento de dados entre usuários e que as regras do Firestore continuam protegendo a coleção.
8. Validar a interface final para garantir que o dashboard continua visualmente compatível com o comportamento atual.

## Critérios de Validação

- O dashboard mostra indicadores reais do usuário autenticado e não de outra conta.
- Os contadores e gráficos usam `users/{uid}/tasks/{taskId}` como fonte de cálculo.
- Os valores refletem corretamente tarefas concluídas e pendentes no período ativo.
- A carga por dia/semana/mês continua funcionando com os mesmos intervalos e regras do dashboard atual.
- A criação, atualização e conclusão de tarefas reprocessam os indicadores sem duplicar dados ou usar uma estrutura paralela.
- Usuários diferentes não compartilham métricas, mesmo com tarefas coexistindo no Firestore.
- A navegação por Dia/Semana/Mês continua funcionando sem regressão visual ou funcional.
- O dashboard continua preservando sua aparência, estrutura e interações existentes.

## Restrições Técnicas

- Utilizar `onAuthStateChanged` e o `uid` autenticado como base para todos os cálculos.
- Reaproveitar a coleção de tarefas já persistida em vez de criar outra fonte de dados.
- Manter a compatibilidade com o layout e comportamentos atuais do dashboard.
- Validar qualquer integração com Firestore antes de criar outra estrutura interna.
- Respeitar a segurança por conta e o isolamento de dados do usuário autenticado.

## Resultado Esperado

A funcionalidade de indicadores e gráficos do Taskly passa a depender das tarefas persistidas do usuário autenticado no Firestore, mantendo a mesma interface do dashboard e a mesma lógica visual atual. Os indicadores refletem progresso e carga real da conta ativa, com recalculação automática após mudanças de estado, sem criação de segunda fonte de dados, sem redesenho da experiência e sem compartilhamento entre contas.
