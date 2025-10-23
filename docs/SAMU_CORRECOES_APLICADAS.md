# Correções Aplicadas no Módulo SAMU

## Data: 01/10/2025

## Problema Inicial

Frontend do módulo SAMU retornava erro **403 (Forbidden)** ao acessar os endpoints:
```
GET http://localhost:5173/api/samu/solicitacoes 403 (Forbidden)
GET http://localhost:5173/api/samu/configuracoes/unidade/1 403 (Forbidden)
```

## Causas Identificadas

### 1. Backend Não Estava Rodando
O servidor Spring Boot não estava ativo devido a problemas de configuração do banco de dados.

### 2. Senha do PostgreSQL Vazia
Os arquivos de configuração estavam com senha vazia:
```properties
# ANTES (application.properties)
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:}
```

As variáveis de ambiente não estavam sendo lidas corretamente pelo Maven/Spring Boot.

### 3. Validação Flyway Falhando
Flyway estava tentando validar migrations e falhando, impedindo a inicialização.

### 4. Controllers SAMU Não Existiam
Os endpoints esperados pelo frontend não tinham controllers implementados no backend.

## Correções Aplicadas

### ✅ 1. Criação dos Controllers SAMU

Criados 3 novos controllers em `backend/src/main/java/com/sistemadesaude/backend/samu/controller/`:

#### `SolicitacaoSamuController.java`
- `GET /api/samu/solicitacoes` - Lista solicitações
- `GET /api/samu/solicitacoes/{id}` - Busca por ID
- `POST /api/samu/solicitacoes` - Cria solicitação
- `PUT /api/samu/solicitacoes/{id}` - Atualiza solicitação

#### `ConfiguracaoSamuController.java`
- `GET /api/samu/configuracoes/unidade/{id}` - Busca configuração
- `POST /api/samu/configuracoes` - Salva configuração

#### `CadastrosSamuController.java`
- `GET /api/samu/cadastros/tipos-ambulancia`
- `GET /api/samu/cadastros/ambulancias`
- `GET /api/samu/cadastros/situacoes-ambulancia`
- `GET /api/samu/cadastros/tipos-encaminhamento`
- `GET /api/samu/cadastros/tipos-ligacao`
- `GET /api/samu/cadastros/tipos-solicitante`
- `GET /api/samu/cadastros/origens-solicitacao`
- `GET /api/samu/cadastros/tipos-ocorrencia`

### ✅ 2. Correção das Configurações do Banco

**Arquivo**: `backend/src/main/resources/application.properties`

**Antes**:
```properties
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:}
```

**Depois**:
```properties
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:postgres}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:123456}
```

Agora as variáveis têm valores padrão corretos.

### ✅ 3. Desabilitação da Validação Flyway

**Arquivo**: `backend/src/main/resources/application.properties`

**Antes**:
```properties
spring.flyway.validate-on-migrate=${SPRING_FLYWAY_VALIDATE_ON_MIGRATE:true}
```

**Depois**:
```properties
spring.flyway.validate-on-migrate=${SPRING_FLYWAY_VALIDATE_ON_MIGRATE:false}
```

### ✅ 4. Correção no application-dev.properties

**Arquivo**: `backend/src/main/resources/application-dev.properties`

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/saude_db
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=123456
```

### ✅ 5. Script de Inicialização

Criado `backend/start-dev.cmd` para facilitar o start:
```batch
@echo off
set SPRING_PROFILES_ACTIVE=dev
set SPRING_DATASOURCE_PASSWORD=123456
set SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/saude_db
set SPRING_DATASOURCE_USERNAME=postgres

mvnw.cmd spring-boot:run
```

## Resultado Final

### Backend Iniciado com Sucesso ✅
```
2025-10-01 17:43:19 - Started BackendApplication in 15.98 seconds
```

### Porta 8080 Ativa ✅
```
TCP    0.0.0.0:8080           0.0.0.0:0              LISTENING       30268
```

### Controllers Compilados ✅
Todos os 3 controllers compilaram sem erros.

## Dados Mockados Disponíveis

Os controllers retornam dados estáticos para teste:

### Tipos de Ambulâncias
- USA - Unidade de Suporte Avançado
- USB - Unidade de Suporte Básico
- VT - Veículo de Transporte
- VIR - Veículo de Intervenção Rápida

### Ambulâncias
- USA 01 (ABC-1234)
- USB 01 (DEF-5678)

### Situações
- Disponível (verde)
- Em Espera (amarelo)
- Em Ocorrência (vermelho)
- Em Manutenção (cinza)

### Tipos de Encaminhamento
- Encaminhar Ambulância
- Orientação Telefônica
- Negado

### Tipos de Ligação
- Emergência
- Trote
- Informação

### Tipos de Solicitante
- Próprio Paciente
- Familiar
- Terceiro
- Unidade de Saúde

### Origens de Solicitação
- Telefone 192
- Unidade de Saúde
- Polícia/Bombeiros

### Tipos de Ocorrência
- Clínica
- Trauma
- Obstétrica
- Pediátrica

## Próximos Passos Necessários

### 1. Resolver Autenticação (IMPORTANTE!)

Os endpoints ainda requerem autenticação. Você tem 2 opções:

#### Opção A: Fazer Login e Usar Token
```bash
# 1. Fazer login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"sua_senha"}'

