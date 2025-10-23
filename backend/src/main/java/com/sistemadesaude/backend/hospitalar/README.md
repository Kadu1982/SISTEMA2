# Módulo Hospitalar

## Visão Geral

O módulo Hospitalar foi desenvolvido com base no documento "HOSPITALAR MV.docx" e implementa as principais funcionalidades para gestão hospitalar, incluindo:

### Funcionalidades Implementadas

#### 1. Sistema de Senhas e Filas de Atendimento
- **Entidades**: `FilaAtendimento`, `SenhaAtendimento`, `PainelAtendimento`
- **Funcionalidades**:
  - Emissão de senhas normais e prioritárias
  - Gestão de filas por unidade/setor
  - Chamada eletrônica com painéis de atendimento
  - Controle de tempo de espera e tolerância
  - Estatísticas de atendimento em tempo real

#### 2. Gestão de Leitos
- **Entidades**: `Leito`, `SolicitacaoLeito`
- **Funcionalidades**:
  - Controle de ocupação e liberação de leitos
  - Gestão centralizada e descentralizada
  - Transferência entre leitos
  - Controle de limpeza e interdição
  - Mapa visual de leitos
  - Estatísticas de ocupação

#### 3. Classificação de Risco
- **Entidade**: `ClassificacaoRisco`
- **Funcionalidades**:
  - Protocolos Manchester, Humaniza SUS e institucional
  - Avaliação de sinais vitais
  - Classificação por cores de prioridade
  - Detecção de risco de sepse
  - Reavaliação de pacientes

#### 4. Controle de Acesso
- **Entidade**: `ControleAcesso`
- **Funcionalidades**:
  - Registro de visitantes, acompanhantes e fornecedores
  - Controle de entrada e saída
  - Emissão de crachás
  - Foto identificação

#### 5. Configurações Hospitalares
- **Entidade**: `ConfiguracaoHospitalar`
- **Funcionalidades**:
  - Configurações por unidade ou globais
  - Parametrização de procedimentos
  - Controle multi-estabelecimento
  - Configurações de sistema

#### 6. Ambulatório Hospitalar 🆕
- **Entidades**: `AgendamentoAmbulatorio`, `EscalaMedica`, `PresencaProfissional`, `EncaminhamentoInterno`, `ConfiguracaoAmbulatorio`
- **Funcionalidades**:
  - Agendamento de consultas especializadas
  - Gestão de escalas médicas
  - Controle de presença de profissionais
  - Encaminhamentos internos entre especialidades
  - Configurações específicas do ambulatório
  - Dashboard com estatísticas em tempo real
  - Gestão de filas de atendimento ambulatorial

## Estrutura do Módulo

```
hospitalar/
├── entity/          # Entidades JPA
├── repository/      # Repositórios Spring Data
├── service/         # Serviços com regras de negócio
├── controller/      # Controllers REST
├── dto/            # Data Transfer Objects
└── README.md       # Este arquivo
```

## Endpoints Principais

### Senhas de Atendimento
- `POST /api/hospitalar/senhas/emitir` - Emitir nova senha
- `POST /api/hospitalar/senhas/chamar` - Chamar próxima senha
- `POST /api/hospitalar/senhas/{id}/iniciar-atendimento` - Iniciar atendimento
- `POST /api/hospitalar/senhas/{id}/concluir` - Concluir atendimento
- `GET /api/hospitalar/senhas/fila/{filaId}` - Listar senhas da fila

### Gestão de Leitos
- `POST /api/hospitalar/leitos/{id}/ocupar` - Ocupar leito
- `POST /api/hospitalar/leitos/{id}/liberar` - Liberar leito
- `POST /api/hospitalar/leitos/{origem}/transferir/{destino}` - Transferir paciente
- `GET /api/hospitalar/leitos/disponiveis` - Listar leitos disponíveis
- `GET /api/hospitalar/leitos/estatisticas` - Estatísticas de leitos

