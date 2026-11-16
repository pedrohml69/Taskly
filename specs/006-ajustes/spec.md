# Feature Specification: Ajustes Gerais do Taskly

**Feature Branch**: `006-ajustes`

**Created**: 2026-11-16

**Status**: Draft

**Input**: Atualizar autenticação para incluir verificação de e-mail após cadastro e redefinição de senha em página própria do Taskly, mantendo os ajustes da rotina 04:00-03:00 e a integração de projetos do Board com o Dashboard.

## User Scenarios & Testing

### User Story 1 - Verificar o e-mail após o cadastro (Priority: P1)

Como pessoa que acabou de criar uma conta, quero confirmar meu endereço de e-mail e receber orientação clara para continuar o acesso, para proteger e validar a identidade da conta.

**Why this priority**: A confirmação do endereço é necessária para concluir o fluxo de criação e evitar que endereços incorretos sejam usados sem validação.

**Independent Test**: Criar uma conta de teste, solicitar e reenviar a mensagem, abrir um link válido, confirmar o estado verificado e acessar a conta; testar também um link inválido ou expirado.

**Acceptance Scenarios**:

1. **Given** que os dados de cadastro são válidos, **When** a conta é criada, **Then** o usuário recebe uma mensagem de que precisa verificar o endereço e é enviado um e-mail de verificação.
2. **Given** que a mensagem inicial não chegou ou o link expirou, **When** solicito o reenvio, **Then** o sistema tenta enviar outro e-mail e informa sucesso ou falha sem perder a conta criada.
3. **Given** que abro um link de verificação válido, **When** a verificação é concluída, **Then** o estado da conta passa a indicar endereço verificado.
4. **Given** que o endereço ainda não foi verificado, **When** tento acessar uma área privada, **Then** recebo orientação para verificar ou reenviar o e-mail e não prossigo ao conteúdo privado.
5. **Given** que a verificação foi concluída, **When** retorno ao fluxo de acesso, **Then** o Taskly reconhece o novo estado e permite continuar.
6. **Given** que abro um link inválido, expirado ou já usado, **When** a validação falha, **Then** recebo uma orientação para solicitar nova mensagem.

### User Story 2 - Redefinir a senha em uma página do Taskly (Priority: P1)

Como pessoa que esqueceu a senha, quero receber um link e definir uma nova senha numa página do Taskly, para recuperar o acesso à mesma conta.

**Why this priority**: O usuário precisa recuperar acesso sem criar outra conta e concluir o fluxo numa interface consistente com o Taskly.

**Independent Test**: Solicitar redefinição para uma conta de teste não verificada, abrir o link na página do Taskly, confirmar validações e salvar uma senha nova; em seguida, entrar com a nova senha.

**Acceptance Scenarios**:

1. **Given** que estou na tela de login, **When** seleciono "Esqueci minha senha" e informo meu e-mail, **Then** o sistema solicita o envio de uma mensagem de recuperação e informa o resultado sem revelar se a conta existe.
2. **Given** que recebo uma mensagem de recuperação, **When** abro seu link válido, **Then** sou direcionado a uma página do Taskly para definir a senha.
3. **Given** que estou na página de redefinição, **When** informo senhas diferentes ou que não atendem ao mínimo, **Then** a redefinição não é concluída e recebo orientação clara.
4. **Given** que estou digitando uma senha, **When** aciono o controle de visibilidade, **Then** posso alternar entre exibir e ocultar o valor sem perder o texto digitado.
5. **Given** que o código do link é válido e as senhas são válidas e iguais, **When** confirmo a redefinição, **Then** a senha da mesma conta é atualizada e recebo confirmação com retorno à tela de login.
6. **Given** que a conta ainda não verificou o e-mail, **When** uso um link válido de redefinição recebido nessa caixa de entrada, **Then** consigo redefinir a senha sem verificar previamente o endereço.
7. **Given** que o código é inválido, expirado ou já usado, **When** tento concluir a redefinição, **Then** recebo orientação para solicitar outro link.

### User Story 3 - Organizar a rotina em um ciclo iniciado às 04:00 (Priority: P1)

Como usuário, quero que a sequência diária da rotina comece às 04:00 e continue até às 03:00 do dia seguinte, para visualizar atividades noturnas dentro do mesmo ciclo.

**Why this priority**: O ciclo contínuo deve permitir organizar atividades após a meia-noite sem quebrar a navegação semanal nem a associação das tarefas às datas salvas.

**Independent Test**: Conferir as 24 horas exibidas, navegar pelas semanas e comparar tarefas, incluindo as de 00:00-03:00, antes e depois do ajuste.

**Acceptance Scenarios**:

1. **Given** que abro a rotina, **When** vejo os horários, **Then** a sequência começa às 04:00 e termina às 03:00 do dia seguinte.
2. **Given** que a sequência passa de 23:00, **When** continuo percorrendo o ciclo, **Then** aparecem 00:00, 01:00, 02:00 e 03:00 em ordem.
3. **Given** que uma tarefa está salva entre 00:00 e 03:00, **When** vejo o ciclo iniciado no dia anterior, **Then** a tarefa aparece no horário correspondente.
4. **Given** que navego entre dias e semanas, **When** a rotina é atualizada, **Then** os horários e tarefas permanecem consistentes.
5. **Given** que há tarefas anteriores à alteração, **When** a nova rotina é apresentada, **Then** os documentos existentes não são perdidos, duplicados ou alterados indevidamente.

### User Story 4 - Consultar projetos do Board na rotina (Priority: P1)

Como usuário, quero associar projetos existentes do Board a horários da rotina e consultar seus quadros e itens no Dashboard, para acompanhar minhas atividades sem duplicar dados.

**Why this priority**: A integração torna projetos e conteúdo atuais do Board visíveis no planejamento diário sem criar fontes paralelas.

**Independent Test**: Associar projeto(s) a horário(s), consultar os quadros e itens, alterar um horário, recarregar e remover uma associação; verificar que o Board original permanece intacto.

**Acceptance Scenarios**:

1. **Given** que tenho projetos no Board, **When** abro a associação com a rotina, **Then** posso consultar e selecionar meus projetos.
2. **Given** que selecionei um projeto, **When** defino e salvo um horário, **Then** o projeto aparece no horário escolhido no Dashboard.
3. **Given** que consulto um projeto associado, **When** abro seus detalhes na rotina, **Then** vejo seus quadros e itens atuais mantendo a relação com o projeto original.
4. **Given** que altero o horário de um projeto associado, **When** salvo a alteração, **Then** ele aparece no novo horário após atualizar a rotina.
5. **Given** que removo a associação, **When** confirmo a ação, **Then** o projeto deixa de aparecer na rotina e continua disponível no Board com seus dados.
6. **Given** que altero quadros ou itens no Board, **When** volto a consultar o projeto na rotina, **Then** vejo os dados atuais.
7. **Given** que recarrego o Dashboard, **When** a rotina é carregada, **Then** as associações e seus horários continuam salvos.
8. **Given** que há mais de um projeto associado ao mesmo horário, **When** vejo a rotina, **Then** todos continuam acessíveis.

## Edge Cases

- Links de verificação e redefinição inválidos, expirados ou já utilizados devem oferecer caminho para solicitar outra mensagem.
- Reenvio de e-mail pode falhar por rede ou limitação de solicitações; a conta criada e seu perfil não devem ser duplicados.
- Após verificar o endereço em outra aba ou dispositivo, o Taskly deve atualizar o estado da sessão antes de liberar o acesso.
- A recuperação de senha deve funcionar para conta com e-mail não verificado.
- Respostas de recuperação não podem revelar se um e-mail está cadastrado.
- O ciclo de rotina atravessa a meia-noite sem deslocar os registros civis já persistidos.
- Vários projetos podem ocupar o mesmo horário; uma associação inválida não deve impedir as demais de carregar.
- Uma conta não pode consultar, alterar ou remover dados de outra conta.

## Requirements

### Functional Requirements

- **FR-001**: Após criar uma conta, o sistema DEVE enviar automaticamente uma mensagem para verificar o endereço de e-mail.
- **FR-002**: Após o cadastro, o sistema DEVE informar que a verificação é necessária e disponibilizar uma ação para reenviar a mensagem.
- **FR-003**: O sistema DEVE identificar quando a verificação for concluída e atualizar o estado utilizado pelo fluxo de acesso.
- **FR-004**: O sistema DEVE impedir o acesso às áreas privadas até que o endereço esteja verificado e permitir continuar o fluxo após a confirmação.
- **FR-005**: O sistema DEVE tratar erros de envio e links de verificação inválidos, expirados ou já utilizados, com orientação recuperável.
- **FR-006**: A tela de login DEVE permitir iniciar a recuperação de senha informando o e-mail da conta.
- **FR-007**: O sistema DEVE enviar uma mensagem de recuperação cujo link direcione para uma página do Taskly.
- **FR-008**: A página de redefinição DEVE permitir informar uma senha nova e sua confirmação, exibir/ocultar cada senha e validar o mínimo de seis caracteres e a correspondência dos campos.
- **FR-009**: O sistema DEVE validar o código de ação recebido e só atualizar a senha quando o código for válido e as duas senhas forem válidas e iguais.
- **FR-010**: Após redefinição bem-sucedida, o sistema DEVE confirmar a conclusão e disponibilizar retorno ao login.
- **FR-011**: A redefinição de senha NÃO DEVE exigir que o e-mail esteja verificado previamente.
- **FR-012**: Links de redefinição inválidos, expirados ou já usados DEVEM apresentar orientação para solicitar outro link.
- **FR-013**: Respostas de recuperação DEVEM evitar revelar se um endereço de e-mail possui uma conta.
- **FR-014**: Senhas e códigos de ação NÃO DEVEM ser armazenados em documentos do Firestore ou em armazenamento persistente da aplicação.
- **FR-015**: A rotina DEVE apresentar 24 horários consecutivos, começando às 04:00 e encerrando às 03:00 da manhã seguinte.
- **FR-016**: Horários 00:00-03:00 DEVEM pertencer ao mesmo ciclo iniciado às 04:00 do dia civil anterior.
- **FR-017**: Tarefas existentes DEVEM continuar associadas aos campos civis `data` e `horario`, sem migração, perda ou duplicação de documentos.
- **FR-018**: Navegação semanal, criação, edição, conclusão de tarefas e indicadores existentes DEVEM continuar funcionando.
- **FR-019**: O usuário DEVE poder consultar e selecionar projetos existentes da própria conta e associá-los a um horário da rotina.
- **FR-020**: O usuário DEVE poder alterar o horário de um projeto associado e remover a associação sem excluir o projeto original.
- **FR-021**: O Dashboard DEVE apresentar os dados atuais do projeto, quadros e itens pertencentes a ele, preservando suas relações e estrutura existentes.
- **FR-022**: Associações DEVEM permanecer disponíveis após recarregar o Dashboard e permitir múltiplos projetos no mesmo horário.
- **FR-023**: Alterações do Board DEVEM ser refletidas na visualização do projeto pela rotina.
- **FR-024**: Todas as operações de dados DEVEM respeitar a identidade autenticada e impedir acesso cruzado entre usuários.
- **FR-025**: As melhorias DEVEM preservar a interface, navegação e funcionalidades existentes, limitando alterações visuais aos controles necessários.

