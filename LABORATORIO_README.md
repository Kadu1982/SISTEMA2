# 🧪 Módulo de Laboratório - Sistema de Saúde

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Uso](#uso)
- [API Reference](#api-reference)
- [Estrutura de Dados](#estrutura-de-dados)

## 🎯 Visão Geral

Módulo completo de Laboratório baseado no manual IDS Saúde v5.18, implementado com Spring Boot (backend) e React/TypeScript (frontend).

### Características Principais
- ✅ Configuração completa com 8 abas
- ✅ Cadastro de exames com campos dinâmicos
- ✅ Recepção de exames com biometria e código de barras
- ✅ Coleta de materiais com controle de nova coleta
- ✅ Digitação de resultados com valores de referência
- ✅ Assinatura eletrônica e certificado digital
- ✅ Entrega de exames com validação
- ✅ Interfaceamento com equipamentos
- ✅ Exportação e-SUS

## 🚀 Funcionalidades

### 1. Configurações
Configuração por unidade de saúde com 8 abas:
- **Laboratório**: Controle de transação, código de barras, biometria, validações
- **Resultado**: Digitação por campo/memorando, interfaceamento
- **Entrega**: Verificações de documento e biometria
- **Impressão**: Configuração de impressoras (etiquetas, comprovantes, laudos)
- **Etiqueta**: Configuração PPLA, dimensões
- **Estágios**: Cores e períodos de alerta
- **Assinatura**: Eletrônica e certificado digital
- **Painel**: Painel eletrônico de chamadas

### 2. Cadastros

#### Exames
- Código, nome, sinônimo
- Grupo de exames
- Códigos SIGTAP e TUSS
- Validações (idade, sexo, validade)
- Materiais necessários
- Campos dinâmicos configuráveis (texto, número, lista, etc.)
- Métodos com valores de referência por idade/sexo
- Exames complementares automáticos
- Interfaceamento com equipamentos
- Faturamento (BPA, APAC, Prestador)

#### Materiais
- Código, sigla, descrição
- Controle de estoque

#### Grupos
- Organização hierárquica de exames

#### Mapas
- Setores do laboratório
- Profissionais responsáveis

#### Textos Prontos
- Respostas pré-configuradas
- Vinculados a exames específicos

### 3. Movimentações

#### Recepção de Exames
- Busca de paciente
- Seleção de exames
- Importação de agendamentos
- Leitura biométrica
- Código de barras automático
- Tipo de atendimento (SUS, Particular, Convênio)
- Exames urgentes
- Validações automáticas (idade, duplicidade)

#### Coleta de Materiais
- Lista de pacientes aguardando coleta
- Registro de materiais coletados
- Impressão de etiquetas
- Nova coleta com motivo
- Código de tubo

#### Digitação de Resultados
- Campos dinâmicos por exame
- Textos prontos
- Valores de referência automáticos
- Alertas de valores alterados
- Importação de equipamentos
- Memorando livre
- Liberação de laudo

#### Assinatura Eletrônica
- Lista de resultados pendentes
- Assinatura digital
- Certificado e-CPF
- Imagem de assinatura

#### Entrega de Exames
- Busca por número de recepção
- Validação de documento
- Validação biométrica
- Registro de quem retirou
- Assinatura digital
- Entrega parcial
- Múltiplas vias

## 🏗️ Arquitetura

### Backend (Spring Boot)

```
backend/src/main/java/com/sistemadesaude/backend/exames/
├── entity/
│   ├── ConfiguracaoLaboratorio.java
│   ├── Exame.java
│   ├── MaterialExame.java
│   ├── GrupoExame.java
│   ├── CampoExame.java
│   ├── MetodoExame.java
│   ├── MapaLaboratorio.java
│   ├── RecepcaoExame.java
│   ├── ExameRecepcao.java
│   ├── ColetaMaterial.java
│   ├── ResultadoExame.java
│   ├── ValorCampoResultado.java
│   └── EntregaExame.java
├── repository/
│   ├── ExameRepository.java
│   ├── ConfiguracaoLaboratorioRepository.java
│   ├── RecepcaoExameRepository.java
│   ├── ResultadoExameRepository.java
│   └── ... (14 repositories)
├── service/
│   ├── ExameService.java
│   ├── RecepcaoExameService.java
│   └── ResultadoExameService.java
├── controller/
│   ├── ExameController.java
│   ├── RecepcaoExameController.java
│   ├── ResultadoExameController.java
│   └── ConfiguracaoLaboratorioController.java
└── dto/
    ├── ExameDTO.java
    ├── RecepcaoExameDTO.java
    ├── ResultadoExameDTO.java
    └── ... (13 DTOs)
```

### Frontend (React/TypeScript)

```
frontend/src/
├── services/laboratorio/
│   └── laboratorioService.ts
└── pages/laboratorio/
    ├── Laboratorio.tsx (Main)
    ├── configuracao/
    │   └── ConfiguracaoLaboratorio.tsx
    ├── exames/
    │   ├── ListaExames.tsx
    │   └── FormExame.tsx
    ├── materiais/
    │   └── ListaMateriais.tsx
    ├── grupos/
    │   └── ListaGrupos.tsx
    ├── recepcao/
    │   └── RecepcaoExames.tsx
    ├── coleta/
    │   └── ColetaMateriais.tsx
    ├── resultados/
    │   └── DigitacaoResultados.tsx
    └── entrega/
        └── EntregaExames.tsx
```

### Banco de Dados

```sql
-- 21 tabelas principais
lab_configuracao
lab_exame
lab_grupo_exame
lab_material_exame
lab_exame_material
lab_campo_exame
lab_metodo_exame
lab_texto_pronto
lab_mapa
lab_mapa_profissional
lab_motivo_exame
lab_motivo_nova_coleta
lab_recepcao_exame
lab_exame_recepcao
lab_coleta_material
lab_material_coletado
lab_resultado_exame
lab_valor_campo_resultado
lab_entrega_exame
lab_exame_entregue
lab_exame_complementar
```

## 📦 Instalação

### Pré-requisitos
- Java 17+
- Node.js 18+
- PostgreSQL 14+
- Maven 3.8+

### Backend

```bash
cd backend

# Configurar banco de dados no application.properties
# spring.datasource.url=jdbc:postgresql://localhost:5432/sistemasaude
# spring.datasource.username=postgres
# spring.datasource.password=senha

# Executar migrations
./mvnw flyway:migrate

# Iniciar aplicação
./mvnw spring-boot:run
```

A aplicação estará disponível em `http://localhost:8080`

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar API endpoint no .env
# VITE_API_URL=http://localhost:8080/api

# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 💻 Uso

### 1. Configurar o Laboratório

```typescript
// Acessar Laboratório > Configurações
// Configurar cada aba conforme necessário
```

### 2. Cadastrar Exames

```typescript
// Laboratório > Exames > Novo Exame

const exame = {
  codigo: 'HEM001',
  nome: 'Hemograma Completo',
  grupo: 'Hematologia',
  tipoDigitacao: 'POR_CAMPO',
  materiais: ['Sangue total'],
  campos: [
    { nome: 'hemacias', label: 'Hemácias', tipoCampo: 'DECIMAL', unidadeMedida: 'milhões/mm³' },
    { nome: 'hemoglobina', label: 'Hemoglobina', tipoCampo: 'DECIMAL', unidadeMedida: 'g/dL' }
  ]
};
```

### 3. Recepcionar Paciente

```typescript
// Laboratório > Recepção
// 1. Buscar paciente
// 2. Selecionar exames
// 3. Definir tipo de atendimento
// 4. Finalizar recepção
```

### 4. Coletar Materiais

```typescript
// Laboratório > Coleta
// 1. Selecionar recepção
// 2. Registrar materiais coletados
// 3. Imprimir etiquetas
```

### 5. Digitar Resultados

```typescript
// Laboratório > Resultados
// 1. Selecionar exame pendente
// 2. Preencher campos
// 3. Salvar e liberar laudo
```

### 6. Entregar Exames

```typescript
// Laboratório > Entrega
// 1. Buscar recepção
// 2. Validar documento
// 3. Registrar entrega
// 4. Imprimir comprovante
```

## 📡 API Reference

### Exames

```http
GET    /api/laboratorio/exames
GET    /api/laboratorio/exames/ativos
GET    /api/laboratorio/exames/{id}
GET    /api/laboratorio/exames/codigo/{codigo}
GET    /api/laboratorio/exames/buscar?termo={termo}
POST   /api/laboratorio/exames
PUT    /api/laboratorio/exames/{id}
DELETE /api/laboratorio/exames/{id}
```

### Recepção

```http
POST   /api/laboratorio/recepcao
GET    /api/laboratorio/recepcao/{id}
GET    /api/laboratorio/recepcao/numero/{numero}
GET    /api/laboratorio/recepcao/paciente/{pacienteId}
PUT    /api/laboratorio/recepcao/{id}/cancelar?motivo={motivo}
```

### Resultados

```http
POST   /api/laboratorio/resultados
GET    /api/laboratorio/resultados/{id}
GET    /api/laboratorio/resultados/pendentes-assinatura
PUT    /api/laboratorio/resultados/{id}/assinar
```

### Configuração

```http
GET    /api/laboratorio/configuracao/unidade/{unidadeId}
POST   /api/laboratorio/configuracao
PUT    /api/laboratorio/configuracao/{id}
```

## 📊 Estrutura de Dados

### Exame

```json
{
  "id": 1,
  "codigo": "HEM001",
  "nome": "Hemograma Completo",
  "tipoDigitacao": "POR_CAMPO",
  "campos": [
    {
      "nome": "hemacias",
      "label": "Hemácias",
      "tipoCampo": "DECIMAL",
      "unidadeMedida": "milhões/mm³",
      "ordem": 1
    }
  ],
  "metodos": [
    {
      "nomeMetodo": "Método Padrão",
      "sexo": "AMBOS",
      "idadeMinimaMeses": 0,
      "idadeMaximaMeses": 1200,
      "valorReferenciaMin": 4.5,
      "valorReferenciaMax": 6.0
    }
  ]
}
```

### Recepção

```json
{
  "pacienteId": 123,
  "unidadeId": 1,
  "urgente": false,
  "tipoAtendimento": "SUS",
  "exames": [
    {
      "exameId": 1,
      "quantidade": 1,
      "autorizado": true
    }
  ]
}
```

### Resultado

```json
{
  "exameRecepcaoId": 456,
  "metodoId": 1,
  "valoresCampos": {
    "1": "5.2",
    "2": "14.5"
  },
  "liberarLaudo": true
}
```

## 🔧 Regras de Negócio

### Validações de Recepção
1. Validar idade do paciente conforme configuração do exame
2. Validar sexo do paciente
3. Verificar exames duplicados (configurável)
4. Verificar validade de exames anteriores

### Digitação de Resultados
1. Validar preenchimento de campos obrigatórios
2. Comparar valores com referências (alertar alterados)
3. Permitir salvar rascunho sem liberar
4. Bloquear edição após assinatura

### Entrega de Exames
1. Verificar documento conforme configuração
2. Validar biometria se configurado
3. Permitir entrega parcial se configurado
4. Registrar quem retirou e parentesco

## 🔐 Segurança

- Autenticação via JWT
- Autorização por perfil de acesso
- Auditoria completa de operações
- Assinatura digital com certificado e-CPF
- Controle de acesso por unidade

## 📝 Notas de Implementação

### Próximas Funcionalidades
- [ ] Interfaceamento real com equipamentos
- [ ] Importação/Exportação e-SUS
- [ ] Relatórios gerenciais
- [ ] Painel eletrônico de chamadas
- [ ] Impressão de etiquetas Zebra/Argox
- [ ] Certificação digital de laudos
- [ ] Integração com consórcios
- [ ] App mobile para coleta

### Tecnologias Utilizadas
- **Backend**: Spring Boot 3.x, JPA/Hibernate, PostgreSQL, Flyway
- **Frontend**: React 18, TypeScript, Tailwind CSS, React Hook Form
- **Segurança**: Spring Security, JWT
- **Documentação**: OpenAPI/Swagger

## 📞 Suporte

Para dúvidas ou sugestões:
- Email: suporte@sistemasaude.com
- Issues: GitHub Issues

## 📄 Licença

Proprietário - Sistema de Saúde © 2025