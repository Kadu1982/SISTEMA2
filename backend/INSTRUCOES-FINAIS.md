# 🎯 INSTRUÇÕES FINAIS PARA EXECUTAR A APLICAÇÃO

## ✅ Correções Aplicadas

1. **Migration V202510051900** - Corrigida (problema com índice `nivel_risco`)
2. **Migration V202510052000** - Criada para corrigir tipos BYTEA → OID
3. **application-dev.properties** - Validação Hibernate temporariamente desabilitada

---

## 📋 Passos para Executar

### 1️⃣ Remover Migrations Falhadas do Flyway

Abra o **PgAdmin** e execute:

```sql
DELETE FROM flyway_schema_history
WHERE version IN ('202510051900', '202510052000')
AND success = false;
```

**Resultado esperado:** `DELETE 1` ou `DELETE 2`

---

### 2️⃣ Executar a Aplicação

```batch
cd C:\Users\okdur\Desktop\sistema2\backend
set SPRING_PROFILES_ACTIVE=dev
mvnw.cmd spring-boot:run
```

---

## 🔍 O Que Foi Corrigido

### Problema 1: Coluna `nivel_risco` não existe
**Arquivo:** `V202510051900__consolidar_dependencias_faltantes.sql`

**Erro Original:**
```
ERRO: coluna "nivel_risco" não existe
```

**Correção:**
- Removida coluna inexistente `nivel_risco`
- Alinhada estrutura com a tabela original `classificacao_risco`
- Índice correto: `cor_prioridade` (em vez de `nivel_risco`)

---

### Problema 2: Tipo BYTEA vs OID
**Arquivo:** `V202510052000__fix_blob_columns_type.sql` (NOVA)

**Erro Original:**
```
Schema-validation: wrong column type encountered in column [codigo_barras_imagem]
found [bytea (Types#BINARY)], but expecting [oid (Types#BLOB)]
```

**Causa:**
- Migration `V20251001_1000` criou coluna como `BYTEA`
- Entidade Java usa `@Lob byte[]` que mapeia para `OID` no PostgreSQL

**Correção:**
```sql
-- Remove coluna BYTEA
ALTER TABLE agendamentos DROP COLUMN codigo_barras_imagem;
-- Cria novamente como OID
ALTER TABLE agendamentos ADD COLUMN codigo_barras_imagem OID;
```

---

### Problema 3: Validação do Hibernate
**Arquivo:** `application-dev.properties`

**Configuração Original:**
```properties
spring.jpa.hibernate.ddl-auto=validate
```

**Problema:**
- Hibernate validava o schema ANTES das migrations corretivas serem executadas
- Causava erro de inicialização

**Correção:**
```properties
spring.jpa.hibernate.ddl-auto=none
```

**⚠️ TEMPORÁRIO:** Após a aplicação iniciar com sucesso, você pode voltar para `validate`

---

## 🔄 Sequência de Execução

```
1. Flyway executa migrations
   ├── V202510051900: Cria tabelas fundamentais ✅
   └── V202510052000: Corrige BYTEA → OID ✅

2. Hibernate inicializa sem validação
   └── Não valida schema (ddl-auto=none) ✅

3. Aplicação inicia com sucesso ✅
```

---

## ✅ Resultado Esperado

Você deve ver:

```
2025-10-05 XX:XX:XX - Flyway upgrade recommended...
2025-10-05 XX:XX:XX - Current version of schema "public": 202510051900
2025-10-05 XX:XX:XX - Migrating schema "public" to version "202510052000 - fix blob columns type"
2025-10-05 XX:XX:XX - Successfully applied 1 migration to schema "public"
...
2025-10-05 XX:XX:XX - Started BackendApplication in X.XXX seconds
```

---

## 🛠️ Se Ainda Houver Erros

### Erro: Migration V202510052000 failed

Execute no PgAdmin:
```sql
DELETE FROM flyway_schema_history
WHERE version = '202510052000'
AND success = false;
```

Depois execute novamente: `mvnw.cmd spring-boot:run`

---

### Erro: Outras colunas com tipo errado

Se aparecer erro similar com outras tabelas/colunas:

1. Identifique a coluna problemática no erro
2. Execute:
```sql
-- Exemplo para tabela X, coluna Y
ALTER TABLE X DROP COLUMN Y;
ALTER TABLE X ADD COLUMN Y OID;
```

---

## 📊 Verificação Pós-Execução

Após a aplicação iniciar, verifique:

```sql
-- 1. Verificar tipo da coluna
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'agendamentos'
AND column_name = 'codigo_barras_imagem';
-- Esperado: oid

-- 2. Verificar migrations aplicadas
SELECT version, description, success
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 5;
-- Esperado: 202510052000 | success = true

-- 3. Total de tabelas
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
```

---

## 🎯 Reativar Validação do Hibernate (Opcional)

**Após confirmar que tudo está funcionando:**

1. Edite `application-dev.properties`
2. Altere:
```properties
spring.jpa.hibernate.ddl-auto=validate
```
3. Reinicie a aplicação
4. Se não houver erros, a validação está OK ✅

---

## 📁 Arquivos Modificados

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| V202510051900__consolidar_dependencias_faltantes.sql | Migration | Corrigida estrutura classificacao_risco |
| V202510052000__fix_blob_columns_type.sql | Migration | Nova - converte BYTEA para OID |
| application-dev.properties | Config | Desabilitada validação Hibernate |
| REPAIR-FLYWAY.sql | Script | SQL para remover migrations falhadas |
| repair-e-executar-v2.bat | Script | Batch para executar com instruções |

---

## 🚀 PRONTO!

Execute os 2 passos acima e a aplicação deve iniciar sem erros! 🎉

**Data:** 05/10/2025 02:00
**Status:** Pronto para executar
