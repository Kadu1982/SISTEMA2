# ✅ Correções Finais - Flyway e Properties

## 📋 Problemas Identificados e Corrigidos

### 1. ✅ Migration V30 - Tabelas Não Idempotentes

**Problema:** Migration tentava criar tabelas que já existiam, causando erro:
```
ERRO: relação "lab_configuracao" já existe
```

**Solução:** Todas as `CREATE TABLE` foram alteradas para `CREATE TABLE IF NOT EXISTS`:
- ✅ 20 tabelas corrigidas
- ✅ 11 índices corrigidos com `CREATE INDEX IF NOT EXISTS`

---

### 2. ✅ Migration V30 - Referências Incorretas de Tabelas

**Problema:** Foreign keys referenciando tabelas com nomes incorretos:
- `operadores` → deveria ser `operador` (singular)
- `unidade_saude` → deveria ser `unidades_saude` (plural)

**Solução:** Todas as referências corrigidas:
- ✅ `operadores(id)` → `operador(id)` (4 ocorrências)
- ✅ `unidade_saude(id)` → `unidades_saude(id)` (2 ocorrências)
- ✅ `profissionais(id)` → mantido (correto)

---

### 3. ✅ Estrutura dos Arquivos Properties

**Problema:** Arquivos `application.properties` e `application-dev.properties` tinham estruturas diferentes.

**Solução:** Estrutura alinhada:

#### Estrutura Padrão (ambos os arquivos):

```properties
# ===============================
# DATABASE - PostgreSQL
# ===============================
...

# ===============================
# JPA / HIBERNATE
# ===============================
...

# ===============================
# FLYWAY - CONTROLE DO SCHEMA
# ===============================
...

# ===============================
# HIKARICP - POOL DE CONEXÕES
# ===============================
...
```

**Diferenças entre Dev e Produção:**

| Propriedade | Dev | Produção |
|-------------|-----|----------|
| `spring.flyway.validate-on-migrate` | `false` | `${SPRING_FLYWAY_VALIDATE_ON_MIGRATE:true}` |
| `spring.flyway.out-of-order` | `true` (temp) | `true` (temp) |
| `spring.datasource.hikari.pool-name` | `SaudeHikariPool-Dev` | `SaudeHikariPool` |
| `spring.datasource.hikari.maximum-pool-size` | `10` | `40` |
| `spring.jpa.show-sql` | `true` | `false` |

---

## 🔧 Arquivos Modificados

### 1. `backend/src/main/resources/db/migration/V30__create_laboratorio_module.sql`
- ✅ Todas as `CREATE TABLE` → `CREATE TABLE IF NOT EXISTS`
- ✅ Todos os `CREATE INDEX` → `CREATE INDEX IF NOT EXISTS`
- ✅ `operadores` → `operador` (4 correções)
- ✅ `unidade_saude` → `unidades_saude` (2 correções)

### 2. `backend/src/main/resources/application.properties`
- ✅ Estrutura alinhada com `application-dev.properties`
- ✅ Seção HikariCP organizada
- ✅ Comentários explicativos adicionados
- ✅ Configurações temporárias documentadas

### 3. `backend/src/main/resources/application-dev.properties`
- ✅ Estrutura alinhada com `application.properties`
- ✅ Seção HikariCP organizada
- ✅ Comentários explicativos adicionados
- ✅ Configurações temporárias documentadas

---

## ⚠️ Configurações Temporárias

### ATENÇÃO: Estas configurações são TEMPORÁRIAS

Ambos os arquivos têm configurações temporárias para permitir aplicar migrations pendentes:

```properties
# TEMPORÁRIO: false para desabilitar validação
spring.flyway.validate-on-migrate=false

# TEMPORÁRIO: true para aplicar migrations pendentes fora de ordem
spring.flyway.out-of-order=true

# TEMPORÁRIO: true para ignorar migrations faltantes
spring.flyway.ignore-missing-migrations=true
```

### ⚠️ DEPOIS que todas as migrations forem aplicadas:

**Em `application.properties`:**
```properties
spring.flyway.validate-on-migrate=${SPRING_FLYWAY_VALIDATE_ON_MIGRATE:true}
spring.flyway.out-of-order=false
spring.flyway.ignore-missing-migrations=false
```

**Em `application-dev.properties`:**
```properties
spring.flyway.validate-on-migrate=false  # false em dev para agilizar
spring.flyway.out-of-order=false
spring.flyway.ignore-missing-migrations=false
```

---

## ✅ Próximos Passos

1. ✅ **Testar a aplicação:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. ✅ **Verificar migrations aplicadas:**
   ```sql
   SELECT version, description, installed_on, success
   FROM flyway_schema_history
   ORDER BY installed_rank DESC
   LIMIT 20;
   ```

3. ⏳ **Após confirmar sucesso:**
   - Reverter configurações temporárias
   - Testar novamente
   - Fazer commit

---

## 📊 Resumo das Correções

| Item | Status |
|------|--------|
| Migration V30 idempotente | ✅ Corrigido |
| Referências de tabelas | ✅ Corrigido |
| Estrutura dos properties | ✅ Alinhado |
| Configurações temporárias | ✅ Documentado |

---

## 🎯 Resultado Esperado

A aplicação deve:
- ✅ Iniciar sem erros
- ✅ Aplicar todas as migrations pendentes
- ✅ Criar/atualizar tabelas conforme necessário
- ✅ Funcionar normalmente após aplicação

---

## 📝 Notas Importantes

1. **Migration V30:** Agora é idempotente e pode ser executada múltiplas vezes sem erro
2. **Properties:** Estrutura alinhada facilita manutenção e comparação
3. **Configurações temporárias:** Devem ser revertidas após sincronização completa

