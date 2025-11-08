# Regras e Requisitos - Módulo Procedimentos Rápidos

## 📋 Sumário
Este documento contém todas as regras de negócio e requisitos extraídos da documentação do sistema IDS Saúde para o módulo de Procedimentos Rápidos.

---

## 1. Procedimentos Rápidos - Visão Geral

### 1.1 Descrição
Tela onde os profissionais de enfermagem registram ações envolvendo a execução de Atividades de atendimento, como:
- Administração de medicação
- Realização de exames
- Verificação de sinais vitais
- Aplicação de vacinas
- Procedimentos e cuidados com o paciente no geral

### 1.2 Formas de Encaminhamento

Os procedimentos podem ser encaminhados para a equipe de enfermagem de três formas:

#### 1.2.1 Encaminhado pela Recepção
- Pacientes que procuram a UPA para realizar procedimento externo solicitado em outro atendimento
- Exemplos: Curativo, inalação com prescrição, vacinas, etc.

#### 1.2.2 Encaminhado pela Triagem
- Pacientes atendidos pela triagem
- Identificado que o paciente não precisa de consulta, apenas de procedimento externo

#### 1.2.3 Encaminhado pelo Médico
- Pacientes atendidos em consulta
- Necessitam de intervenção da enfermagem

### 1.3 Filtros da Tela

#### 1.3.1 Período
- Campo que apresenta sempre a **Data atual**
- Pode ser alterado para **datas retroativas**

#### 1.3.2 Setor
- Lista os setores cadastrados e vinculados à UPA (unidade logada)
- Filtra por setor específico

#### 1.3.3 Situação
- Permite visualizar registros em diferentes etapas de atendimento
- **Padrão ao abrir**: "Recepcionado", "Triado" e "Procedimentos Rápidos" já selecionados
- Opções disponíveis:
  - **Recepcionado**: Atribuída após inclusão na Recepção
  - **Triado**: Atribuída após atendimento na Triagem
  - **Em observação**: Atribuída após encaminhamento para setor tipo "Atendimento de Observações"
  - **Procedimentos rápidos**: Atribuída após encaminhamento para setor tipo "Atendimento para Medicação/Procedimento"
  - **Reavaliação**: Atribuída quando profissional precisa reavaliar após tempo necessário (definido no Desfecho)
  - **Em atendimento**: Atribuída enquanto registro está sendo atendido e não foi concluído
  - **Não atendido**: Atribuída quando atendimento foi cancelado
  - **Finalizado**: Atribuída quando paciente recebe Alta/Liberação

#### 1.3.4 Pesquisa
- Permite pesquisar por:
  - Código do usuário
  - Nome do usuário (pode ser nome social)
  - Nome do profissional
  - Setor
  - Outros dados relevantes

### 1.4 Botões de Ação

#### 1.4.1 Botão Configurações
- Permite parametrizar ações de impressão e exibição de dados
- Configurações específicas por operador

#### 1.4.2 Botão Expandir Painel
- Expande a tela totalmente no monitor
- Para retornar: clicar novamente ou pressionar **ESC**

#### 1.4.3 Botão Atualizar
- Busca registros atualizados no momento
- Atualiza informações/situações dos registros

### 1.5 Botões de Ação por Registro

Os botões variam conforme o tipo de Registro/Situação:

- **Recepcionado ou Triado**: Botão "Cancelar"
- **Em Observação e Procedimentos Rápidos**: Botão "Histórico"
- **Novo usuário não identificado**: Botão "Vincular usuário"
- **Demais situações**: Botões específicos conforme necessidade

#### 1.5.1 Botão Editar (lápis)
- Permite realizar qualquer alteração no registro
- Permite registrar e executar Atividades

#### 1.5.2 Botão Chamar Painel Eletrônico
- Chama usuário no painel eletrônico
- **Exibido apenas quando**: tipo do registro é Recepcionado ou Triado

#### 1.5.3 Botão Continuação
- Ao ser acessado, possibilita as ações:
  - **Cancelar**: Cancela o atendimento

#### 1.5.4 Botão Cancelar
**Quando acionado, executa automaticamente a tela "Usuário não atendido" solicitando:**

- **Motivo de cancelamento**:
  - Opção de preenchimento **obrigatório**
  - Filtra apenas motivos ativos e disponíveis para atendimento de consultas

- **Observações**:
  - **Obrigatório somente se** o usuário contiver atividades pendentes não executadas

- **Botão Cancelar**: Aborta o cancelamento do atendimento

