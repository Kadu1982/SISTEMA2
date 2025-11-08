# Melhorias Identificadas na Tela de Atendimento Ambulatorial

## Análise da Tela do IDS Saúde vs. Projeto Atual

### 1. Estrutura de Navegação (Tabs vs. Cards)

#### IDS Saúde (Referência)
- **Estrutura**: Usa **Tabs** (abas) para organizar as seções
- **Abas principais**:
  1. **Dados do usuário** - Informações do paciente, alergias, condições de saúde
  2. **Geral** - Informações gerais do atendimento
  3. **Dados da Triagem** - Dados da triagem (pressão, temperatura, classificação de risco, etc.)
  4. **Dor torácica** - Formulário específico para dor torácica (com grupos: Localização, Tipo, Irradiação, etc.)
  5. **Dados clínicos** - Queixas, Anamnese e HDA, Exame físico, Conduta adotada
  6. **Resultados dos exames** - Visualização de resultados
  7. **Prescrição de medicamentos** - Lista de medicamentos prescritos com status de execução
  8. **Solicitar procedimentos e exames** - Solicitação de exames e procedimentos
  9. **Procedimentos realizados** - Lista de procedimentos já realizados
  10. **Hipótese diagnóstica (CID)** - Busca e seleção de CID-10
  11. **Encaminhamentos** - Encaminhamentos do paciente
  12. **Desfecho da consulta** - Opções de desfecho com campos condicionais
  13. **Documentos** - Geração de documentos (atestados, declarações, etc.)

#### Projeto Atual
- **Estrutura**: Usa **Cards** empilhados verticalmente
- **Seções**: Todas as seções estão em um único formulário longo
- **Navegação**: Requer scroll vertical para acessar todas as seções

**Melhoria Sugerida**: Implementar estrutura de **Tabs** para melhor organização e navegação

---

### 2. Dados do Usuário (Aba Separada)

#### IDS Saúde
- **Aba dedicada** para informações do paciente
- **Seções dentro da aba**:
  - Informações básicas (nome, idade, sexo, município de residência, endereço)
  - **Alergias** - Lista de alergias com ícone de alerta
  - **Condições de saúde** - Lista de condições de saúde
  - **Botões de ação**:
    - Histórico de atendimentos
    - Digitalização de documentos
    - Aplicação de vacinas
    - Atualizar informações

#### Projeto Atual
- Informações do paciente misturadas com o formulário de atendimento
- Alergias exibidas como badges no topo do formulário

**Melhoria Sugerida**: Criar uma aba separada "Dados do Usuário" com todas as informações do paciente e ações relacionadas

---

### 3. Dados da Triagem (Aba Separada)

#### IDS Saúde
- **Aba dedicada** para dados da triagem
- **Informações exibidas**:
  - Profissional da triagem e especialidade
  - Pressão arterial
  - Grau de hipertensão
  - Saturação (Sp02)
  - Pulsação arterial
  - Temperatura
  - Justificativa do atendimento
  - Classificação de risco
  - Avaliação de dor

#### Projeto Atual
- Dados da triagem podem estar misturados ou não exibidos claramente

**Melhoria Sugerida**: Criar uma aba "Dados da Triagem" para exibir todas as informações da triagem de forma organizada

---

### 4. Formulários Específicos (Ex: Dor Torácica)

#### IDS Saúde
- **Formulário específico para Dor Torácica** com grupos organizados:
  - **Localização**: Retroesternal, Precordial, Interescapular, Epigástrica, Infra mamária, Axilar média
  - **Tipo**: Aperto, Queimação/Ardência, Peso
  - **Irradiação**: Mandíbula, Pescoço, MMSS, Ombros, Costas
  - **Tempo de duração da dor**: Data, Hora, Dor contínua (checkbox)
  - **Outros sinais e sintomas**: Náuseas, Vômitos, Palidez, Sudorese
  - **História patológica pregressa**: HAS, DM, Coronariopatia, Arritmia, ICC, Dislipidemia, Tabagismo, IRC, AVC prévio
  - **Fatores de melhora / piora**: Com repouso, Com esforço

#### Projeto Atual
- Não possui formulários específicos para condições específicas

**Melhoria Sugerida**: Implementar formulários específicos para condições comuns (dor torácica, dor abdominal, etc.) que podem ser habilitados conforme necessário

---

### 5. Prescrição de Medicamentos

#### IDS Saúde
- **Aba dedicada** para prescrição
- **Estrutura**:
  - Lista de medicamentos prescritos com:
    - Nome do medicamento
    - Tipo (Interna, Externa, etc.)
    - Posologia completa
    - Status de execução (Executado, Pendente)
    - Botões de ação (Editar, Excluir)
  - **Tabela organizada** por tipo de medicação
  - **Status visual** de execução

#### Projeto Atual
- Prescrição pode estar em um campo de texto simples ou não implementada completamente

**Melhoria Sugerida**: Implementar uma aba dedicada para prescrição de medicamentos com lista organizada e status de execução

---

### 6. Solicitar Procedimentos e Exam

#### IDS Saúde
- **Aba dedicada** para solicitação de exames e procedimentos
- **Funcionalidades**:
  - Busca de procedimento/exame
  - Seleção de requisição
  - Marcação de urgente
  - Botões: Limpar, Adicionar, Remover
  - Botões adicionais: Justificativa, Dados clínicos, Importar grupo
  - **Tabs dentro da aba**:
    - Procedimentos e exames incluídos
    - Histórico de solicitações deste atendimento

#### Projeto Atual
- Solicitação de exames pode estar em um campo de texto simples

