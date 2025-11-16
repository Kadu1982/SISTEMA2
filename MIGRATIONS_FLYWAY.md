# 🗄️ Guia de Migrations Flyway

## 📋 Visão Geral

O projeto utiliza **Flyway** para gerenciar migrations do banco de dados PostgreSQL. As migrations são executadas **automaticamente** quando o backend Spring Boot inicia.

## 📁 Localização das Migrations

Todas as migrations estão localizadas em:
```
backend/src/main/resources/db/migration/
```

## 🔄 Como Funciona

### Execução Automática

Quando o backend inicia pela primeira vez (ou após atualização), o Flyway:

1. **Verifica** o histórico de migrations no banco (`flyway_schema_history`)
2. **Identifica** migrations pendentes
3. **Aplica** migrations pendentes em ordem cronológica
4. **Registra** cada migration aplicada no histórico

### Nomenclatura das Migrations

As migrations seguem o padrão:
```
V{versao}__{descricao}.sql
```

Exemplos:
- `V1__Initial_Schema.sql`
- `V2__areas_e_micros.sql`
- `V202511100001__add_alergias_to_pacientes.sql`

## ⚙️ Configuração

### Em Produção (VPS)

As migrations são configuradas no arquivo `application-prod.properties`:

```properties
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.locations=classpath:db/migration
spring.flyway.validate-on-migrate=true
spring.flyway.out-of-order=false
spring.flyway.clean-disabled=true
```

### Variáveis de Ambiente

Você pode controlar o Flyway via variáveis no arquivo `.env`:

```env
# Habilitar/desabilitar Flyway
SPRING_FLYWAY_ENABLED=true

# Validar migrations (recomendado: true em produção)
SPRING_FLYWAY_VALIDATE_ON_MIGRATE=true

# Permitir migrations fora de ordem (recomendado: false em produção)
SPRING_FLYWAY_OUT_OF_ORDER=false
```

## 🔍 Verificar Status das Migrations

### Via Script Automatizado

```bash
# Tornar executável
chmod +x scripts/check-migrations.sh

# Executar verificação
./scripts/check-migrations.sh
```

### Via Logs do Docker

```bash
# Ver logs do Flyway
docker compose -f docker-compose.prod.yml logs backend | grep -i flyway

# Ver logs completos do backend
docker compose -f docker-compose.prod.yml logs -f backend
```

### Via Banco de Dados

```bash
# Conectar ao PostgreSQL
docker exec -it saude_postgres psql -U postgres -d saude_db

# Ver histórico de migrations
SELECT version, description, installed_on, success 
FROM flyway_schema_history 
ORDER BY installed_rank DESC;

# Ver apenas migrations com sucesso
SELECT version, description, installed_on 
FROM flyway_schema_history 
WHERE success = true 
ORDER BY installed_rank DESC;

# Ver migrations com erro
SELECT version, description, installed_on, type, script 
FROM flyway_schema_history 
WHERE success = false;
```

## 🚨 Troubleshooting

### Problema: Migration não foi aplicada

**Sintomas:**
- Erro ao iniciar backend
- Tabela não existe no banco
- Coluna não existe na tabela

**Solução:**

1. Verificar logs do Flyway:
```bash
docker compose -f docker-compose.prod.yml logs backend | grep -i flyway
```

2. Verificar se migration existe:
```bash
docker exec -it saude_backend ls -la /app/BOOT-INF/classes/db/migration/
```

3. Verificar histórico no banco:
```bash
docker exec -it saude_postgres psql -U postgres -d saude_db -c "SELECT * FROM flyway_schema_history;"
```

4. Se necessário, reparar Flyway:
```bash
# O Flyway tem um método repair() que corrige inconsistências
# Isso é feito automaticamente pela FlywayConfig.java
docker compose -f docker-compose.prod.yml restart backend
```

### Problema: Migration com erro

**Sintomas:**
- Backend não inicia
- Erro SQL na migration
- Migration marcada como `success = false` no histórico

**Solução:**

1. Verificar erro específico nos logs:
```bash
docker compose -f docker-compose.prod.yml logs backend | grep -A 20 -i "migration failed"
```

2. Corrigir o arquivo SQL da migration

3. Reparar Flyway:
```bash
# O FlywayConfig.java executa repair() antes de migrate()
docker compose -f docker-compose.prod.yml restart backend
```

4. Se necessário, marcar migration como resolvida manualmente:
```sql
-- Conectar ao banco
docker exec -it saude_postgres psql -U postgres -d saude_db

-- Marcar migration como sucesso (CUIDADO!)
UPDATE flyway_schema_history 
SET success = true 
WHERE version = 'V{versao}';
```

### Problema: Migration fora de ordem

**Sintomas:**
- Erro: "Found non-empty schema(s) without Flyway schema history table"
- Migration não aplicada porque versão é menor que última aplicada

**Solução:**

1. Verificar configuração:
```bash
# Verificar se out-of-order está habilitado
grep SPRING_FLYWAY_OUT_OF_ORDER .env
```

2. Habilitar temporariamente (apenas se necessário):
```env
SPRING_FLYWAY_OUT_OF_ORDER=true
```

3. Reiniciar backend:
```bash
docker compose -f docker-compose.prod.yml restart backend
```

4. **IMPORTANTE:** Desabilitar após resolver:
```env
SPRING_FLYWAY_OUT_OF_ORDER=false
```

## 📝 Criar Nova Migration

### Passo 1: Criar Arquivo SQL

Crie um novo arquivo em `backend/src/main/resources/db/migration/`:

```sql
-- V{numero}__{descricao}.sql
-- Exemplo: V202511200001__add_nova_tabela.sql

CREATE TABLE nova_tabela (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nova_tabela_nome ON nova_tabela(nome);
```

### Passo 2: Versionamento

Use uma das seguintes convenções:

- **Numérica sequencial**: `V1`, `V2`, `V3`, etc.
- **Data e hora**: `V202511200001` (ano, mês, dia, sequencial)

### Passo 3: Commit e Deploy

```bash
# Commit da migration
git add backend/src/main/resources/db/migration/V{numero}__{descricao}.sql
git commit -m "feat: adiciona migration para nova tabela"
git push origin main

# Na VPS, fazer pull e restart
git pull origin main
docker compose -f docker-compose.prod.yml restart backend
```

### Passo 4: Verificar Aplicação

```bash
# Verificar se migration foi aplicada
./scripts/check-migrations.sh
```

## ✅ Boas Práticas

1. **Sempre faça backup** antes de aplicar migrations em produção
2. **Teste localmente** antes de fazer deploy
3. **Use transações** quando possível (Flyway executa cada migration em transação)
4. **Não modifique** migrations já aplicadas
5. **Use rollback scripts** para migrations destrutivas
6. **Documente** migrations complexas com comentários SQL
7. **Valide** migrations antes de commit (sintaxe SQL)

## 🔐 Segurança

- Migrations são executadas com as credenciais do banco configuradas
- Em produção, use usuário com permissões adequadas (não superuser)
- Migrations não devem conter senhas ou dados sensíveis
- Use variáveis de ambiente para valores sensíveis quando necessário

## 📚 Recursos Adicionais

- [Documentação Flyway](https://flywaydb.org/documentation/)
- [Spring Boot Flyway Integration](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-initialization.migration-tool.flyway)

---

**Última atualização**: 2024