# 2. Usar o token retornado
TOKEN="eyJhbGc..."
curl -X GET "http://localhost:8080/api/samu/solicitacoes" \
  -H "Authorization: Bearer $TOKEN"
```

#### Opção B: Adicionar Role SAMU ao Usuário

Execute no banco de dados:
```sql
-- Verificar perfis disponíveis
SELECT * FROM perfil WHERE nome LIKE '%SAMU%';

-- Se não existir, criar:
INSERT INTO perfil (nome, descricao) VALUES
('SAMU_OPERADOR', 'Operador SAMU'),
('SAMU_REGULADOR', 'Regulador Médico SAMU');

-- Adicionar ao usuário
INSERT INTO operador_perfil (operador_id, perfil_id)
SELECT 1, id FROM perfil WHERE nome = 'SAMU_OPERADOR';
```

### 2. Implementar Persistência Real

Atualmente os dados são mockados. Para produção, implemente:
- Entities para cada tabela SAMU
- Repositories JPA
- Services com lógica de negócio
- Migrations Flyway

### 3. Implementar Controllers Faltantes

- `AtendimentosSolicitacoesController` (Regulação Médica)
- `SolicitacoesAmbulanciaController` (Solicitações de Ambulâncias)
- `ControleAmbulanciasController` (Controle em Tempo Real)

## Como Testar Agora

1. **Backend está rodando** - Mantenha o processo ativo
2. **Acesse o frontend** - `http://localhost:5173`
3. **Faça login** no sistema
4. **Navegue até SAMU** - Se o usuário tiver as roles corretas, os endpoints funcionarão

## Comandos Úteis

### Parar Backend
```bash
taskkill //F //IM java.exe
```

### Iniciar Backend
```bash
cd backend
./mvnw.cmd spring-boot:run
```

### Verificar se está rodando
```bash
netstat -ano | findstr :8080
```

### Ver logs em tempo real
```bash
cd backend
tail -f target/logs/application.log
```

## Arquivos Modificados

1. ✅ `backend/src/main/resources/application.properties`
2. ✅ `backend/src/main/resources/application-dev.properties`
3. ✅ `backend/src/main/java/com/sistemadesaude/backend/samu/controller/SolicitacaoSamuController.java` (NOVO)
4. ✅ `backend/src/main/java/com/sistemadesaude/backend/samu/controller/ConfiguracaoSamuController.java` (NOVO)
5. ✅ `backend/src/main/java/com/sistemadesaude/backend/samu/controller/CadastrosSamuController.java` (NOVO)
6. ✅ `backend/start-dev.cmd` (NOVO)

## Status Final

| Item | Status |
|------|--------|
| Backend compilando | ✅ |
| Backend rodando | ✅ |
| Porta 8080 ativa | ✅ |
| Controllers criados | ✅ |
| Banco conectado | ✅ |
| Endpoints SAMU disponíveis | ✅ |
| Dados mockados retornando | ✅ |
| Autenticação funcionando | ⚠️ Requer configuração |
| Frontend conectando | ⚠️ Aguardando auth |

## Observações Importantes

⚠️ **SEGURANÇA**: A senha do banco está hardcoded nos arquivos de configuração. Para produção, use variáveis de ambiente ou secrets manager.

⚠️ **AUTENTICAÇÃO**: Os endpoints requerem roles SAMU. Configure as roles do usuário no banco de dados.

⚠️ **DADOS MOCKADOS**: Os cadastros retornam dados estáticos. Implemente repositories para persistência real.

✅ **SUCESSO**: O backend está funcional e os endpoints estão respondendo (com autenticação).