- **Botão Gravar**: 
  - Cancela o atendimento de procedimentos rápidos
  - **Se houver atividades pendentes**, solicita mensagem:
    - *"O usuário possui atividades pendentes para execução, deseja cancelar todas as atividades?"*
    - **Sim**: Cancela todas as atividades adicionando observação de cancelamento padrão e cancelando o atendimento
    - **Não**: Aborta o cancelamento do atendimento

#### 1.5.5 Botão Histórico
- Visualiza todo o histórico de tempo do atendimento do usuário dentro da UPA
- Mostra tempo inicial e rastreabilidade pelos atendimentos

#### 1.5.6 Botão Vincular usuário
- **Exibido apenas quando**: existe registro de "Novo usuário não identificado"
- Ao clicar, apresenta tela solicitando qual usuário já cadastrado no sistema
- Realiza vínculo com o atendimento

#### 1.5.7 Botão Documentos
- Acesso aos documentos vinculados com essa tela específica
- Alguns documentos podem ser gerados no momento de gravar o registro
- Permite reimprimir documentos quando necessário

### 1.6 Indicadores de Atividade

Antes dos botões de ação constam imagens que identificam o tipo de Atividade prescrita:
- Cuidados com o paciente
- Prescrição de medicamentos
- Sinais Vitais
- Aplicação de vacinas
- Exames
- Outros

**Cores dos Indicadores:**
- **Azul**: Atividade Situação = "Pendente"
- **Verde**: Atividade Situação = "Executado"
- **Vermelho**: Atividade Situação = "Pendente + Urgente"

### 1.7 Indicador de Tempo de Espera

- Símbolo de relógio informa tempo que paciente está aguardando
- Informa limites de tempo e tempo excedido
- **Cor vermelha**: Atendimento em atraso
- **Cor verde**: Dentro do tempo classificado

---

## 2. Procedimentos Rápidos: Inclusão de Registro sem Encaminhamento

### 2.1 Descrição
Permite incluir um atendimento para o paciente de forma direta, sem vínculo com atendimento médico.

### 2.2 Requisitos
- **Privilégio necessário**: Acesso à tela para a ação
- **Botão**: Clicar no botão **"+"**

### 2.3 Dados Obrigatórios
1. **Usuário**
2. **Setor**
3. **Especialidade**

### 2.4 Fluxo
1. Preencher dados obrigatórios
2. **Gravar** o registro
3. **Executar** o registro para informar dados referentes aos procedimentos

---

## 3. Procedimentos Rápidos: Execução de Atividades de Atendimento

### 3.1 Descrição
Registro e execução das atividades de atendimento prescritas para o paciente.

### 3.2 Funcionalidades
- Registrar atividades de enfermagem
- Executar atividades prescritas
- Marcar atividades como executadas
- Registrar observações sobre a execução

---

## 4. Procedimentos Rápidos: Aprazamento de Medicações

### 4.1 Descrição
Permite ajustar o aprazamento das prescrições de medicamentos e seus intervalos após o início da primeira medicação.

### 4.2 Requisitos de Acesso
- **Privilégio necessário**: "Permite novo horário para execução de atividades programadas"
- **Aplicável para**: Telas de "Atividades de observação" e/ou "Procedimentos rápidos"

### 4.3 Funcionamento

#### 4.3.1 Visualização
- Atividades de Prescrição de Medicamentos aparecem em ordem crescente de data e horário
- Apresenta total de registros: "1/4", "2/4", "3/4", etc.

#### 4.3.2 Execução da Primeira Atividade
- Ao executar a primeira atividade (ex: "1/4"), são disponibilizadas:
  - Atividade selecionada
  - Nº da atividade
  - Data e horário

#### 4.3.3 Botão de Aprazamento
- **Localização**: Ao lado da informação sobre a atividade (após campo horário inicial)
- **Visibilidade**: Somente para atividades **Programadas**

### 4.4 Validações do Aprazamento

#### 4.4.1 Dados Solicitados
- **Nova data e hora da atividade**
- Sistema sugere a data e hora da atividade atual

#### 4.4.2 Regras de Validação
1. **Deve ser maior que** a data e hora inicial da atividade de atendimento
2. **Deve ser maior que** as execuções anteriores
3. **Permite aprazamento de no máximo um dia** a partir da data e hora atual

#### 4.4.3 Confirmação Obrigatória
Mensagem exibida:
*"Você está ciente que está alterando o horário inicial desta atividade e das relacionadas a esta programação. Deseja alterar o horário e recalcular as demais atividades respeitando o intervalo e período solicitado?"*

