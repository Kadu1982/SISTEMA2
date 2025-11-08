# Análise Detalhada do Funcionamento do Atendimento Ambulatorial

## 1. Estrutura da Tela de Atendimento

### 1.1 Layout Principal
A tela de atendimento do IDS Saúde possui uma estrutura organizada em **abas (Tabs)** que facilitam a navegação:

#### Barra Superior Fixa
- **Informações do Paciente**: Nome completo, idade, sexo, município de residência, endereço
- **Informações do Atendimento**: Unidade de Saúde, Setor, Especialidade
- **Timer de Atendimento**: Exibe o tempo decorrido desde o início do atendimento (horas:minutos:segundos)
- **Botões de Ação**: Configurações, pesquisa, atualizar, expandir painel, etc.

#### Abas Principais
1. **Dados do Usuário** - Informações completas do paciente
2. **Geral** - Informações gerais do atendimento
3. **Dados da Triagem** - Dados coletados na triagem
4. **Dados Clínicos** - Queixas, anamnese, exame físico, conduta
5. **Prescrição de Medicamentos** - Lista de medicamentos prescritos
6. **Solicitar Procedimentos e Exames** - Requisição de exames e procedimentos
7. **Procedimentos Realizados** - Lista de procedimentos já realizados
8. **Hipótese Diagnóstica (CID)** - CID-10 e CIAP-2
9. **Encaminhamentos** - Encaminhamentos do paciente
10. **Desfecho da Consulta** - Opções de desfecho com campos condicionais
11. **Documentos** - Geração de documentos (atestados, declarações, etc.)

---

## 2. Fluxo de Trabalho do Atendimento

### 2.1 Início do Atendimento

#### Seleção do Paciente
- **Pacientes Triados**: Lista de pacientes que passaram pela triagem e estão aguardando atendimento
- **Filtros Disponíveis**:
  - **Período**: Data atual (pode ser alterado para datas retroativas)
  - **Setor**: Lista de setores cadastrados e vinculados à UPA
  - **Situação**: Por padrão, vem selecionado **"Reavaliação"** e **"Triado"**
    - **Recepcionado**: Após o usuário ser incluído em uma Recepção
    - **Triado**: Após o usuário ser atendido pela tela de Triagem
    - **Em observação**: Após encaminhamento para setor do tipo "Atendimento de Observações"
    - **Procedimentos rápidos**: Após encaminhamento para setor do tipo "Atendimento para Medicação/Procedimento"
    - **Reavaliação**: Quando o profissional precisa reavaliar o paciente após algum tempo
    - **Em atendimento**: Enquanto estiver sendo atendido e ainda não concluído
    - **Não atendido**: Quando o atendimento foi cancelado
    - **Finalizado**: Quando o paciente recebe Alta/Liberação

#### Ações Disponíveis na Lista
- **Editar (lápis)**: Inicia o atendimento de consulta (mesma função de duplo clique)
- **Chamar Painel Eletrônico**: Chama o usuário para Atendimento de Consulta
- **Histórico**: Visualiza todo o histórico de tempo do atendimento na UPA
- **Vincular usuário**: Vincula um usuário já cadastrado ao registro de atendimento
- **Cancelar (X)**: Cancela o atendimento (solicita motivo de cancelamento)
- **Documentos**: Acesso aos documentos vinculados à tela

---

## 3. Abas Detalhadas

### 3.1 Aba: Dados do Usuário

#### Informações Básicas
- Nome completo
- Idade
- Sexo
- Município de residência
- Endereço completo

#### Alergias
- Lista de alergias conhecidas com ícone de alerta
- Alergias da triagem (se não estiverem no histórico)

#### Condições de Saúde
- Lista de condições de saúde do paciente

#### Botões de Ação
- **Histórico de atendimentos**: Visualiza todos os atendimentos anteriores
- **Digitalização de documentos**: Anexa documentos ao prontuário
- **Aplicação de vacinas**: Acessa o módulo de vacinação
- **Atualizar informações**: Permite atualizar dados do paciente

---

### 3.2 Aba: Dados da Triagem

#### Informações da Triagem
- **Profissional da Triagem**: Nome e especialidade do profissional que realizou a triagem
- **Horário da Triagem**: Data e hora em que a triagem foi realizada

#### Sinais Vitais
- **Pressão Arterial**: Ex: 130/80 mmHg
- **Grau de Hipertensão**: Limítrofe, Normal, etc.
- **Saturação (SpO2)**: Ex: 100%
- **Pulsação Arterial**: Ex: 68 /min
- **Temperatura**: Ex: 36,2 °C