**Melhoria Sugerida**: Implementar uma aba dedicada para solicitação de exames e procedimentos com busca, lista e histórico

---

### 7. Procedimentos Realizados

#### IDS Saúde
- **Aba dedicada** para procedimentos já realizados
- Permite adicionar procedimentos que foram realizados durante o atendimento

#### Projeto Atual
- Pode não ter uma seção específica para procedimentos realizados

**Melhoria Sugerida**: Implementar uma aba para registrar procedimentos realizados durante o atendimento

---

### 8. Hipótese Diagnóstica (CID)

#### IDS Saúde
- **Aba dedicada** para CID-10
- Busca de CID com lista de resultados
- CID selecionado exibido claramente

#### Projeto Atual
- CID está integrado no formulário principal

**Melhoria Sugerida**: Manter CID em aba separada para melhor organização

---

### 9. Encaminhamentos

#### IDS Saúde
- **Aba dedicada** para encaminhamentos
- Permite adicionar encaminhamentos do paciente

#### Projeto Atual
- Encaminhamentos podem estar no desfecho ou não implementados

**Melhoria Sugerida**: Implementar uma aba separada para encaminhamentos

---

### 10. Desfecho da Consulta

#### IDS Saúde
- **Aba dedicada** para desfecho
- **Opções de radio buttons**:
  - Liberar usuário
  - Alta se melhora
  - Alta após medicação/procedimento
  - Reavaliação
  - Encaminhamento interno
  - Observação
  - Transferência
  - Óbito
- **Campo Setor obrigatório** quando selecionado "Alta se melhora" ou "Alta após medicação/procedimento"
- Campo Setor com busca de setores

#### Projeto Atual
- Desfecho implementado com select e campos condicionais
- Já possui campo Setor obrigatório para desfechos apropriados

**Status**: ✅ Já implementado conforme análise

---

### 11. Documentos

#### IDS Saúde
- **Aba dedicada** para documentos
- **Tabs dentro da aba**:
  - INTERNOS
  - INTERNOS CONTROLADOS
- **Funcionalidades**:
  - Seleção de tipo de documento
  - Hora inicial (data e hora)
  - CID no atestado
  - Editor de texto rico para conteúdo do documento
  - Botões: Atestado, Declaração de comparecimento, Orientações, Adicionar outro documento
  - Botão Remover para cada documento

#### Projeto Atual
- Pode ter componente de documentos, mas precisa verificar se está integrado

**Melhoria Sugerida**: Implementar aba dedicada para documentos com editor de texto rico e múltiplos tipos de documentos

---

### 12. Informações do Paciente no Topo

#### IDS Saúde
- **Barra superior fixa** com informações do paciente:
  - Nome completo, idade, sexo
  - Município de residência
  - Unidade de Saúde
  - Setor
  - Especialidade
  - **Timer de tempo de atendimento** (horas:minutos:segundos)
- **Botões de ação** no topo:
  - Ícones para diferentes ações (configurações, etc.)

#### Projeto Atual
- Informações do paciente podem estar no formulário ou em um dialog

**Melhoria Sugerida**: Implementar barra superior fixa com informações do paciente e timer de atendimento

---

### 13. Botões de Ação no Topo

#### IDS Saúde
- **Barra de ações** no topo da tela:
  - Botão de configurações
  - Botão de pesquisa
  - Botão de atualizar
  - Botão de expandir painel
  - Outros botões de ação

#### Projeto Atual
- Botões de ação podem estar espalhados ou não implementados

**Melhoria Sugerida**: Implementar barra de ações no topo da tela de atendimento

---

### 14. Organização Visual

#### IDS Saúde
- **Estrutura hierárquica clara**:
  - Abas principais no topo
  - Conteúdo organizado dentro de cada aba
  - Uso de grupos e regiões para organizar campos relacionados
  - Ícones visuais para diferentes seções

#### Projeto Atual
- Cards empilhados verticalmente
- Pode ser difícil navegar entre seções

**Melhoria Sugerida**: Implementar estrutura de Tabs para melhor organização visual

---

## Resumo das Melhorias Prioritárias

### Alta Prioridade
1. ✅ **Implementar estrutura de Tabs** - Organizar o formulário em abas para melhor navegação
2. ✅ **Criar aba "Dados do Usuário"** - Separar informações do paciente em aba dedicada
3. ✅ **Criar aba "Dados da Triagem"** - Exibir dados da triagem de forma organizada
4. ✅ **Implementar aba "Prescrição de Medicamentos"** - Lista organizada com status de execução
5. ✅ **Implementar aba "Solicitar Procedimentos e Exames"** - Com busca e histórico
6. ✅ **Implementar aba "Procedimentos Realizados"** - Para registrar procedimentos realizados
7. ✅ **Implementar aba "Encaminhamentos"** - Para gerenciar encaminhamentos
8. ✅ **Implementar aba "Documentos"** - Com editor de texto rico e múltiplos tipos

### Média Prioridade
9. ✅ **Barra superior fixa** - Com informações do paciente e timer de atendimento
10. ✅ **Barra de ações no topo** - Com botões de ação principais
11. ✅ **Formulários específicos** - Para condições comuns (dor torácica, etc.)

### Baixa Prioridade
12. ✅ **Melhorias visuais** - Ícones, cores, espaçamento
13. ✅ **Organização hierárquica** - Uso de grupos e regiões

---

## Próximos Passos

1. Analisar o código atual do `AtendimentoForm.tsx` e `AtendimentoMedico.tsx`
2. Implementar estrutura de Tabs
3. Separar seções em abas dedicadas
4. Implementar funcionalidades faltantes
5. Melhorar organização visual