- **Sim**: Atualiza recalculando todas as atividades com nova data e hora
  - Apenas atividades **pendentes** são recalculadas
  - Respeita intervalo e período
  - **Exemplo**: Intervalo 1h, atividades 13:00 e 14:00. Novo horário 13:30 → atividades ficam 13:30 e 14:30
  
- **Não**: Processo cancelado, volta ao estado anterior

#### 4.4.4 Auditoria
- Sistema grava informação do **horário anterior** para histórico
- Registra **operador** que executou o processo

#### 4.4.5 Validação de Execução
- **Se já houver atividades executadas na sequência**: 
  - Sistema apresenta mensagem: *"Não é possível informar novo horário pois existem atividades já executadas"*
  - Aprazamento não é permitido

---

## 5. Procedimentos Rápidos: Aplicação de Vacinas

### 5.1 Descrição
Realização de aplicações de vacinas pela tela de Procedimentos Rápidos.

### 5.2 Acesso
- Com registro em modo de edição
- Clicar no botão **"Aplicação de Vacinas"**
- Aguardar nova tela ser apresentada
- Clicar em **"Incluir"**

### 5.3 Aba Vacina

#### 5.3.1 Dados Automáticos
- **Unidade de Saúde**: Buscada automaticamente (dados do operador logado)
- **Local de Armazenamento**: Buscado automaticamente (dados do operador logado)
- **Profissional**: Buscado automaticamente (profissional vinculado ao operador)
- **Especialidade**: Buscada automaticamente (profissional vinculado ao operador)
- **Área**: Buscada automaticamente (profissional vinculado ao operador)
  - *Pode ser modificada se necessário*

#### 5.3.2 Dados Obrigatórios/Importantes

- **Local de Atendimento**: 
  - Necessário para enviar dados corretamente ao e-SUS AB
  - Deve informar o Local onde foi realizada a Aplicação de Vacinas

- **Tipo = Aplicação**:
  - Quando a vacina é aplicada na Unidade de Saúde por um profissional
  - **Controle de estoque**: Se a unidade trabalha com controle de estoque, usar tipo "Aplicação" diminui o estoque (dá baixa)

- **Data/Hora Inclusão**:
  - Data e hora em que foi inclusa a Aplicação de Vacinas no sistema

- **Usuário**:
  - Nome ou Código do usuário que receberá a aplicação da vacina

- **Gestante**:
  - Marcar opção se o usuário for gestante

- **Puérpera**:
  - Marcar opção se o usuário for puérpera
  - **Habilitado somente quando**: Usuário do sexo Feminino, idade 10 a 50 anos, e campo "Gestante" não selecionado

- **Comunicante de Hanseníase**:
  - Marcar opção se o usuário for comunicante de hanseníase

- **Usuário Renal Crônico**:
  - Marcar opção se o usuário for usuário renal crônico

- **Viajante**:
  - Marcar opção se o usuário estiver só de passagem pelo município

- **Grupo de Atendimento**:
  - Indicar grupo que o usuário é considerado
  - Exemplos: População em Geral, Indígenas, Militares, etc.
  - **Cadastro padrão**: Não permite novos tipos

- **Estratégia de Vacinação**:
  - Conforme imunobiológico indicado para cada Vacina
  - Sistema tem estratégias vinculadas
  - **Disponível apenas para** a Vacina conforme vinculação

- **Vacina**:
  - Nome ou Código da vacina que será aplicada
  - Botão com lupa: busca no cadastro de vacinas
  - Pode pesquisar por: Imunobiológico, Via de Administração, etc.

- **Imunobiológico**:
  - Buscado automaticamente conforme vacina indicada

- **Obrigatória (Sim ou Não)**:
  - Buscado automaticamente conforme vacina indicada

- **Idade**:
  - Buscada automaticamente conforme usuário informado

- **Via de Administração**:
  - Buscada automaticamente conforme vacina indicada

- **Dosagem**:
  - Conforme vacina indicada, sistema apresenta todas as doses necessárias para controle

- **Local de Aplicação**:
  - Indicar conforme local onde a vacina foi aplicada no usuário
  - **Cadastro padronizado**: Não permite novos tipos

- **Quantidade Aplicada**:
  - Quantidade que está sendo aplicada da vacina
  - Pode controlar por doses ou por mililitro (ml)
  - **Padrão**: Buscado do cadastro da Vacina

- **Laboratório Produtor**:
  - Indicar laboratório que produziu a vacina (imunização)