#### Classificação
- **Classificação de Risco**: Vermelho, Laranja, Amarelo, Verde, Azul (com badge colorido)
- **Avaliação de Dor**: Escala de 0 a 10 (ex: Dor moderada)

#### Justificativa do Atendimento
- Texto livre com a justificativa do atendimento informada na triagem

---

### 3.3 Aba: Dados Clínicos

#### Queixas
- Campo de busca para selecionar queixas do catálogo
- Lista de queixas selecionadas

#### Anamnese e HDA (História da Doença Atual)
- Campo de texto livre para descrever a anamnese e história da doença atual

#### Exame Físico
- Campo de texto livre para descrever os achados do exame físico

#### Conduta Adotada
- Lista de condutas adotadas (ex: MEDICAÇÃO)

---

### 3.4 Aba: Prescrição de Medicamentos

#### REMUME (Relação Municipal de Medicamentos Essenciais)
- Busca de medicamentos disponíveis na rede municipal de saúde
- Campo de busca com autocomplete

#### Medicamentos Prescritos
- **Lista Organizada por Tipo**:
  - **Interna**: Medicamentos para uso interno
  - **Externa**: Medicamentos para uso externo
- **Informações Exibidas**:
  - Nome do medicamento (código e descrição)
  - Tipo (Interna, Externa, etc.)
  - Posologia completa
  - Status de execução (Executado, Pendente)
  - Botões de ação (Editar, Excluir)

#### Aprazamento
- Seleção de intervalo de administração (1/1 Hora, 2/2 Horas, 4/4 Horas, etc.)
- Dias de tratamento

---

### 3.5 Aba: Solicitar Procedimentos e Exames

#### Busca de Procedimento/Exame
- Campo de busca com autocomplete
- Filtro por tipo (Procedimento, Exame)

#### Campos de Solicitação
- **Procedimento/exame**: Seleção obrigatória
- **Requisição**: Número da requisição
- **Urgente**: Checkbox para marcar como urgente

#### Botões de Ação
- **Limpar**: Limpa os campos
- **Adicionar**: Adiciona o procedimento/exame à lista
- **Remover**: Remove itens selecionados
- **Justificativa**: Abre campo para justificativa
- **Dados clínicos**: Abre campo para dados clínicos
- **Importar grupo**: Importa grupo de procedimentos/exames pré-definidos

#### Tabs Dentro da Aba
- **Procedimentos e exames incluídos**: Lista de procedimentos/exames já adicionados
- **Histórico de solicitações deste atendimento**: Histórico de solicitações anteriores

---

### 3.6 Aba: Procedimentos Realizados

#### Lista de Procedimentos
- Procedimentos já realizados durante o atendimento
- Permite adicionar novos procedimentos realizados

---

### 3.7 Aba: Hipótese Diagnóstica (CID)

#### CID-10
- Campo de busca com autocomplete
- Lista de resultados com código e descrição
- CID selecionado exibido claramente

#### CIAP-2
- **RFE (01-29)**: Seleção de 1 Razão para Encaminhamento
- **Diagnósticos (70-99)**: Seleção de até 5 diagnósticos
- **Procedimentos (30-69)**: Seleção de até 5 procedimentos (opcional)

---

### 3.8 Aba: Encaminhamentos

#### Encaminhamentos do Paciente
- Lista de encaminhamentos realizados
- Permite adicionar novos encaminhamentos

---

### 3.9 Aba: Desfecho da Consulta

#### Opções de Desfecho (Radio Buttons)

1. **Liberar usuário**
   - Marca quando o atendimento é concluído
   - Situação do atendimento fica como **Finalizado**
   - **Será automaticamente desmarcada** quando existir prescrição de medicamentos do tipo **Medicação interna**

2. **Alta se melhora**
   - Relacionado a procedimentos rápidos que serão realizados
   - Se estiver melhor, a enfermagem pode liberar o usuário
   - Carrega a informação com a prescrição médica e/ou procedimento e exame para a enfermagem no **Painel de Enfermagem**
   - Geralmente utilizado para soroterapia
   - **Quando selecionado**:
     - Habilita o campo **Setor** (obrigatório)
     - Deve selecionar setor do tipo **Medicação/Procedimento**
     - Aparece as informações dos itens prescritos no setor encaminhado
     - Aparece a informação **"Alta se melhora"**

