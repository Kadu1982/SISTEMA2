# SAMU Backend - Guia de Configuração

## Controllers Implementados

Foram criados 3 controllers principais para o módulo SAMU:

### 1. SolicitacaoSamuController
**Arquivo**: `backend/src/main/java/com/sistemadesaude/backend/samu/controller/SolicitacaoSamuController.java`

**Endpoints**:
- `GET /api/samu/solicitacoes` - Lista solicitações com filtros
- `GET /api/samu/solicitacoes/{id}` - Busca solicitação por ID
- `POST /api/samu/solicitacoes` - Cria nova solicitação
- `PUT /api/samu/solicitacoes/{id}` - Atualiza solicitação

**Nota**: Este controller mapeia o conceito de "Solicitações" (frontend) para "Ocorrências" (backend existente).

### 2. ConfiguracaoSamuController
**Arquivo**: `backend/src/main/java/com/sistemadesaude/backend/samu/controller/ConfiguracaoSamuController.java`

**Endpoints**:
- `GET /api/samu/configuracoes/unidade/{unidadeId}` - Busca configuração por unidade
- `POST /api/samu/configuracoes` - Salva configuração

**Configuração Padrão Retornada**:
```json
{
  "informarTipoOcorrencia": "NAO_OBRIGATORIO",
  "informarTipoSolicitante": "NAO_OBRIGATORIO",
  "informarTipoLigacao": "NAO_OBRIGATORIO",
  "informarOrigemSolicitacao": "NAO_OBRIGATORIO",
  "informarUsuarioSolicitacao": true,
  "periodoSolicitacoesSamu": 30,
  "periodoAtendimentoSolicitacoes": 30,
  "periodoSolicitacoesAmbulancia": 30,
  "recargaSolicitacoesSamu": 30,
  "recargaAtendimentoSolicitacoes": 30,
  "recargaSolicitacoesAmbulancia": 30
}
```

### 3. CadastrosSamuController
**Arquivo**: `backend/src/main/java/com/sistemadesaude/backend/samu/controller/CadastrosSamuController.java`

**Endpoints Implementados**:

#### Tipos de Ambulâncias
- `GET /api/samu/cadastros/tipos-ambulancia`

**Dados mockados**:
- USA - Unidade de Suporte Avançado
- USB - Unidade de Suporte Básico
- VT - Veículo de Transporte
- VIR - Veículo de Intervenção Rápida

#### Ambulâncias
- `GET /api/samu/cadastros/ambulancias`

**Dados mockados**:
- USA 01 (Placa: ABC-1234)
- USB 01 (Placa: DEF-5678)

#### Situações de Ambulâncias
- `GET /api/samu/cadastros/situacoes-ambulancia`