- **Motivo de Indicação**:
  - Conforme imunobiológico indicado para cada Vacina
  - Sistema tem motivos vinculados
  - **Disponível apenas para** a Vacina conforme vinculação

- **Lote**:
  - Sistema apresenta dados do Lote com Data de Vencimento correspondente
  - Lote é da vinculação com o insumo correspondente à vacina

- **Frasco e Saldo do Frasco**:
  - **Quando**: Vacina controlada por frascos (conforme cadastro)
  - Sistema solicita que um frasco seja aberto
  - **Saldo do Frasco**: Gerenciado pelo sistema
    - A partir da quantidade de doses que um frasco possui
    - Conforme aplicações que vão sendo realizadas

- **Operador**:
  - Sistema indica o operador logado no sistema realizando os registros

### 5.4 Aba Observações
- Incluir dados relevantes ao usuário
- Observações sobre as Aplicações de Vacinas Realizadas
- **Limite**: Até 2000 caracteres por registro

### 5.5 Gravação
- Clicar no **Botão Gravar** para gravar registro no banco de dados
- Fechar tela e retornar à utilização no sistema UPA

### 5.6 Requisitos de Privilégio
- Operador deve ter privilégios no sistema IDS Saúde
- **Módulo**: Imunização
- **Tela**: Aplicações de Vacinas

---

## 6. Procedimentos Rápidos: Desbloquear um Atendimento

### 6.1 Descrição
Função para desbloquear atendimentos incompletos que ficaram travados por:
- Queda de energia
- Falha de comunicação com sistema/rede/banco
- Profissional ausente por troca de turno
- Atendimento deixado em aberto

### 6.2 Requisitos de Acesso
- **Privilégio necessário**: "Retornar estágio de atendimento"
- **Aplicável para telas**:
  - Triagem
  - Atendimento de consulta
  - Procedimentos Rápidos
  - Atendimento de observação

### 6.3 Condições para Exibição da Opção

A opção para **Desbloquear** será apresentada quando:
1. **Situação da(s) tela(s) = "Em atendimento"**
2. **Atendimento está em aberto** (sem finalização)
3. **Operador for diferente** do operador que está em atendimento
4. **Operador contiver privilégio** "Retornar estágio de atendimento" = sim

### 6.4 Fluxo de Desbloqueio

1. Clicar na opção **"Desbloquear"**
2. Sistema apresenta mensagem de confirmação:
   - *"Sim, desbloquear atendimento"* ou *"Não"*
3. **Se clicar em "Sim, desbloquear atendimento"**:
   - Atendimento será liberado
   - Operador que está realizando a ação de desbloqueio pode realizar o atendimento
   - Segue fluxo normal de atendimento e registro dos dados

---

## 📝 Checklist de Implementação

### ✅ Funcionalidades Implementadas
- [x] Estrutura básica do módulo Procedimentos Rápidos
- [x] Entidades e repositórios
- [x] Controllers e serviços básicos
- [x] Integração com módulo de atendimento médico (encaminhamento)
- [x] Criação direta de procedimentos rápidos
- [x] Escalas de avaliação (Morse, Braden, Fugulin, Glasgow, EVA)
- [x] Assinatura digital
- [x] Checklist 5 Certos

### ⚠️ Funcionalidades Parcialmente Implementadas
- [ ] Filtros da tela (Período, Setor, Situação, Pesquisa)
- [ ] Botões de ação por situação
- [ ] Indicadores de atividade com cores
- [ ] Indicador de tempo de espera

### ❌ Funcionalidades Não Implementadas

#### 1. Filtros e Visualização
- [ ] Filtro por Período (data atual e retroativas)
- [ ] Filtro por Setor (listar setores vinculados à UPA)
- [ ] Filtro por Situação (múltipla seleção com padrão)
- [ ] Campo de Pesquisa (código, nome, profissional, setor, etc.)
- [ ] Botão Configurações (parametrização por operador)
- [ ] Botão Expandir Painel
- [ ] Botão Atualizar

#### 2. Botões de Ação por Situação
- [ ] Botão Cancelar (para Recepcionado/Triado)
- [ ] Botão Histórico (para Em Observação/Procedimentos Rápidos)
- [ ] Botão Vincular usuário (para Novo usuário não identificado)
- [ ] Botão Chamar Painel Eletrônico (para Recepcionado/Triado)
- [ ] Botão Documentos (acesso a documentos vinculados)