### Ambulatório Hospitalar 🆕
- `POST /api/hospitalar/ambulatorio/agendamentos` - Criar agendamento
- `POST /api/hospitalar/ambulatorio/agendamentos/{id}/confirmar-presenca` - Confirmar presença
- `POST /api/hospitalar/ambulatorio/agendamentos/{id}/chamar` - Chamar paciente
- `POST /api/hospitalar/ambulatorio/agendamentos/{id}/iniciar-atendimento` - Iniciar atendimento
- `POST /api/hospitalar/ambulatorio/agendamentos/{id}/finalizar-atendimento` - Finalizar atendimento
- `GET /api/hospitalar/ambulatorio/agendamentos` - Listar agendamentos
- `GET /api/hospitalar/ambulatorio/agendamentos/aguardando` - Pacientes aguardando
- `POST /api/hospitalar/ambulatorio/escalas` - Criar escala médica
- `GET /api/hospitalar/ambulatorio/escalas` - Listar escalas
- `GET /api/hospitalar/ambulatorio/escalas/com-vagas` - Escalas com vagas
- `GET /api/hospitalar/ambulatorio/dashboard` - Dashboard ambulatório

## Principais Regras de Negócio

### Sistema de Senhas
1. **Priorização**: Senhas prioritárias têm precedência sobre normais
2. **Sequenciamento**: Respeita ordem de emissão dentro da prioridade
3. **Controle de tempo**: Monitora tempo de espera com alertas
4. **Multi-fila**: Suporte a múltiplas filas por unidade

### Gestão de Leitos
1. **Status de leito**: Disponível → Ocupado → Limpeza → Disponível
2. **Limpeza obrigatória**: Todo leito liberado deve passar por limpeza
3. **Transferência**: Libera origem e ocupa destino automaticamente
4. **Reserva**: Permite reservar leitos para internações programadas

### Classificação de Risco
1. **Protocolos**: Suporte a múltiplos protocolos de classificação
2. **Cores de prioridade**: Vermelho (emergência) a Azul (não urgente)
3. **Tempo máximo**: Define tempo máximo de espera por cor
4. **Reavaliação**: Permite reclassificar pacientes

## Configurações

### Parâmetros do Sistema
- `SISTEMA_MULTI_ESTABELECIMENTO`: Habilita multi-unidades
- `PROTOCOLO_CLASSIFICACAO_PADRAO`: Protocolo padrão de triagem
- `CERTIFICADO_DIGITAL_OBRIGATORIO`: Exige certificado digital

### Configurações de Fila
- `tempo_espera_alvo`: Tempo ideal de espera (minutos)
- `tempo_espera_tolerancia`: Tempo máximo tolerável (minutos)
- `permite_prioritario`: Habilita senhas prioritárias
- `horario_inicio/fim`: Horário de funcionamento

## Próximas Implementações

Com base no documento analisado, as próximas funcionalidades a serem implementadas incluem:

1. **Centro Cirúrgico**
   - Agendamento de cirurgias
   - Controle de salas cirúrgicas
   - Gestão de kits e materiais

2. **Prescrição Eletrônica**
   - Prescrição médica digital
   - Controle de medicamentos
   - Interações medicamentosas

3. **Prontuário Eletrônico**
   - Documentos clínicos
   - Evoluções médicas
   - Assinatura digital

4. **SCIH (Controle de Infecção)**
   - Vigilância epidemiológica
   - Controle de antimicrobianos
   - Busca ativa de infecções

5. **Ambulatório**
   - Agendamento de consultas
   - Gestão de escalas médicas
   - Controle de presença

## Banco de Dados

O módulo utiliza SQL Server como SGBD principal, com suporte completo a:
- Transações ACID
- Índices otimizados para consultas frequentes
- Constraints para integridade referencial
- Triggers para auditoria (quando necessário)

## Tecnologias Utilizadas

- **Spring Boot 3.x**: Framework principal
- **Spring Data JPA**: Persistência de dados
- **Jakarta Validation**: Validação de dados
- **Lombok**: Redução de boilerplate
- **Swagger/OpenAPI**: Documentação da API
- **Flyway**: Migração de banco de dados

## Como Usar

1. Execute a aplicação Spring Boot
2. Acesse a documentação Swagger em `/swagger-ui.html`
3. Use os endpoints para interagir com o módulo
4. Monitore logs para acompanhar operações

## Observações

Este módulo foi desenvolvido seguindo as especificações do documento "HOSPITALAR MV.docx" e implementa as funcionalidades core para gestão hospitalar. A arquitetura permite extensão fácil para novas funcionalidades conforme necessário.