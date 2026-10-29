# Quickstart: Validar Projetos e Quadros

## Pré-requisitos

- Firebase Authentication e Firestore inicializados em `src/scripts/firebase-config.js`.
- Contas de teste autenticáveis e regras de `firestore.rules` atualizadas no ambiente de desenvolvimento.
- Aplicação servida por HTTP/HTTPS para carregar módulos ES e Firebase SDK.
- Não há configuração local de Firebase Emulator Suite/test runner identificada. Se o Emulator Suite for habilitado, use-o para validar as regras sem dados remotos.

## Cenários no navegador

1. Entre com uma conta sem projetos Firestore e abra Board. Confirme que somente `Projeto 001` é criado com descrição vazia, fica selecionado e não recebe quadros automaticamente.
2. Recarregue Board. Confirme que o mesmo projeto permanece e não há duplicação.
3. Clique no controle existente para adicionar quadro, crie um quadro e confirme que ele pertence a `Projeto 001` e reaparece após recarregar.
4. Crie outro projeto pelo fluxo existente. Confirme descrição `Novo projeto`, seleção e exibição na lista após recarregar.
5. Edite o nome do projeto pelo input existente. Confirme que cabeçalho e lista exibem o nome persistido após recarregar.
6. No projeto ativo, crie três quadros. Confirme títulos, ordem e sequência de cores azul/amarelo/vermelho após recarregar.
7. Renomeie um quadro; adicione dois itens com o mesmo texto; remova apenas um deles; recarregue e confirme título, conteúdo e ocorrência restante.
8. Remova um quadro e confirme que ele não reaparece após recarregar; confirme que outros quadros/projetos permanecem intactos.
9. Selecione outro projeto, crie quadros e volte ao primeiro. Confirme que os conjuntos não se misturam e a seleção anterior é restaurada após recarregar.
10. Com duas contas, confirme que uma não vê projetos/quadros da outra. Tente ler e gravar diretamente sob o UID alheio e sem sessão; as regras devem negar.
11. Provoque falha de leitura e escrita; confirme mensagem de erro e que a UI não indica gravação bem-sucedida.
12. Confirme que perfil, logout, modo noturno, navbar, visual da página e tarefas do dashboard continuam como antes.

## Critério de conclusão

Todos os cenários passam sem criar telas, alterar CSS/layout, compartilhar dados entre contas ou afetar outras funcionalidades existentes.
