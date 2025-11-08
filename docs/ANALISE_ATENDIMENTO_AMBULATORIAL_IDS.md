# Análise do Módulo de Atendimento Ambulatorial - IDS Saúde

## 1. Conhecendo a tela de Atendimento

### 1.1 Visão Geral
A tela de **Atendimento de Consulta** permite ao profissional:
- Visualizar usuários já triados
- Ver usuários na recepção aguardando triagem
- Visualizar usuários já atendidos
- Ver horário de chegada e outras informações
- Realizar atendimento completo do usuário

### 1.2 Funcionalidades Principais
- **Queixas, anamnese e HDA**
- **Exame Físico**
- **Conduta Adotada**
- **Visualizar resultados de exames** (e cadastrar se necessário)
- **Lançar procedimentos realizados**
- **Prescrição de medicamentos** (realizar e imprimir)
- **Requisição de exames**
- **Guia de referência e contrarreferência** (encaminhamentos)
- **Emissão de documentos** (atestado, declaração de comparecimento, orientações)

### 1.3 Filtros Disponíveis

#### Período
- Campo que apresenta sempre a **Data atual**
- Pode ser alterado para **datas retroativas**

#### Setor
- Lista os setores cadastrados e vinculados para a **Unidade de Pronto Atendimento** (unidade logada)

#### Situação
Permite visualizar registros em diferentes etapas de atendimento. Por padrão, vem selecionado **"Reavaliação"** e **"Triado"**. (NOVA INSTRUÇÃO Aqui vamos fazer somente triados que vão vir do modulo de Acolhimento Ambulatorial como já está configurado)

Opções disponíveis:
- **Recepcionado**: Após o usuário ser incluído em uma Recepção
- **Triado**: Após o usuário ser atendido pela tela de Triagem
- **Em observação**: Após encaminhamento para setor do tipo "Atendimento de Observações"
- **Procedimentos rápidos**: Após encaminhamento para setor do tipo "Atendimento para Medicação/Procedimento"
- **Reavaliação**: Quando o profissional precisa reavaliar o paciente após algum tempo
- **Em atendimento**: Enquanto estiver sendo atendido e ainda não concluído
- **Não atendido**: Quando o atendimento foi cancelado
- **Finalizado**: Quando o paciente recebe Alta/Liberação

### 1.4 Botões de Ação
- **Editar (lápis)**: Inicia o atendimento de consulta (mesma função de duplo clique)
- **Chamar Painel Eletrônico**: Chama o usuário para Atendimento de Consulta
- **Histórico**: Visualiza todo o histórico de tempo do atendimento na UPA
- **Vincular usuário**: Vincula um usuário já cadastrado ao registro de atendimento
- **Cancelar (X)**: Cancela o atendimento (solicita motivo de cancelamento)
- **Documentos**: Acesso aos documentos vinculados à tela

---

## 2. Desfecho da Consulta

### 2.1 Visão Geral
O **desfecho da consulta** serve para definir ações com o usuário e possíveis encaminhamentos.

### 2.2 Tipos de Desfecho

#### 2.2.1 Liberar usuário
- Marca essa opção quando o atendimento é concluído na etapa de Atendimento de consulta
- A situação do atendimento ficará como **Finalizado**
- **Será automaticamente desmarcada** quando existir prescrição de medicamentos do tipo **Medicação interna**

#### 2.2.2 Alta se melhora
- **Relacionado a procedimentos rápidos** que serão realizados
- Se estiver melhor, a enfermagem pode liberar o usuário
- Carrega a informação com a prescrição médica e/ou procedimento e exame para a enfermagem no **Painel de Enfermagem**
- A enfermagem precisa avaliar se o paciente está melhor
- **Geralmente utilizado para soroterapia**

**Quando selecionado:**
- Habilita o campo **Setor** (obrigatório)
- Deve selecionar setor do tipo **Medicação/Procedimento**
- Aparece as informações dos itens prescritos (medicação interna, exames ou procedimentos) no setor encaminhado
- Aparece a informação **"Alta se melhora"**

