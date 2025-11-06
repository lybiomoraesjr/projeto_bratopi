**INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA SÃO PAULO,**  
**CAMPUS BRAGANÇA PAULISTA**  
**TECNOLOGIA EM ANÁLISE E DESENVOLVIMENTO DE SISTEMAS**

   
INÁCIO FERNANDES SANTANA BP3039307  
LYBIO CROTON DE MORAES JUNIOR BP303934X  
MICHELLY VICTORIA NONATO COELHO BP303481X  
VINÍCIUS COIMBRA CARDOSO BP304890X

**Trabalho de Tópicos Especiais:**  
SGTE \- Sistema de Gestão de Transporte Escolar para a Prefeitura de Extrema-MG

Bragança Paulista  
2025  
**SUMÁRIO**

**[1 INTRODUÇÃO	2](#1-introdução)**

[1.1 Contextualização	2](#1.1-contextualização)

[1.2 Justificativa	2](#1.2-justificativa)

[1.3 Objetivos	3](#1.3-objetivos)

[1.3.1 Objetivo Geral	3](#1.3.1-objetivo-geral)

[1.3.2 Objetivos Específicos	3](#1.3.2-objetivos-específicos)

[**2 APRESENTAÇÃO DO PROBLEMA	4**](#2-apresentação-do-problema)

[2.1 Cenário Atual	4](#2.1-cenário-atual)

[2.2 Principais Dificuldades e Riscos	5](#2.2-principais-dificuldades-e-riscos)

[3\. PROPOSTA DE SOLUÇÃO: O SISTEMA DE GERENCIAMENTO DE ROTAS ESCOLARES	6](#3.-proposta-de-solução:-o-sistema-de-gerenciamento-de-rotas-escolares)

[3.1. Visão Geral	6](#3.1.-visão-geral)

[3.2. Escopo do Projeto	6](#3.2.-escopo-do-projeto)

[3.2.1. Escopo Mínimo Viável (MVP \- Entregável na Disciplina)	7](#3.2.1.-escopo-mínimo-viável-\(mvp---entregável-na-disciplina\))

[**4 CASOS DE USO (REFERENTES AO MVP)	8**](#4-casos-de-uso-\(referentes-ao-mvp\))

[**5\. ARQUITETURA E TECNOLOGIAS	12**](#5.-arquitetura-e-tecnologias)

[5.1 Arquitetura da Aplicação:	12](#5.1-arquitetura-da-aplicação:)

[5.2 Diagrama de implantação	12](#5.2-diagrama-de-implantação)

[5.3 Tecnologias (Stack):	13](#5.3-tecnologias-\(stack\):)

# **1 INTRODUÇÃO** {#1-introdução}

## **1.1 Contextualização** {#1.1-contextualização}

Este projeto propõe o desenvolvimento de um sistema web para a modernização da gestão do transporte escolar da Prefeitura de Extrema, Minas Gerais. Atualmente, o controle de informações críticas — como o cadastro de alunos, a definição de rotas, o gerenciamento de veículos e a alocação de pontos de parada — é realizado de forma manual, com o uso de planilhas eletrônicas e anotações manuais. Este método, embora funcional, apresenta desafios significativos em termos de agilidade, segurança e consolidação de dados. A proposta consiste na criação de uma plataforma centralizada, projetada para otimizar e automatizar esses processos, oferecendo uma solução robusta e escalável para a administração municipal.

## **1.2 Justificativa** {#1.2-justificativa}

A utilização de planilhas para gerenciar um serviço público tão essencial quanto o transporte escolar impõe limitações significativas. A falta de um banco de dados integrado aumenta o risco de inconsistências, duplicidade de informações e perda de dados, além de tornar o processo de atualização lento e suscetível a erros humanos. O processo manual também dificulta a análise de indicadores importantes para o planejamento estratégico, como a demanda de alunos por região ou a otimização de rotas existentes.

Em suma, o projeto visa transformar um processo manual e vulnerável em um sistema digital seguro, ágil e inteligente, resultando em um melhor aproveitamento dos recursos públicos e um serviço mais confiável para os alunos e suas famílias.

## **1.3 Objetivos** {#1.3-objetivos}

Para guiar o desenvolvimento do projeto, foram definidos os seguintes objetivos:

### 1.3.1 Objetivo Geral {#1.3.1-objetivo-geral}

Desenvolver uma plataforma centralizada para gerenciar de forma eficiente e segura os dados do transporte escolar municipal.

### 1.3.2 Objetivos Específicos {#1.3.2-objetivos-específicos}

Para alcançar o objetivo principal, foram traçados os seguintes passos:

* Digitalizar o processo de cadastro de alunos, rotas e paradas.  
* Prover uma interface intuitiva para os administradores.  
* Centralizar as informações em um banco de dados seguro.  
* Criar a base para futuras implementações de análise de dados e monitoramento.

# **2 APRESENTAÇÃO DO PROBLEMA** {#2-apresentação-do-problema}

## **2.1 Cenário Atual** {#2.1-cenário-atual}

A gestão do transporte escolar na Prefeitura de Extrema-MG é atualmente sustentada por um processo majoritariamente manual, que utiliza planilhas do Microsoft Excel como ferramenta central para o controle de todas as operações. Dados críticos de alunos, motoristas, monitores, veículos, rotas e pontos de parada são registrados e mantidos em diferentes arquivos ou abas, sem uma integração nativa entre si.  
Este método resulta em uma considerável **dificuldade para consolidar informações**. Para realizar tarefas simples, como verificar quantos alunos estão alocados em uma determinada rota, os funcionários precisam cruzar dados de múltiplas planilhas manualmente. Consequentemente, o **processo de cadastro e atualização é lento e altamente suscetível a erros humanos**. Problemas como a duplicidade de dados, informações de contato desatualizadas e inconsistências no nome de ruas são comuns, comprometendo a confiabilidade das informações.  
Além disso, o modelo atual sofre com a **falta de visibilidade e indicadores em tempo real**. A extração de qualquer dado quantitativo para análise gerencial exige um esforço manual de filtragem, contagem e elaboração de gráficos, o que impede uma visão instantânea e precisa do estado atual do serviço.

## **2.2 Principais Dificuldades e Riscos** {#2.2-principais-dificuldades-e-riscos}

As limitações do cenário atual se traduzem em dificuldades e riscos operacionais que afetam diretamente a qualidade e a segurança do serviço prestado. Os principais pontos de atenção são:

* **Risco de perda ou corrupção de dados:** Arquivos de planilha são vulneráveis a deleções acidentais, falhas de salvamento e corrupção. Não há um sistema de backup centralizado e versionado, o que torna a recuperação de informações uma tarefa incerta e arriscada.  
* **Ineficiência na alocação de alunos por rota/veículo:** Sem um sistema que controle automaticamente a capacidade dos veículos e a quantidade de alunos por rota, a alocação é feita de forma manual e visual. Isso pode levar à **superlotação** de veículos, representando um sério risco de segurança, ou, ao contrário, à subutilização de recursos.  
* **Dificuldade para gerar relatórios e obter dados estratégicos:** A tomada de decisões importantes, como a criação de novas rotas, a readequação de itinerários ou a compra de novos veículos, fica prejudicada. A gestão não possui acesso fácil a relatórios consolidados que permitam uma análise estratégica da demanda e da operação.  
* **Ausência de uma visão geográfica:** O formato de planilha não permite uma análise espacial da operação. É impossível visualizar em um mapa a distribuição dos alunos, a concentração em determinados bairros ou o traçado das rotas, o que impede a otimização logística e a identificação de trajetos mais eficientes

### **3\. PROPOSTA DE SOLUÇÃO: O SISTEMA DE GERENCIAMENTO DE ROTAS ESCOLARES** {#3.-proposta-de-solução:-o-sistema-de-gerenciamento-de-rotas-escolares}

#### **3.1. Visão Geral** {#3.1.-visão-geral}

A solução proposta consiste no desenvolvimento de uma aplicação web robusta, intitulada Sistema de Gerenciamento de Rotas Escolares (SGRE). Este sistema foi concebido para substituir integralmente o atual processo de gestão baseado em planilhas, atacando diretamente as ineficiências e os riscos identificados. Por meio de uma interface gráfica moderna e intuitiva, o SGRE centralizará todas as informações em um banco de dados único e seguro, automatizando as tarefas de cadastro, consulta e gerenciamento de dados. A plataforma permitirá que os administradores da prefeitura tenham um controle preciso e em tempo real sobre toda a operação do transporte escolar, garantindo maior agilidade, segurança da informação e confiabilidade nos dados.

## **3.2. Escopo do Projeto** {#3.2.-escopo-do-projeto}

Para garantir uma entrega de valor dentro do cronograma acadêmico, o desenvolvimento do projeto foi estrategicamente dividido. O foco inicial será a construção de um Produto Mínimo Viável (MVP), que engloba as funcionalidades essenciais para resolver o problema central da prefeitura. Esta abordagem permite entregar um sistema funcional e testado, que servirá como alicerce sólido para futuras expansões e para a implementação de funcionalidades mais complexas, como dashboards e monitoramento em tempo real.

## **3.2.1. Escopo Mínimo Viável (MVP \- Entregável na Disciplina)** {#3.2.1.-escopo-mínimo-viável-(mvp---entregável-na-disciplina)}

O MVP foi projetado para digitalizar e automatizar o núcleo da operação de transporte. Ao final desta fase, o sistema será capaz de gerenciar de forma independente as entidades principais do processo, eliminando a necessidade de planilhas. As funcionalidades que compõem esta entrega são:

* **Módulo de Autenticação de Usuários:** Implementação de um sistema de login e logout seguro, garantindo que apenas usuários autorizados (funcionários da secretaria) possam acessar e manipular as informações do sistema.  
* **Gerenciamento de Alunos (CRUD Completo):** O sistema permitirá o ciclo de vida completo do cadastro de alunos, incluindo funcionalidades para:  
  * **C**adastrar novos alunos com seus dados pessoais e escolares.  
  * **L**er (visualizar e buscar) a lista de todos os alunos cadastrados.  
  * **A**tualizar as informações de um aluno existente.  
  * **D**eletar (remover) o registro de um aluno do sistema.  
* **Gerenciamento de Rotas (CRUD Completo):** Módulo dedicado à criação e manutenção das rotas de transporte, permitindo ao usuário cadastrar, visualizar, editar e remover rotas.  
* **Gerenciamento de Pontos de Parada (CRUD Completo):** Funcionalidade para registrar todos os pontos de embarque e desembarque dos alunos, permitindo cadastrar, visualizar, editar e remover paradas.  
* **Associação entre Entidades:** O sistema incluirá a funcionalidade essencial de conectar os dados, permitindo que o administrador possa **associar um aluno a uma rota e a um ponto de parada específico**, tanto para a ida quanto para a volta. Esta é a funcionalidade-chave que substitui o cruzamento manual de informações feito nas planilhas.

# **4 CASOS DE USO (REFERENTES AO MVP)** {#4-casos-de-uso-(referentes-ao-mvp)}

Liste e descreva brevemente os principais casos de uso que serão implementados na primeira entrega.

UC01: Fazer login 

| Caso de Uso: Fazer login |
| :---- |
| Descrição: Este caso de uso permite que um usuário autenticado acesse as funcionalidades do sistema. |
| Ator Primário: Secretário |
| Ator(es) Secundário(s): Nenhum. |
| Precondições: O Secretário deve possuir um cadastro prévio no sistema com login e senha. |
| Fluxo Principal: 1\) O Secretário acessa a página de login e informa seu email e senha. (Estímulo) |
| Fluxo Principal: 2\) O sistema verifica se as credenciais fornecidas são válidas. (Resposta) |
| Fluxo Principal: 3\) O sistema autentica o usuário e o redireciona para a página principal (Dashboard). (Resposta) |
| Fluxo de Exceção (2): Se as credenciais estiverem incorretas, o sistema exibe uma mensagem de erro e solicita uma nova tentativa. |
| Pós-condições: O Secretário está autenticado no sistema e pode acessar as funcionalidades permitidas. |
| Regras de Negócio Relacionadas: |
| RN01: O acesso ao sistema é restrito a usuários previamente cadastrados pela administração. |

UC02: Cadastrar Aluno

| Caso de Uso: Cadastrar Aluno |
| :---- |
| Descrição: Este caso de uso permite ao Secretário cadastrar um novo aluno no sistema de transporte. |
| Ator Primário: Secretário |
| Ator(es) Secundário(s): Nenhum. |
| Precondições: O Secretário deve estar autenticado no sistema. |
| Fluxo Principal: 1\) O Secretário seleciona a opção "Cadastrar Aluno". (Estímulo) |
| Fluxo Principal: 2\) O sistema exibe o formulário de cadastro de aluno (campos: nome, CPF, escola, etc.). (Resposta) |
| Fluxo Principal: 3\) O Secretário preenche os dados do aluno e confirma o cadastro. (Estímulo) |
| Fluxo Principal: 4\) O sistema valida os dados (ex: verifica se o CPF já está cadastrado) e salva o novo aluno. (Resposta) |
| Fluxo Principal: 5\) O sistema exibe uma mensagem de sucesso e atualiza a lista de alunos. (Resposta) |
| Fluxo de Exceção (4a): Se o CPF informado já pertencer a outro aluno, o sistema exibe um erro de duplicidade e não salva o cadastro. |
| Fluxo de Exceção (4b): Se um campo obrigatório não for preenchido, o sistema exibe um erro, destaca o campo e solicita o preenchimento. |

UC03: Cadastrar nova rota.

| Caso de Uso: Cadastrar Nova Rota |
| :---- |
| Descrição: Este caso de uso permite ao Secretário criar uma nova rota para o transporte dos alunos. |
| Ator Primário: Secretário |
| Ator(es) Secundário(s): Nenhum. |
| Precondições: O Secretário deve estar autenticado no sistema. E as paradas das rotas ja estarem cadastradas |
| Fluxo Principal: 1\) O Secretário seleciona a opção "Gerenciar Rotas" e, em seguida, "Cadastrar Nova Rota". (Estímulo) |
| Fluxo Principal: 2\) O sistema exibe o formulário de cadastro de rota (campos: Nome/Código da Rota, Descrição). (Resposta) |
| Fluxo Principal: 3\) O Secretário preenche os dados da nova rota e confirma. (Estímulo) |
| Fluxo Principal: 4\) O sistema valida se o nome/código da rota já não existe e salva a nova rota no banco de dados. (Resposta) |
| Fluxo Principal: 5\) O sistema exibe uma mensagem de sucesso e adiciona a nova rota à lista de rotas existentes. (Resposta) |
| Fluxo de Exceção (4): Se o Nome/Código da rota informado já estiver em uso, o sistema exibe uma mensagem de erro e solicita um identificador único. |
| Pós-condições: Uma nova rota é criada e fica disponível para associação de paradas e alunos. |

UC04: Cadastrar uma nova parada

| Caso de Uso: Cadastrar Nova Parada |
| :---- |
| Descrição: Este caso de uso permite ao Secretário adicionar um novo ponto de parada a uma rota já existente. |
| Ator Primário: Secretário |
| Ator(es) Secundário(s): Nenhum. |
| Precondições: O Secretário deve estar autenticado  |
| Fluxo Principal: 1\) O Secretário seleciona uma rota existente e escolhe a opção "Adicionar Parada". (Estímulo) |
| Fluxo Principal: 2\) O sistema exibe o formulário para a nova parada (endereço, ponto de referência, ordem na rota). (Resposta) |
| Fluxo Principal: 3\) O Secretário preenche os dados da parada e confirma. (Estímulo) |
| Fluxo Principal: 4\) O sistema valida os dados e salva a nova parada. (Resposta) |
| Fluxo Principal: 5\) O sistema exibe uma mensagem de sucesso e atualiza a lista de paradas. (Resposta) |
| Pós-condições: Um novo ponto de parada é registrado. |