## Security and Compatibility Constraints

- Cadastro, verificação de e-mail, recuperação de senha e validação/consumo dos respectivos códigos de ação DEVEM utilizar o Firebase Authentication já configurado no Taskly.
- Os dados existentes no Firestore DEVEM permanecer compatíveis; senhas e códigos de ação não podem ser gravados nos documentos da aplicação.
- A redefinição de senha não exige que o endereço esteja verificado, desde que o código enviado à caixa de entrada seja válido.
- A interface deve preservar os componentes e a identidade visual existentes, acrescentando somente os controles necessários para os novos fluxos.

### Key Entities

- **Conta de usuário**: identidade autenticada e estado de verificação do endereço de e-mail.
- **Código de ação**: código temporário associado a uma ação de verificação ou redefinição; validado durante o fluxo e não persistido pela aplicação.
- **Tarefa**: atividade existente, identificada por data civil, horário e estado de conclusão.
- **Projeto**: registro existente do Board que pode ser associado a um horário da rotina.
- **Quadro e item**: conteúdo existente pertencente a um projeto, apresentado sem duplicação.
- **Associação de rotina**: relação de um projeto do usuário com seu horário de exibição, preservando a fonte original do projeto.
- **Ciclo diário**: período apresentado das 04:00 de uma data até às 03:00 da data seguinte.

## Success Criteria

- **SC-001**: Em um fluxo de cadastro válido, o usuário recebe instruções e uma mensagem de verificação; nenhuma conta não verificada acessa áreas privadas.
- **SC-002**: O usuário pode reenviar a verificação, concluir um link válido e prosseguir; links inválidos/expirados permitem recuperação sem recriar a conta.
- **SC-003**: Um usuário consegue redefinir a senha na página do Taskly com link válido, campos válidos e correspondentes, mesmo sem e-mail previamente verificado, e entrar com a nova senha.
- **SC-004**: A tela de redefinição permite verificar visualmente o valor digitado e informa erros de validação antes de concluir a ação.
- **SC-005**: A rotina exibe as 24 horas em sequência de 04:00 a 03:00 e posiciona corretamente tarefas após a meia-noite.
- **SC-006**: Registros de tarefas preexistentes permanecem sem migração, perda ou duplicação.
- **SC-007**: Um usuário pode associar, consultar, reagendar e remover projetos da rotina sem excluir dados do Board; associações permanecem após recarregar.
- **SC-008**: Os dados apresentados para projetos, quadros e itens correspondem ao Board atual, e projetos no mesmo horário permanecem acessíveis.
- **SC-009**: Testes com duas contas não encontram leitura ou alteração cruzada de dados.
- **SC-010**: Cadastro, login, logout, tarefas, projetos, quadros, calendário e indicadores existentes continuam funcionais.

## Assumptions

- A verificação de e-mail é necessária antes do acesso às áreas privadas; enquanto aguarda, o usuário permanece orientado sobre verificação e reenvio.
- Após validar um link de verificação, o fluxo atualiza a sessão/estado do usuário antes de liberar acesso.
- A senha mínima permanece alinhada à validação existente no cadastro do Taskly: seis caracteres.
- A ação de redefinição pode ser concluída por uma conta com e-mail não verificado, desde que o código enviado à caixa de entrada seja válido.
- A associação de um projeto a um horário é recorrente a cada ciclo diário até ser alterada ou removida.
- Horários 00:00-03:00 pertencem à manhã seguinte do ciclo, sem alterar datas civis já persistidas.
- Os projetos, quadros, tarefas e itens continuam usando as estruturas de dados existentes; itens do Board preservam o formato atual.
- A feature não inclui compartilhamento de projetos entre usuários.