#### 2.2.3 Alta após medicação/procedimento
- Quando utilizado, carrega a informação com a prescrição médica e/ou procedimento e exame para a enfermagem no **Painel de Enfermagem**
- A enfermagem está **autorizada a liberar o paciente**
- **Geralmente utilizado para medicação rápida**

**Quando selecionado:**
- Habilita o campo **Setor** (obrigatório)
- Deve selecionar setor do tipo **Medicação/Procedimento**
- Aparece as informações dos itens prescritos (medicação interna, exames ou procedimentos) no setor encaminhado
- Aparece a informação **"Alta após medicação/procedimento"**

#### 2.2.4 Reavaliação
- Coloca o paciente para o próprio profissional/setor reavaliar
- Indica o tempo para essa reavaliação
- É possível indicar para outro setor reavaliar
- Quando utilizado, será carregada a informação com a prescrição médica e/ou procedimento e exame para a enfermagem na **(Medicação/Procedimento)**
- A enfermagem deve **retornar à consulta para o médico reavaliar o usuário**

**Campo desabilitado** quando "Liberar usuário" estiver marcado.

**Quando mantido reavaliação para o mesmo setor:**
- Mantém no mesmo setor com Situação = **Reavaliação**
- Quando o paciente vem para reavaliação, é esperado que retorne ao médico de origem (novo atendimento, não alteração)
- Se no processo de reavaliação for realizado desfecho para liberação (sem voltar ao médico de origem), o sistema solicita **justificativa do atendimento para liberação**

**Quando informado setor de encaminhamento do tipo Medicação/Procedimento:**
- Mostra a informação para o setor encaminhado em quanto tempo o profissional solicitou que o usuário seja reavaliado
- Quando encaminhado para setor de Medicação/Procedimento, mostra para o profissional que a reavaliação seja realizada conforme a seleção (15m, 30m...)

**Configuração do setor:**
- Se marcado **"Permitir reavaliação para mesmo setor de atendimento"**: permite selecionar o setor de atendimento e mostra o setor que o profissional está atendendo no campo "Setor"
- Se desmarcado: não mostra o setor que o profissional está atendendo no campo "Setor"

#### 2.2.5 Encaminhamento interno
- Representa que o usuário passou pelo Atendimento, recebeu diagnóstico, mas permite encaminhamento para outros **Setores de Observação**
- Indica a **Especialidade** de forma opcional
- Pode encaminhar para outro Setor

**Campo desabilitado** quando "Liberar usuário" estiver marcado.

**Campos habilitados quando selecionado:**
- **Setor**: Carrega setores vinculados à Unidade de Saúde logada. Setores do tipo "Atendimento de Observações" que realizam atendimento de consultas
- **Especialidade**: Mostra especialidades ativas vinculadas ao setor selecionado (opcional)
  - Se profissional com Especialidade = Qualquer: exibe todas as especialidades cadastradas no profissional com Situação = Ativo
  - Se profissional com Especialidade = Específica: exibe uma ou mais especialidades indicadas no setor
- **Justificativa**: Campo livre para digitação

**Restrição:**
- Não é possível usar "Encaminhamento Interno" para Setor que somente tenha a opção "Atendimento de Observação" marcado (o paciente ficaria preso no sistema)

**Quando encaminhado para outro setor para atendimento de consulta:**
- Salva o atendimento do profissional com as informações do registro de consulta
- Gera o procedimento de consulta para cada setor que for encaminhado o paciente
- Carrega na tela inicial "Atendimento de consultas" para o setor encaminhado com Situação = **Triado**
- Carrega na sequência de atendimento conforme a classificação de risco da triagem
- Mantém na ordem de atendimento que o paciente foi classificado, mesmo após encaminhamento