3. **Alta após medicação/procedimento**
   - Carrega a informação com a prescrição médica e/ou procedimento e exame para a enfermagem no **Painel de Enfermagem**
   - A enfermagem está **autorizada a liberar o paciente**
   - Geralmente utilizado para medicação rápida
   - **Quando selecionado**:
     - Habilita o campo **Setor** (obrigatório)
     - Deve selecionar setor do tipo **Medicação/Procedimento**
     - Aparece as informações dos itens prescritos no setor encaminhado
     - Aparece a informação **"Alta após medicação/procedimento"**

4. **Reavaliação**
   - Coloca o paciente para o próprio profissional/setor reavaliar
   - Indica o tempo para essa reavaliação
   - É possível indicar para outro setor reavaliar
   - **Campo desabilitado** quando "Liberar usuário" estiver marcado

5. **Encaminhamento interno**
   - Representa que o usuário passou pelo Atendimento, recebeu diagnóstico, mas permite encaminhamento para outros **Setores de Observação**
   - Indica a **Especialidade** de forma opcional
   - Pode encaminhar para outro Setor
   - **Campo desabilitado** quando "Liberar usuário" estiver marcado
   - **Campos habilitados quando selecionado**:
     - **Setor**: Carrega setores vinculados à Unidade de Saúde logada
     - **Especialidade**: Mostra especialidades ativas vinculadas ao setor selecionado (opcional)
     - **Justificativa**: Campo livre para digitação

6. **Observação**
   - Envia o registro direto para **Observação**
   - O atendimento prossegue pela tela de **Atendimento de Observações**
   - É necessário indicar para qual **setor de observação** o paciente está sendo encaminhado
   - Pode informar ou não as **atividades que a equipe de enfermagem irá realizar**

7. **Transferência**
   - Libera do sistema esse usuário
   - Permite indicar uma **Unidade de Saúde** (filtra todas as Unidades de saúde ativas no sistema)

8. **Óbito**
   - Finaliza o registro nessa condição
   - Solicita o **"Diagnóstico causa da morte"**

#### Campos Condicionais

**Quando "Alta se melhora" ou "Alta após medicação/procedimento" é selecionado:**
- **Setor** (obrigatório): Seleção de setor do tipo **Medicação/Procedimento**
- **Atividades de Enfermagem** (checkboxes):
  - **Aplicação**: Aplicação de medicamentos
  - **Curativos**: Curativos
  - **Vacinas**: Aplicação de vacinas

**Quando "Encaminhamento interno" é selecionado:**
- **Setor**: Seleção de setor do tipo "Atendimento de Observações"
- **Especialidade**: Seleção de especialidade (opcional)
- **Justificativa**: Campo de texto livre

---

### 3.10 Aba: Documentos

#### Tabs Dentro da Aba
- **INTERNOS**: Documentos internos
- **INTERNOS CONTROLADOS**: Documentos internos controlados

#### Campos para Cada Documento
- **Documento**: Seleção do tipo de documento
- **Hora Inicial**: Data e hora do documento
- **CID no atestado**: CID-10 para o atestado
- **Texto**: Editor de texto rico para o conteúdo do documento

#### Botões de Ação
- **Atestado**: Gera atestado médico
- **Declaração de comparecimento**: Gera declaração de comparecimento
- **Orientações**: Gera documento com orientações
- **Adicionar outro documento**: Permite adicionar mais documentos
- **Remover**: Remove o documento

---

## 4. Integração com Módulo de Procedimentos Rápidos (Cuidados de Enfermagem)

### 4.1 Quando o Médico Seleciona "Alta se melhora" ou "Alta após medicação/procedimento"

1. **Médico seleciona o desfecho**
2. **Sistema habilita campo Setor** (obrigatório)
3. **Médico seleciona setor do tipo Medicação/Procedimento**
4. **Médico seleciona atividades de enfermagem** (Aplicação, Curativos, Vacinas)
5. **Sistema cria procedimento rápido** com:
   - Informações do atendimento
   - Prescrição médica e/ou procedimentos/exames
   - Setor selecionado
   - Tipo de desfecho ("Alta se melhora" ou "Alta após medicação/procedimento")
   - Atividades de enfermagem selecionadas
6. **Paciente aparece no módulo de Procedimentos Rápidos** (Cuidados de Enfermagem)
7. **Enfermagem realiza as atividades** (Aplicação, Curativos, Vacinas)
8. **Enfermagem avalia se paciente está melhor** (para "Alta se melhora")
9. **Enfermagem pode liberar o paciente** após realizar as atividades

### 4.2 Indicador Visual no Atendimento

- **Badge azul** com ícone de pílula ao lado do nome do paciente na lista de triados
- **Texto**: "Em Cuidados de Enfermagem"
- **Botão "Retornar"**: Permite retornar o paciente para avaliação médica

---

## 5. Funcionalidades Especiais