# **5\. ARQUITETURA E TECNOLOGIAS** {#5.-arquitetura-e-tecnologias}

## **5.1 Arquitetura da Aplicação:** {#5.1-arquitetura-da-aplicação:}

Abaixo está descrito o modelo cliente-servidor.

**Frontend (Cliente):** Aplicação Single-Page Application (SPA) desenvolvida em React, responsável pela interface do usuário.

**Backend (Servidor):** API RESTful desenvolvida em Node.js, responsável pelas regras de negócio e comunicação com o banco de dados.

**Banco de Dados:** MongoDB (NoSQL), responsável pela persistência dos dados.

## **5.2 Diagrama de implantação** {#5.2-diagrama-de-implantação}

![][image1]

## **5.3 Tecnologias (Stack):** {#5.3-tecnologias-(stack):}

**Frontend:** React com TypeScript (Justificativa: componentização, tipagem para maior segurança e manutenibilidade do código).

**Backend:** Node.js com Express.js (Justificativa: alta performance para operações de I/O, ecossistema robusto e uso da mesma linguagem do frontend).

**Banco de Dados:** MongoDB (Justificativa: flexibilidade de esquema (schema less), boa performance e escalabilidade, ideal para o tipo de dados do projeto).

**Controle de Versão:** Git / GitHub.

**Conteinerização:** Docker

[image1]: <data:image/png;base64,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>