**Quando outro setor realizar o atendimento:**
- Mostra os dados do atendimento de consulta do setor que encaminhou (mantém dados anteriores)
- Permite incluir e realizar novo registro no atendimento
- Permite encaminhar para outro setor ou para o setor que enviou o atendimento
- Mostra o setor que encaminhou

#### 2.2.6 Observação
- Envia o registro direto para **Observação**
- O atendimento prossegue pela tela de **Atendimento de Observações**
- É necessário indicar para qual **setor de observação** o paciente está sendo encaminhado
- Pode informar ou não as **atividades que a equipe de enfermagem irá realizar**

**Ao clicar nessa opção, o sistema apresenta:**
- Pergunta se deseja informar atividades de enfermagem

**Se clicar em "Sim":**
- Apresenta campo para prescrever as atividades que serão realizadas pela equipe de enfermagem
- Para cada registro de **Atividade**:
  - **Tipo da atividade** (conforme configurações)
  - **Situação** de execução (Agora, Programada, etc.)
  - **Intervalo** (se for programada)
  - **Horário inicial e final** de realização
  - **Observações** referentes à atividade
  - **Procedimentos da atividade** (uma mesma atividade pode ter um ou mais procedimentos vinculados)
    - Se não houver necessidade de realizar algum procedimento, clicar no "x" ao lado do nome

**Opções adicionais:**
- **Urgente**: Marca se é urgente e precisa ser sinalizado para a equipe de enfermagem (aparece ícone de urgência na lista)
- **Alertar**: Quando marcada, apresenta ícone de alerta na lista de atividades. Ao entrar no atendimento de observação para evoluir, alerta o profissional via mensagem

**Funcionalidades:**
- Botão **Confirmar** (visto): Confirma a atividade
- **Adicionar outro item**: Adiciona nova atividade
- **Importar Grupo**: Localiza atividades conforme grupos já pré-definidos
  - Ao escolher um grupo, apresenta todas as atividades com possibilidade de marcar "escolher todas"

#### 2.2.7 Transferência
- Libera do sistema esse usuário
- Permite indicar uma **Unidade de Saúde** (filtra todas as Unidades de saúde ativas no sistema)

#### 2.2.8 Óbito
- Finaliza o registro nessa condição
- Solicita o **"Diagnóstico causa da morte"**

---

## 3. Resumo das Funcionalidades Relacionadas a Atividades de Enfermagem

### 3.1 Flags/Opções que Habilitam Atividades de Enfermagem

Com base na análise, quando selecionado certos desfechos, o sistema habilita campos e funcionalidades relacionadas a atividades de enfermagem:

1. **Alta se melhora**
   - Habilita campo **Setor** (obrigatório) - tipo Medicação/Procedimento
   - Carrega prescrição médica e/ou procedimentos/exames para o Painel de Enfermagem
   - Enfermagem avalia se paciente está melhor antes de liberar

2. **Alta após medicação/procedimento**
   - Habilita campo **Setor** (obrigatório) - tipo Medicação/Procedimento
   - Carrega prescrição médica e/ou procedimentos/exames para o Painel de Enfermagem
   - Enfermagem está autorizada a liberar após realizar medicação/procedimento

3. **Reavaliação**
   - Quando encaminhado para setor de Medicação/Procedimento
   - Enfermagem deve retornar à consulta para o médico reavaliar

4. **Observação**
   - Permite informar atividades de enfermagem
   - Permite prescrever atividades com:
     - Tipo da atividade
     - Situação (Agora, Programada, etc.)
     - Intervalo
     - Horário inicial e final
     - Observações
     - Procedimentos da atividade
     - Marcação de Urgente
     - Marcação de Alertar

### 3.2 Tipos de Atividades de Enfermagem Identificados

Com base no contexto e na solicitação do usuário, as atividades de enfermagem podem incluir:

1. **Aplicação** (de medicamentos)
2. **Curativos**
3. **Vacinas**

