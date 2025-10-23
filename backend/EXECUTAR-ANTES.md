# ⚠️ EXECUTAR ANTES DE RODAR A APLICAÇÃO

## 🔧 Problema Encontrado

A migration `V202510051900__consolidar_dependencias_faltantes.sql` falhou porque tentou criar um índice em uma coluna que não existe.

**Erro corrigido:** A coluna `nivel_risco` não existe, a correta é `cor_prioridade`.

---

## ✅ Passos para Corrigir

### 1. Abra o PgAdmin

### 2. Conecte ao banco `saude_db`

### 3. Execute o seguinte SQL no Query Tool:

```sql
-- Remover a migration que falhou do histórico do Flyway
DELETE FROM flyway_schema_history
WHERE version = '202510051900'
AND success = false;

-- Verificar que foi removida
SELECT version, description, success
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 5;
```

**Resultado esperado:** `DELETE 1` (removeu 1 registro)

---

### 4. Agora execute a aplicação normalmente:

```batch
cd C:\Users\okdur\Desktop\sistema2\backend
mvnw.cmd spring-boot:run
```

---

## 📋 O Que Foi Corrigido

| Problema | Correção |
|----------|----------|
| Índice em coluna inexistente `nivel_risco` | Alterado para `cor_prioridade` |
| Constraints CHECK duplicadas | Removidas (já existem na V20250923_1500) |
| Estrutura não alinhada com V20250923_1500 | Alinhada com a estrutura original |

---

## 🔍 Arquivo Corrigido

`backend/src/main/resources/db/migration/V202510051900__consolidar_dependencias_faltantes.sql`

**Mudanças:**
- ✅ Removida coluna `nivel_risco`
- ✅ Removidas constraints CHECK (já existem)
- ✅ Alinhada estrutura com a tabela original
- ✅ Índices corretos: `cor_prioridade` em vez de `nivel_risco`

---

## ⚡ Execução Rápida

Se preferir executar tudo via linha de comando:

```batch
REM 1. Remover migration falhada (execute no PgAdmin)
REM    DELETE FROM flyway_schema_history WHERE version = '202510051900' AND success = false;

REM 2. Executar aplicação
cd C:\Users\okdur\Desktop\sistema2\backend
mvnw.cmd spring-boot:run
```

---

## 📊 Status

- ✅ Migration corrigida
- ✅ Script SQL de remoção criado (REPAIR-FLYWAY.sql)
- ⏳ Aguardando execução do DELETE no banco
- ⏳ Aguardando nova tentativa de execução

---

**Próximo passo:** Execute o DELETE no PgAdmin e depois `mvnw.cmd spring-boot:run`