#### 3. Cancelamento de Atendimento
- [ ] Tela "Usuário não atendido"
- [ ] Campo Motivo de cancelamento (obrigatório, filtrado por ativos)
- [ ] Campo Observações (obrigatório se houver atividades pendentes)
- [ ] Validação de atividades pendentes
- [ ] Mensagem de confirmação para cancelar atividades pendentes
- [ ] Cancelamento de atividades com observação padrão

#### 4. Aprazamento de Medicações
- [ ] Privilégio "Permite novo horário para execução de atividades programadas"
- [ ] Botão de aprazamento (visível apenas para atividades Programadas)
- [ ] Tela de nova data/hora
- [ ] Validações:
  - [ ] Maior que data/hora inicial
  - [ ] Maior que execuções anteriores
  - [ ] Máximo de um dia a partir da data atual
- [ ] Mensagem de confirmação obrigatória
- [ ] Recalculo automático de atividades pendentes
- [ ] Auditoria (gravar horário anterior e operador)
- [ ] Validação de atividades já executadas

#### 5. Aplicação de Vacinas
- [ ] Integração com módulo de Imunização
- [ ] Botão "Aplicação de Vacinas"
- [ ] Tela de inclusão de vacina
- [ ] Aba Vacina com todos os campos:
  - [ ] Local de Atendimento
  - [ ] Tipo = Aplicação
  - [ ] Data/Hora Inclusão
  - [ ] Usuário
  - [ ] Gestante, Puérpera, Comunicante de Hanseníase, Renal Crônico, Viajante
  - [ ] Grupo de Atendimento
  - [ ] Estratégia de Vacinação
  - [ ] Vacina (com busca)
  - [ ] Dosagem
  - [ ] Local de Aplicação
  - [ ] Quantidade Aplicada
  - [ ] Laboratório Produtor
  - [ ] Motivo de Indicação
  - [ ] Lote (com data de vencimento)
  - [ ] Frasco e Saldo do Frasco (se controlado por frascos)
- [ ] Aba Observações (até 2000 caracteres)
- [ ] Controle de estoque (baixa automática)
- [ ] Validação de privilégios do módulo Imunização

#### 6. Desbloqueio de Atendimento
- [ ] Privilégio "Retornar estágio de atendimento"
- [ ] Lógica de detecção de atendimento bloqueado
- [ ] Validações:
  - [ ] Situação = "Em atendimento"
  - [ ] Atendimento em aberto
  - [ ] Operador diferente do operador em atendimento
  - [ ] Operador com privilégio necessário
- [ ] Botão Desbloquear
- [ ] Mensagem de confirmação
- [ ] Liberação do atendimento para novo operador

#### 7. Indicadores e Visualização
- [ ] Ícones de indicadores de atividade (Cuidados, Medicamentos, Sinais Vitais, Vacinas, Exames)
- [ ] Cores dos indicadores (Azul=Pendente, Verde=Executado, Vermelho=Urgente)
- [ ] Indicador de tempo de espera (relógio)
- [ ] Cores do indicador de tempo (Verde=no prazo, Vermelho=atrasado)
- [ ] Legenda ao passar mouse sobre imagens

#### 8. Histórico
- [ ] Tela de histórico completo do atendimento
- [ ] Tempo inicial e rastreabilidade
- [ ] Visualização de todas as etapas

#### 9. Vincular Usuário
- [ ] Detecção de "Novo usuário não identificado"
- [ ] Tela de busca de usuário cadastrado
- [ ] Vínculo do atendimento com usuário encontrado

#### 10. Documentos
- [ ] Acesso a documentos vinculados
- [ ] Geração de documentos ao gravar
- [ ] Reimpressão de documentos

---

## 🔧 Melhorias e Ajustes Necessários

1. **Integração com e-SUS AB** para aplicação de vacinas
2. **Controle de estoque** de imunobiológicos
3. **Painel eletrônico** para chamadas
4. **Sistema de auditoria** completo para aprazamentos
5. **Validações de negócio** mais robustas
6. **Testes automatizados** para todas as funcionalidades
7. **Documentação técnica** das APIs
8. **Interface de usuário** completa no frontend

---

## 📌 Observações Importantes

- Todas as funcionalidades devem respeitar os **privilégios de acesso** configurados no perfil do operador
- As **validações de negócio** devem ser implementadas tanto no backend quanto no frontend
- O sistema deve manter **auditoria completa** de todas as ações críticas
- As **mensagens de confirmação** são obrigatórias para ações que alteram o estado do atendimento
- O **controle de tempo** deve ser preciso e atualizado em tempo real

