# 🧪 Guia de Uso - Módulo de Laboratório

## 📋 Visão Geral

Este guia fornece instruções passo-a-passo para usar o módulo completo de laboratório implementado no sistema de saúde. O módulo oferece um fluxo completo desde a recepção de exames até a entrega dos resultados.

## 🔧 Pré-requisitos

- Sistema backend rodando na porta configurada
- Usuário autenticado com perfil de laboratório
- Unidade de saúde configurada
- Pacientes cadastrados no sistema

## 📊 Fluxo Completo do Laboratório

### 1. Configuração Inicial

Antes de usar o módulo, certifique-se de que a configuração do laboratório está definida:

**Endpoint:** `GET /api/laboratorio/configuracao/{unidadeId}`

A configuração inclui:
- Controle de biometria
- Geração automática de código de barras
- Validações de idade e duplicidade
- Configurações de impressão e assinatura

### 2. Recepção de Exames

#### 2.1 Listar Exames Disponíveis

**Endpoint:** `GET /api/laboratorio/exames/ativos`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "HEM001",
      "nome": "Hemograma Completo",
      "grupo": "Hematologia",
      "materiais": ["Sangue EDTA"],
      "ativo": true
    }
  ]
}
```

#### 2.2 Criar Recepção de Exame

**Endpoint:** `POST /api/laboratorio/recepcao`

```json
{
  "pacienteId": 123,
  "unidadeId": 1,
  "urgente": false,
  "tipoAtendimento": "SUS",
  "biometriaTemplate": "template_base64",
  "observacoes": "Paciente em jejum",
  "exames": [
    {
      "exameId": 1,
      "quantidade": 1,
      "autorizado": true,
      "observacoes": ""
    }
  ]
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "numeroRecepcao": "LAB202412250001",
    "codigoBarras": "ABC123DEF456",
    "paciente": {...},
    "status": "RECEPCIONADO",
    "urgente": false,
    "biometriaColetada": true,
    "exames": [...]
  },
  "message": "Recepção criada com sucesso"
}
```

### 3. Coleta de Materiais

#### 3.1 Listar Pacientes Aguardando Coleta

**Endpoint:** `GET /api/laboratorio/coleta/pacientes-aguardando?unidadeId=1`

```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "numeroRecepcao": "LAB202412250001",
      "paciente": {
        "nomeExibicao": "João Silva",
        "idade": 35
      },
      "status": "AGUARDANDO_COLETA",
      "urgente": false,
      "dataRecepcao": "2024-12-25T08:00:00",
      "exames": [...]
    }
  ]
}
```

#### 3.2 Realizar Coleta de Material

**Endpoint:** `POST /api/laboratorio/coleta/realizar`

```json
{
  "recepcaoId": 456,
  "materiaisColetados": [
    {
      "materialId": 1,
      "quantidade": 1,
      "observacoes": "Coleta sem intercorrências"
    }
  ]
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 789,
    "recepcaoId": 456,
    "numeroRecepcao": "LAB202412250001",
    "pacienteNome": "João Silva",
    "dataColeta": "2024-12-25T08:30:00",
    "operadorColeta": "Maria Santos",
    "materiaisColetados": [
      {
        "materialId": 1,
        "materialSigla": "EDTA",
        "quantidade": 1,
        "codigoTubo": "TB1735114200000",
        "etiquetaImpressa": false,
        "novaColeta": false
      }
    ]
  },
  "message": "Coleta realizada com sucesso"
}
```

#### 3.3 Imprimir Etiquetas

**Endpoint:** `POST /api/laboratorio/coleta/{coletaId}/imprimir-etiquetas`

```json
{
  "success": true,
  "message": "Etiquetas marcadas para impressão"
}
```

#### 3.4 Registrar Nova Coleta (se necessário)

**Endpoint:** `POST /api/laboratorio/coleta/{coletaId}/nova-coleta`

```json
{
  "materialId": 1,
  "motivoNovaColetaId": 1,
  "observacoes": "Hemólise detectada"
}
```

### 4. Digitação de Resultados

#### 4.1 Buscar Exames para Digitação

**Endpoint:** `GET /api/laboratorio/resultados/pendentes?unidadeId=1`

#### 4.2 Salvar Resultado

**Endpoint:** `POST /api/laboratorio/resultados/salvar`

```json
{
  "exameRecepcaoId": 789,
  "valores": [
    {
      "campoId": 1,
      "valor": "4.5",
      "unidade": "milhões/mm³"
    }
  ],
  "memorando": "Resultado dentro da normalidade",
  "liberarLaudo": true
}
```

### 5. Assinatura Eletrônica

#### 5.1 Listar Resultados Pendentes de Assinatura

**Endpoint:** `GET /api/laboratorio/resultados/pendentes-assinatura`

```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "exameRecepcao": {...},
      "status": "AGUARDANDO_ASSINATURA",
      "dataResultado": "2024-12-25T10:00:00",
      "valores": [...],
      "memorando": "Resultado dentro da normalidade"
    }
  ]
}
```

#### 5.2 Assinar Resultado

**Endpoint:** `POST /api/laboratorio/resultados/{resultadoId}/assinar`

```json
{
  "profissionalId": 456,
  "assinaturaDigital": "certificado_digital_base64"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Resultado assinado com sucesso"
}
```

### 6. Entrega de Exames

#### 6.1 Buscar Recepção para Entrega

**Endpoint:** `GET /api/laboratorio/entrega/recepcao/{numeroRecepcao}`

```json
{
  "success": true,
  "data": {
    "id": 456,
    "numeroRecepcao": "LAB202412250001",
    "paciente": {...},
    "status": "FINALIZADO",
    "exames": [
      {
        "id": 789,
        "exame": {...},
        "resultado": {
          "assinado": true,
          "profissionalAssinatura": "Dr. João"
        }
      }
    ]
  }
}
```

#### 6.2 Listar Exames para Entrega

**Endpoint:** `GET /api/laboratorio/entrega/exames-para-entrega?unidadeId=1`

#### 6.3 Realizar Entrega

**Endpoint:** `POST /api/laboratorio/entrega/realizar`

```json
{
  "recepcaoId": 456,
  "nomeRetirou": "João Silva",
  "documentoRetirou": "12345678901",
  "parentescoRetirou": "Próprio paciente",
  "biometriaTemplate": "template_validacao_base64",
  "assinaturaRetirada": "assinatura_base64",
  "examesEntreguesIds": [789]
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 999,
    "recepcaoId": 456,
    "numeroRecepcao": "LAB202412250001",
    "pacienteNome": "João Silva",
    "dataEntrega": "2024-12-25T14:00:00",
    "operadorEntrega": "Ana Costa",
    "nomeRetirou": "João Silva",
    "documentoRetirou": "12345678901",
    "parentescoRetirou": "Próprio paciente",
    "biometriaValidada": true,
    "documentoValidado": true,
    "examesEntregues": [
      {
        "exameRecepcaoId": 789,
        "exameNome": "Hemograma Completo",
        "viasImpressas": 1
      }
    ]
  },
  "message": "Entrega realizada com sucesso"
}
```

## 🔍 Consultas e Relatórios

### Consultar Coletas por Período

**Endpoint:** `GET /api/laboratorio/coleta/periodo?dataInicio=2024-12-25T00:00:00&dataFim=2024-12-25T23:59:59`

### Consultar Entregas por Período

**Endpoint:** `GET /api/laboratorio/entrega/periodo?dataInicio=2024-12-25T00:00:00&dataFim=2024-12-25T23:59:59`

### Buscar Entregas por Nome

**Endpoint:** `GET /api/laboratorio/entrega/buscar-por-nome?nomeRetirou=João Silva`

### Buscar Entregas por Documento

**Endpoint:** `GET /api/laboratorio/entrega/buscar-por-documento?documentoRetirou=12345678901`

## ⚙️ Configurações Avançadas

### Materiais de Exame

**Listar Materiais:** `GET /api/laboratorio/materiais/ativos`
**Criar Material:** `POST /api/laboratorio/materiais`
**Atualizar Material:** `PUT /api/laboratorio/materiais/{id}`

### Grupos de Exames

**Listar Grupos:** `GET /api/laboratorio/grupos`
**Criar Grupo:** `POST /api/laboratorio/grupos`

### Motivos para Nova Coleta

**Listar Motivos:** `GET /api/laboratorio/coleta/motivos-nova-coleta`

## 🚨 Status dos Exames

O sistema controla automaticamente os status dos exames:

1. **RECEPCIONADO** - Exame foi recepcionado
2. **AGUARDANDO_COLETA** - Aguardando coleta do material
3. **EM_COLETA** - Material sendo coletado
4. **COLETADO** - Material coletado com sucesso
5. **EM_ANALISE** - Resultado sendo digitado
6. **FINALIZADO** - Resultado assinado, pronto para entrega
7. **ENTREGUE** - Exame entregue ao paciente
8. **CANCELADO** - Exame cancelado

## 🔐 Validações e Segurança

### Biometria
- Coleta opcional na recepção
- Validação obrigatória na entrega (se configurado)
- Comparação automática entre templates

### Validações de Negócio
- Idade mínima/máxima para exames
- Duplicidade de exames em período definido
- Assinatura obrigatória antes da entrega
- Validação de documentos na entrega

### Controle de Acesso
- Todas as operações requerem autenticação
- Controle por perfil de usuário
- Auditoria completa de operações

## 📱 Integração Frontend

O frontend pode usar os endpoints REST para criar interfaces de usuário completas para cada etapa do processo laboratorial.

### Exemplo de Fluxo na Interface

1. **Tela de Recepção**: Busca paciente → Seleciona exames → Coleta biometria → Cria recepção
2. **Tela de Coleta**: Lista pacientes aguardando → Registra materiais coletados → Imprime etiquetas
3. **Tela de Resultados**: Lista exames pendentes → Digita resultados → Libera laudos
4. **Tela de Assinatura**: Lista resultados pendentes → Profissional assina → Finaliza exames
5. **Tela de Entrega**: Busca por número → Valida documentos/biometria → Registra entrega

## 🐛 Tratamento de Erros

Todos os endpoints retornam códigos HTTP apropriados:

- **200 OK**: Operação realizada com sucesso
- **400 Bad Request**: Dados inválidos ou validação falhou
- **401 Unauthorized**: Usuário não autenticado
- **403 Forbidden**: Usuário sem permissão
- **404 Not Found**: Recurso não encontrado
- **500 Internal Server Error**: Erro interno do servidor

Mensagens de erro são retornadas no formato:

```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": ["Detalhes específicos do erro"]
}
```

## 📞 Suporte

Para dúvidas ou problemas com o módulo de laboratório, consulte:

1. Este guia de uso
2. Documentação da API
3. Logs do sistema para diagnóstico de problemas
4. Equipe de desenvolvimento do sistema

---

**Módulo de Laboratório - Sistema de Saúde**  
*Versão implementada com base no manual IDS Saúde v5.18*