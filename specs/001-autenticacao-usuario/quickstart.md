# Quickstart: Validação do Taskly

## Pré-requisitos

* Projeto Firebase criado.
* Aplicativo Web configurado no Firebase.
* Firebase Authentication habilitado.
* Provedor Email/Password habilitado no Firebase Authentication.
* Firebase Firestore habilitado.
* Regras de segurança do Firestore configuradas.
* Frontend existente do Taskly disponível no projeto.
* Navegador moderno compatível com Firebase Web SDK.

## Configuração

1. Criar ou utilizar um projeto no Firebase Console.
2. Adicionar uma aplicação Web ao projeto Firebase.
3. Configurar o Firebase Web SDK no projeto Taskly.
4. Habilitar o método Email/Password no Firebase Authentication.
5. Criar o banco Firestore.
6. Configurar as Firebase Security Rules.
7. Associar o frontend existente à configuração do Firebase.
8. Executar o frontend utilizando um servidor local compatível com aplicações web estáticas.

PHP não é necessário para executar ou integrar o Taskly.

## Cenários de validação

### Cenário 1: Cadastro bem-sucedido

* Abrir a página existente de cadastro.
* Informar nome, email e senha válidos.
* Enviar o formulário.
* Resultado esperado: uma conta é criada no Firebase Authentication e o perfil correspondente é persistido no Firestore.

### Cenário 2: Email duplicado

* Tentar criar uma segunda conta utilizando um email já registrado.
* Resultado esperado: o Firebase rejeita o cadastro e a interface apresenta uma mensagem clara.

### Cenário 3: Login inválido

* Utilizar um email válido com senha incorreta.
* Resultado esperado: o login é rejeitado e uma mensagem compreensível é exibida.

### Cenário 4: Login válido

* Utilizar credenciais válidas.
* Resultado esperado: o usuário é autenticado e encaminhado ao dashboard existente.

### Cenário 5: Acesso sem autenticação

* Abrir diretamente uma página protegida sem estar autenticado.
* Resultado esperado: o acesso aos dados protegidos é bloqueado e o usuário é encaminhado para o login.

### Cenário 6: Isolamento entre usuários

* Criar duas contas diferentes.
* Criar dados utilizando cada conta.
* Tentar acessar os dados de uma conta utilizando a outra.
* Resultado esperado: cada usuário consegue acessar somente os dados permitidos pelas regras do Firebase.

### Cenário 7: Persistência

* Criar uma tarefa ou projeto.
* Recarregar a página.
* Sair da conta.
* Entrar novamente.
* Resultado esperado: os dados continuam disponíveis para o usuário correto.

### Cenário 8: Responsividade

* Abrir o sistema em desktop, tablet e celular.
* Resultado esperado: os layouts existentes continuam utilizáveis sem quebra visual crítica.
