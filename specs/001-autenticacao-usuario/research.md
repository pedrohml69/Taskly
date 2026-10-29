# Research: Autenticação e Persistência do Taskly

## Decisões

### 1. Provedor de autenticação

**Decisão:** Utilizar Firebase Authentication com o provedor de email e senha.

**Justificativa:** O Firebase Authentication atende diretamente à necessidade de cadastro e login, além de fornecer gerenciamento de identidade e sessão sem exigir a criação de um sistema próprio de autenticação.

**Alternativas consideradas:**

* Autenticação própria: rejeitada por adicionar complexidade e responsabilidades de segurança desnecessárias ao projeto.
* Autenticação por redes sociais: rejeitada porque o requisito atual utiliza email e senha.

### 2. Armazenamento de dados

**Decisão:** Utilizar Firebase Firestore para armazenar os dados da aplicação.

O Firestore será utilizado para persistir os dados relacionados aos usuários, projetos, tarefas, quadros e itens.

**Justificativa:** O Firestore permite organizar os dados em coleções e documentos, possui integração direta com o Firebase Authentication e permite aplicar regras de segurança baseadas na identidade autenticada.

**Alternativas consideradas:**

* MySQL: rejeitado porque o projeto não utilizará banco de dados relacional.
* Armazenar os dados somente no navegador: rejeitado porque os dados precisam permanecer disponíveis após recarregar a página e em diferentes dispositivos.
* Armazenar os dados somente no Firebase Authentication: rejeitado porque autenticação e dados da aplicação possuem responsabilidades diferentes.

### 3. Responsabilidades do frontend e Firebase

**Decisão:** Preservar o frontend HTML/CSS/JavaScript existente e adicionar somente a lógica necessária para conectá-lo ao Firebase.

O JavaScript será responsável pela interação entre as páginas existentes e os serviços Firebase.

A autenticação será realizada pelo Firebase Authentication e os dados da aplicação serão persistidos no Firestore.

**Justificativa:** O frontend já foi desenvolvido e representa a interface oficial do Taskly. Recriar ou substituir as páginas aumentaria o escopo e poderia alterar a identidade visual já definida.

**Alternativas consideradas:**

* Recriar o frontend: rejeitado porque a interface já está implementada.
* Migrar para um framework frontend: rejeitado porque não é necessário para o escopo atual.
* Utilizar PHP como backend: rejeitado porque o projeto será baseado diretamente nos serviços Firebase e não terá backend PHP.

### 4. Proteção das páginas

**Decisão:** Utilizar o estado de autenticação do Firebase para verificar se existe um usuário autenticado antes de permitir o uso das páginas protegidas.

Quando não houver usuário autenticado, o usuário deverá ser direcionado para a tela de login existente.

**Justificativa:** Isso permite proteger as áreas privadas sem criar um sistema próprio de sessão baseado em PHP.

### 5. Segurança dos dados

**Decisão:** Utilizar Firebase Security Rules para controlar o acesso aos documentos do Firestore.

Os dados privados de um usuário deverão ser acessíveis somente pelo usuário autenticado correspondente, de acordo com as regras definidas para cada recurso.

**Justificativa:** A segurança não deve depender apenas das verificações realizadas pelo JavaScript. As regras do Firebase devem impedir operações não autorizadas diretamente no banco.

### 6. Validação e mensagens

**Decisão:** Realizar validações no frontend para fornecer feedback imediato ao usuário e utilizar as regras e mecanismos do Firebase para impedir operações não autorizadas.

As validações devem incluir, quando aplicável:

* campos obrigatórios;
* formato de email;
* confirmação de senha;
* requisitos de senha;
* dados obrigatórios de tarefas;
* dados obrigatórios de projetos.

**Justificativa:** A validação no frontend melhora a experiência, enquanto a segurança do Firebase garante que a aplicação não dependa exclusivamente do código executado no navegador.

## Questões resolvidas

* O Taskly não utilizará PHP.
* O Taskly não utilizará MySQL ou outro banco relacional.
* Firebase Authentication será responsável pela identidade e autenticação.
* Firebase Firestore será responsável pela persistência dos dados da aplicação.
* Firebase Security Rules será utilizado para proteger os dados.
* O frontend existente será preservado.
* O JavaScript existente será adaptado somente quando necessário para integrar as funcionalidades.
* O dashboard será a página principal após o login.
* Os dados de cada conta permanecerão isolados nesta etapa do projeto.
* Não haverá colaboração entre usuários nesta feature, salvo quando explicitamente especificada posteriormente.
