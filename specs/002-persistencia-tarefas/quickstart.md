# Quickstart: Validar Persistência de Tarefas

## Pré-requisitos

- Projeto Firebase configurado em `src/scripts/firebase-config.js`.
- Firebase Authentication com contas de teste habilitadas.
- Firestore disponível no ambiente de desenvolvimento.
- Regras atualizadas para a subcoleção `users/{uid}/tasks`.
- Aplicação servida por HTTP/HTTPS, pois o frontend usa módulos ES e imports Firebase.

O repositório não apresenta scripts de teste ou configuração local do Emulator Suite. Use o ambiente de desenvolvimento Firebase já configurado ou execute as mesmas verificações com Emulator Suite caso seja habilitado no projeto.

## Cenários manuais

1. Entre com a conta A e abra o dashboard. Confirme que não aparecem as tarefas de exemplo e que a conta sem documentos exibe os indicadores zerados.
2. Crie uma tarefa com nome, data e horário válidos. Confirme que ela aparece no calendário e nas métricas existentes.
3. Recarregue a página. Confirme que a tarefa reaparece com os mesmos campos e sem duplicação.
4. Clique na tarefa para marcá-la como concluída. Recarregue e confirme estado e indicadores; clique novamente e confirme a persistência do retorno para pendente.
5. Entre com a conta B. Confirme que as tarefas da conta A não aparecem; crie uma tarefa e confirme que ela só aparece na conta B.
6. Com a conta B, tente acessar diretamente um documento no caminho da conta A e tente gravar nele. Confirme que ambas as operações são negadas pelas regras.
7. Sem autenticação, tente ler e gravar em uma subcoleção de tarefas. Confirme que as operações são negadas.
8. Provoque uma falha de gravação (por exemplo, regras não implantadas ou conexão indisponível) e confirme que a interface não comunica sucesso nem mantém como salva uma criação/alteração que falhou.
9. Abra perfil/configurações, alterne o modo noturno e confirme que login, logout, navegação e preferência local continuam funcionando.

## Critério de conclusão

Todos os cenários acima passam sem mudança no layout e sem regressão da validação do modal, do calendário semanal, dos gráficos de conclusão e da carga de tarefas.