**Dados mockados**:
- Disponível (verde: #22c55e)
- Em Espera (amarelo: #f59e0b)
- Em Ocorrência (vermelho: #ef4444)
- Em Manutenção (cinza: #6b7280)

#### Tipos de Encaminhamentos
- `GET /api/samu/cadastros/tipos-encaminhamento`

**Dados mockados**:
- Encaminhar Ambulância (encerramento: false)
- Orientação Telefônica (encerramento: true)
- Negado (encerramento: true)

#### Tipos de Ligações
- `GET /api/samu/cadastros/tipos-ligacao`

**Dados mockados**:
- Emergência (encerramento: false)
- Trote (encerramento: true)
- Informação (encerramento: true)

#### Tipos de Solicitantes
- `GET /api/samu/cadastros/tipos-solicitante`

**Dados mockados**:
- Próprio Paciente
- Familiar
- Terceiro
- Unidade de Saúde

#### Origens de Solicitações
- `GET /api/samu/cadastros/origens-solicitacao`

**Dados mockados**:
- Telefone 192
- Unidade de Saúde
- Polícia/Bombeiros

#### Tipos de Ocorrências
- `GET /api/samu/cadastros/tipos-ocorrencia`

**Dados mockados**:
- Clínica
- Trauma
- Obstétrica
- Pediátrica

## Problema de Autenticação 403

### Sintoma
```
GET http://localhost:5173/api/samu/solicitacoes 403 (Forbidden)
```

### Causa
Os novos endpoints SAMU requerem autenticação. Todos os controllers usam `@PreAuthorize` com roles SAMU:
- `SAMU_OPERADOR`
- `SAMU_REGULADOR`
- `ADMIN`

### Soluções Possíveis

#### Opção 1: Adicionar Permissões ao Usuário
Certifique-se de que o usuário logado possui uma das roles necessárias:
```sql
-- Verificar roles do usuário
SELECT * FROM operador_perfil WHERE operador_id = ?;

-- Adicionar role SAMU_OPERADOR
INSERT INTO operador_perfil (operador_id, perfil_id)
VALUES (?, (SELECT id FROM perfil WHERE nome = 'SAMU_OPERADOR'));
```

#### Opção 2: Configurar CORS e Segurança
Verificar se o token JWT está sendo enviado corretamente no header:
```javascript
// No frontend, o axios deve incluir:
headers: {
  'Authorization': `Bearer ${token}`,
  'X-Operador-Id': operadorId
}
```

#### Opção 3: Temporariamente Liberar para Teste (NÃO RECOMENDADO PARA PRODUÇÃO)
Comentar temporariamente o `@PreAuthorize` nos controllers:
```java
// @PreAuthorize("hasRole('SAMU_OPERADOR') or hasRole('SAMU_REGULADOR') or hasRole('ADMIN')")
public ResponseEntity<...> listarSolicitacoes(...) {
  // ...
}
```

## Problema do Banco de Dados

### Sintoma
```
PSQLException: The server requested SCRAM-based authentication, but no password was provided.
```

### Causa
A variável de ambiente `SPRING_DATASOURCE_PASSWORD` não está sendo lida corretamente pelo Spring Boot.

### Solução

#### Usar o Script de Inicialização
Foi criado um script `backend/start-dev.cmd`:
```batch
@echo off
set SPRING_PROFILES_ACTIVE=dev
set SPRING_DATASOURCE_PASSWORD=123456
set SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/saude_db
set SPRING_DATASOURCE_USERNAME=postgres

mvnw.cmd spring-boot:run
```

**Como usar**:
```bash
cd backend
start-dev.cmd
```

#### Ou Configurar no application-dev.properties
Remover as variáveis de ambiente e colocar valores diretos:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/saude_db
spring.datasource.username=postgres
spring.datasource.password=123456
```

#### Ou Usar Variáveis de Ambiente do Sistema
Configurar permanentemente no Windows:
```bash
setx SPRING_DATASOURCE_PASSWORD "123456"
setx SPRING_PROFILES_ACTIVE "dev"
```

## Próximos Passos

### Controllers a Implementar

1. **AtendimentosSolicitacoesController** - Regulação Médica
   - `GET /api/samu/atendimentos/pendentes` - Lista solicitações pendentes
   - `POST /api/samu/atendimentos` - Cria atendimento/regulação
   - `PUT /api/samu/atendimentos/{id}/encerrar` - Encerra atendimento

2. **SolicitacoesAmbulanciaController** - Solicitação de Ambulâncias
   - `GET /api/samu/ambulancias/solicitacoes` - Lista solicitações de ambulância
   - `POST /api/samu/ambulancias/solicitacoes` - Cria solicitação
   - `PUT /api/samu/ambulancias/solicitacoes/{id}/encerrar` - Encerra solicitação

3. **ControleAmbulanciasController** - Controle em Tempo Real
   - `GET /api/samu/ambulancias/controle` - Lista ambulâncias por situação
   - `PUT /api/samu/ambulancias/{id}/situacao` - Atualiza situação

### Entidades a Criar

Se necessário criar entidades próprias do SAMU conforme o manual (ao invés de adaptar as existentes):

1. **SolicitacaoSamu** - Registro TARM
2. **AtendimentoSolicitacao** - Regulação Médica
3. **SolicitacaoAmbulancia** - Vínculo Ambulância
4. **ConfiguracaoSamu** - Configurações do módulo
5. Entidades de cadastros (TipoAmbulancia, SituacaoAmbulancia, etc.)

### Migração Flyway

Criar migrations para as novas tabelas (se necessário):
```sql
-- V[timestamp]__create_samu_solicitacoes.sql
CREATE TABLE samu_solicitacao (
  id BIGSERIAL PRIMARY KEY,
  codigo BIGINT NOT NULL UNIQUE,
  telefone VARCHAR(20) NOT NULL,
  motivo_queixa TEXT,
  -- ... outros campos
);

-- V[timestamp]__create_samu_config.sql
CREATE TABLE samu_configuracao (
  id BIGSERIAL PRIMARY KEY,
  unidade_id BIGINT NOT NULL,
  informar_tipo_ocorrencia VARCHAR(20) DEFAULT 'NAO_OBRIGATORIO',
  -- ... outros campos
);
```

## Compilação e Execução

### Compilar Backend
```bash
cd backend
./mvnw.cmd compile
```

### Executar Testes
```bash
./mvnw.cmd test
```

### Iniciar Servidor
```bash
# Opção 1: Script
start-dev.cmd

# Opção 2: Maven direto
./mvnw.cmd spring-boot:run

# Opção 3: JAR compilado
./mvnw.cmd clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

## Teste dos Endpoints

### Usando curl
```bash
# Login para obter token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha"}'

# Usar o token retornado
TOKEN="eyJhbGc..."

# Listar solicitações
curl -X GET "http://localhost:8080/api/samu/solicitacoes?dataInicio=2025-01-01&dataFim=2025-12-31" \
  -H "Authorization: Bearer $TOKEN"

# Buscar configuração
curl -X GET "http://localhost:8080/api/samu/configuracoes/unidade/1" \
  -H "Authorization: Bearer $TOKEN"

# Listar tipos de ambulância
curl -X GET "http://localhost:8080/api/samu/cadastros/tipos-ambulancia" \
  -H "Authorization: Bearer $TOKEN"
```

### Usando Postman/Insomnia
1. Fazer login em `/api/auth/login`
2. Copiar o token do response
3. Adicionar header `Authorization: Bearer {token}`
4. Testar os endpoints SAMU

## Status da Implementação

✅ **Concluído**:
- Controllers básicos do SAMU
- Endpoints de configuração (com dados mockados)
- Endpoints de cadastros (com dados mockados)
- Mapeamento Solicitações → Ocorrências
- Compilação do backend sem erros

⏳ **Pendente**:
- Resolver autenticação 403 (configurar roles)
- Resolver conexão banco de dados (senha)
- Implementar controllers de Atendimentos e Ambulâncias
- Criar entidades específicas SAMU (se necessário)
- Criar repositories para persistência
- Criar services com lógica de negócio
- Migrations Flyway para novas tabelas

## Observações Importantes

1. **Dados Mockados**: Atualmente os cadastros retornam dados estáticos. Para produção, implementar repositories e persistência.

2. **Mapeamento Ocorrências**: O sistema atual usa "Ocorrências". Os novos endpoints adaptam para o conceito de "Solicitações" do manual.

3. **Segurança**: Todos os endpoints requerem autenticação JWT e roles específicas do SAMU.

4. **Integração com Sistema Existente**: Os controllers usam os services existentes (`RegistroOcorrenciaService`) quando possível.