### 5.1 Formulários Específicos

#### Dor Torácica
Quando a queixa principal é relacionada a dor torácica, o sistema pode exibir um formulário específico com:

- **Localização**: Retroesternal, Precordial, Interescapular, Epigástrica, Infra mamária, Axilar média
- **Tipo**: Aperto, Queimação/Ardência, Peso
- **Irradiação**: Mandíbula, Pescoço, MMSS, Ombros, Costas
- **Tempo de duração da dor**: Data, Hora, Dor contínua (checkbox)
- **Outros sinais e sintomas**: Náuseas, Vômitos, Palidez, Sudorese
- **História patológica pregressa**: HAS, DM, Coronariopatia, Arritmia, ICC, Dislipidemia, Tabagismo, IRC, AVC prévio
- **Fatores de melhora / piora**: Com repouso, Com esforço

---

## 6. Comparação com Implementação Atual

### 6.1 O que já está implementado ✅

1. **Estrutura de Tabs**: ✅ Implementado
   - Dados do Usuário
   - Dados da Triagem
   - Dados Clínicos
   - Prescrição de Medicamentos
   - Hipótese Diagnóstica (CID)
   - Desfecho da Consulta

2. **Desfecho da Consulta**: ✅ Implementado
   - Opções de desfecho (Alta, Alta se melhora, Alta após medicação/procedimento, Encaminhamento, etc.)
   - Campos condicionais (Setor, Especialidade, Atividades de Enfermagem)
   - Validações conforme regras de negócio

3. **Integração com Procedimentos Rápidos**: ✅ Implementado
   - Encaminhamento automático quando selecionado "Alta se melhora" ou "Alta após medicação/procedimento"
   - Criação de procedimento rápido com atividades de enfermagem
   - Badge visual na lista de triados

4. **CIAP-2**: ✅ Implementado
   - RFE (01-29)
   - Diagnósticos (70-99)
   - Procedimentos (30-69)

5. **CID-10**: ✅ Implementado
   - Busca com autocomplete
   - Seleção de CID

### 6.2 O que ainda falta implementar ⚠️

1. **Barra Superior Fixa**: ⚠️ Não implementado
   - Informações do paciente sempre visíveis
   - Timer de atendimento
   - Botões de ação no topo

2. **Aba "Solicitar Procedimentos e Exames"**: ⚠️ Não implementado
   - Busca de procedimentos/exames
   - Lista de solicitações
   - Histórico de solicitações

3. **Aba "Procedimentos Realizados"**: ⚠️ Não implementado
   - Lista de procedimentos realizados
   - Adição de novos procedimentos

4. **Aba "Encaminhamentos"**: ⚠️ Não implementado
   - Lista de encaminhamentos
   - Adição de novos encaminhamentos

5. **Aba "Documentos"**: ⚠️ Parcialmente implementado
   - Editor de texto rico
   - Múltiplos tipos de documentos
   - Geração de atestados, declarações, orientações

6. **Prescrição de Medicamentos com Status**: ⚠️ Parcialmente implementado
   - Lista organizada por tipo
   - Status de execução (Executado, Pendente)
   - Botões de ação (Editar, Excluir)

7. **Formulários Específicos**: ⚠️ Não implementado
   - Dor Torácica
   - Outros formulários específicos para condições comuns

---

## 7. Próximos Passos Sugeridos

### Prioridade Alta
1. ✅ Implementar barra superior fixa com informações do paciente e timer
2. ✅ Implementar aba "Solicitar Procedimentos e Exames"
3. ✅ Implementar aba "Procedimentos Realizados"
4. ✅ Implementar aba "Encaminhamentos"
5. ✅ Melhorar aba "Documentos" com editor de texto rico

### Prioridade Média
6. ✅ Melhorar prescrição de medicamentos com status de execução
7. ✅ Implementar formulários específicos (Dor Torácica, etc.)

### Prioridade Baixa
8. ✅ Melhorias visuais e de UX
9. ✅ Otimizações de performance

---

## 8. Conclusão

O sistema IDS Saúde possui uma estrutura muito completa e organizada para o atendimento ambulatorial. A implementação atual já cobre as funcionalidades principais, mas ainda faltam algumas abas e funcionalidades para estar completamente alinhado com o sistema de referência.

As melhorias mais importantes a serem implementadas são:
1. Barra superior fixa com informações do paciente e timer
2. Abas faltantes (Solicitar Procedimentos e Exames, Procedimentos Realizados, Encaminhamentos)
3. Melhorias na aba de Documentos
4. Melhorias na prescrição de medicamentos com status de execução

