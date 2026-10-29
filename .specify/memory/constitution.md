# Constituição do Taskly

## Princípios Fundamentais

### I. Clareza e Simplicidade

O Taskly deve permitir que usuários criem, organizem e acompanhem projetos e tarefas com o mínimo de etapas necessárias. A interface deve ser clara, consistente e fácil de utilizar, com mensagens objetivas para erros, confirmações e ações concluídas.

### II. Responsividade e Acessibilidade

As funcionalidades devem funcionar corretamente em computadores, tablets e celulares. A interface deve se adaptar a diferentes tamanhos de tela sem prejudicar a compreensão, a navegação ou a execução das tarefas.

### III. Segurança por Padrão

A autenticação de usuários deve ser realizada pelo Firebase Authentication. Senhas nunca devem ser armazenadas diretamente nos dados da aplicação.

Os dados armazenados no Firebase devem ser protegidos por regras de segurança adequadas. O acesso aos dados deve ser baseado na identidade autenticada do usuário e nas permissões definidas para cada recurso.

As validações realizadas no frontend devem melhorar a experiência do usuário, mas não devem ser consideradas o único mecanismo de proteção dos dados. As regras de segurança do Firebase devem impedir acessos ou alterações não autorizadas.

### IV. Código Modular e Manutenível

O código deve ser organizado de forma clara e modular, com responsabilidades bem definidas.

HTML deve concentrar a estrutura das páginas, CSS deve concentrar a apresentação visual e JavaScript deve concentrar as interações, regras da aplicação e integração com o Firebase.

Alterações devem permanecer restritas ao escopo necessário, e duplicação só deve ser mantida quando uma abstração reutilizável não for apropriada.

### V. Integridade dos Dados

Os dados armazenados no Firebase devem manter relacionamentos consistentes entre usuários, projetos, tarefas, quadros e itens.

Operações de criação, alteração e exclusão devem validar os dados recebidos e respeitar as regras de segurança definidas para cada usuário.

Identificadores de usuário devem ser obtidos a partir da autenticação do Firebase sempre que possível, evitando confiar em identificadores fornecidos diretamente pela interface.

### VI. Especificação Antes da Implementação

Toda funcionalidade nova deve possuir uma especificação antes de sua implementação.

A implementação deve seguir a especificação aprovada, e mudanças relevantes devem atualizar a especificação correspondente.

### VII. Testes e Validação

As funcionalidades devem ser verificadas após a implementação, com atenção especial aos principais fluxos do sistema.

Erros encontrados durante os testes devem ser corrigidos antes de a funcionalidade ser considerada concluída.

Os testes devem incluir, quando aplicável, autenticação, persistência, permissões, acesso não autenticado, isolamento dos dados entre usuários e comportamento responsivo.

## Frontend Existente

O frontend do Taskly já foi desenvolvido previamente e deve ser considerado a base oficial da interface do sistema.

O frontend existente não deve ser recriado, substituído ou redesenhado durante a implementação das funcionalidades.

Os arquivos HTML, CSS e JavaScript existentes, seus layouts, componentes, navegação, identidade visual, cores e interações devem ser preservados sempre que possível.

As alterações no frontend devem ocorrer somente quando forem necessárias para conectar a interface às funcionalidades da aplicação, incluindo:

* autenticação de usuários;
* comunicação com o Firebase;
* carregamento e atualização de dados;
* criação, edição e exclusão de projetos;
* criação, edição e atualização de tarefas;
* atualização de status;
* gerenciamento dos dados do usuário;
* validações;
* mensagens de erro e sucesso;
* estados de carregamento.

A implementação deve priorizar a reutilização do código existente em vez da criação de uma nova interface.

Não devem ser realizadas alterações estéticas ou estruturais sem necessidade funcional.

Quando uma funcionalidade exigir alterações no frontend, a aparência e o comportamento visual já estabelecidos devem ser mantidos.

O frontend existente deve ser tratado como uma parte já implementada do sistema. O trabalho restante deve se concentrar principalmente na lógica da aplicação, integração com Firebase, persistência de dados, autenticação e regras de negócio.

## Arquitetura e Tecnologias

O Taskly será uma aplicação web composta pelo frontend existente e pelos serviços Firebase necessários para autenticação, persistência e segurança.

As tecnologias principais são:

* HTML;
* CSS;
* JavaScript;
* Firebase Authentication;
* Firebase Firestore;
* Firebase Security Rules;
* Git e GitHub.

PHP não faz parte da arquitetura do Taskly e não deve ser introduzido durante a implementação.

Não será utilizado MySQL ou outro banco de dados relacional.

## Fluxo de Desenvolvimento

O desenvolvimento deve seguir o fluxo do Spec-Driven Development:

Constitution → Specification → Clarification → Plan → Tasks → Implementation.

As alterações devem ser pequenas, rastreáveis e relacionadas ao objetivo da tarefa atual.

Funcionalidades existentes devem ser preservadas quando uma nova funcionalidade for implementada.

Toda revisão deve verificar a conformidade com esta Constituição, a especificação da funcionalidade e os testes aplicáveis.

Nenhuma funcionalidade deve ser adicionada apenas por suposição. Decisões relevantes devem estar registradas na especificação ou no plano correspondente.

## Governança

Esta Constituição orienta todas as decisões de produto e engenharia do Taskly.

Em caso de conflito, ela prevalece sobre práticas locais não documentadas.

Alterações na Constituição devem registrar o motivo da mudança, atualizar a versão e revisar as especificações afetadas.

Toda implementação deve declarar eventuais desvios e justificá-los na revisão correspondente.

**Versão**: 1.2.0
**Ratificada**: 2026-09-23
**Última alteração**: 2026-10-04