Essas são as flags mencionadas pelo usuário que devem ser habilitadas quando selecionado o motivo de desfecho apropriado.

---

## 4. Fluxo de Trabalho Sugerido

### 4.1 Quando o Médico Seleciona "Alta após medicação/procedimento"
1. Médico seleciona o desfecho
2. Sistema habilita campo **Setor** (obrigatório)
3. Médico seleciona setor do tipo **Medicação/Procedimento**
4. Sistema carrega prescrição médica e/ou procedimentos/exames para o Painel de Enfermagem
5. Paciente aparece no módulo de **Procedimentos Rápidos** (Cuidados de Enfermagem)
6. Enfermagem realiza as atividades (Aplicação, Curativos, Vacinas)
7. Enfermagem pode liberar o paciente após realizar as atividades

### 4.2 Quando o Médico Seleciona "Alta se melhora"
1. Médico seleciona o desfecho
2. Sistema habilita campo **Setor** (obrigatório)
3. Médico seleciona setor do tipo **Medicação/Procedimento**
4. Sistema carrega prescrição médica e/ou procedimentos/exames para o Painel de Enfermagem
5. Paciente aparece no módulo de **Procedimentos Rápidos**
6. Enfermagem avalia se paciente está melhor
7. Se melhor, enfermagem pode liberar
8. Se não melhor, paciente retorna para reavaliação médica

### 4.3 Quando o Médico Seleciona "Observação"
1. Médico seleciona o desfecho
2. Sistema pergunta se deseja informar atividades de enfermagem
3. Se "Sim", médico pode prescrever atividades:
   - Tipo da atividade (Aplicação, Curativos, Vacinas)
   - Situação (Agora, Programada)
   - Intervalo
   - Horário inicial e final
   - Observações
   - Procedimentos da atividade
   - Urgente (sim/não)
   - Alertar (sim/não)
4. Paciente é encaminhado para Observação
5. Enfermagem realiza as atividades prescritas

---

## 5. Pontos de Atenção para Implementação

### 5.1 Campos que Devem Ser Habilitados
- **Setor** (obrigatório quando selecionado "Alta se melhora" ou "Alta após medicação/procedimento")
- **Flags de atividades de enfermagem**:
  - Aplicação
  - Curativos
  - Vacinas

### 5.2 Integração com Módulo de Procedimentos Rápidos
- Quando selecionado desfecho que requer atividades de enfermagem, o paciente deve aparecer no módulo de **Procedimentos Rápidos**
- As informações da prescrição médica e/ou procedimentos/exames devem ser carregadas
- O status "Alta se melhora" ou "Alta após medicação/procedimento" deve ser visível

### 5.3 Validações Necessárias
- Setor deve ser do tipo **Medicação/Procedimento** quando selecionado "Alta se melhora" ou "Alta após medicação/procedimento"
- Campo Setor deve ser obrigatório nesses casos
- Atividades de enfermagem devem ser vinculadas ao procedimento rápido criado

---

## 6. Conclusão

O sistema IDS Saúde possui uma estrutura robusta para gerenciar o fluxo de atendimento ambulatorial com integração ao módulo de enfermagem. As principais funcionalidades identificadas são:

1. **Diferentes tipos de desfecho** que habilitam diferentes fluxos
2. **Integração com módulo de Procedimentos Rápidos** (Cuidados de Enfermagem)
3. **Prescrição de atividades de enfermagem** (Aplicação, Curativos, Vacinas)
4. **Fluxo de retorno** para reavaliação médica quando necessário
5. **Controle de status** e rastreabilidade do atendimento

Para implementar no projeto atual, será necessário:
- Adicionar flags de atividades de enfermagem (Aplicação, Curativos, Vacinas) no formulário de desfecho
- Habilitar essas flags quando selecionado desfechos apropriados
- Integrar com o módulo de Procedimentos Rápidos já existente
- Garantir que as atividades sejam criadas corretamente quando o paciente é encaminhado

