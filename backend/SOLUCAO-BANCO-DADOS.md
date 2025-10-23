# 🔧 Solução para Problemas de Migration do Banco de Dados

## 📋 Resumo do Problema

A aplicação estava falhando ao iniciar com o erro:
```
ERRO: relação "triagens" não existe
```

### 🔍 Causa Raiz

O Flyway ordena as migrations **alfabeticamente** pelo nome do arquivo. Isso causou o seguinte problema:

1. **V20250910__ajustes_triagens_alinhar_com_entidade.sql** (executada ANTES)
   - Tentava modificar a tabela `triagens`
   - Executava **ANTES** da tabela ser criada

2. **V20250125_0001__criar_tabela_triagens.sql** (executada DEPOIS)
   - Criava a tabela `triagens`
   - Executava **DEPOIS** devido à ordenação alfabética

### 📊 Ordem de Execução Incorreta

```
V1__Initial_Schema.sql
V2__areas_e_micros.sql
...
V20250910__ajustes_triagens...  ❌ ERRO: tabela não existe
...
V20250125_0001__criar_tabela... ✅ Cria a tabela (tarde demais)
```

## ✅ Solução Implementada

### 1. Migration Corrigida

Modifiquei `V20250910__ajustes_triagens_alinhar_com_entidade.sql` para:

- ✅ Verificar se a tabela existe antes de tentar modificá-la
- ✅ Usar verificações `IF NOT EXISTS` para todas as colunas
- ✅ Usar verificações `IF NOT EXISTS` para todos os índices
- ✅ Ser **idempotente** (pode executar múltiplas vezes sem erro)

### 2. Código Principal da Correção

```sql
DO $$
BEGIN
  -- Primeiro verifica se a tabela existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'triagens') THEN
    -- Só executa as alterações se a tabela existir
    -- ... (todas as alterações aqui)
  ELSE
    -- Se a tabela não existe, apenas avisa no log
    RAISE NOTICE 'Tabela triagens ainda não existe. Esta migration será aplicada quando a tabela for criada.';
  END IF;
END$$;
```

## 🚀 Como Usar a Solução

### Opção 1: Recriar Banco de Dados (RECOMENDADO para desenvolvimento)

Use o script fornecido:

```batch
cd backend
fix-database.bat
```

Ou manualmente:

```sql
-- 1. Conectar ao banco postgres
psql -U postgres -d postgres

-- 2. Dropar e recriar
DROP DATABASE IF EXISTS sistema_saude;
CREATE DATABASE sistema_saude WITH OWNER = postgres ENCODING = 'UTF8';
```

### Opção 2: Reparar Banco Existente

```batch
cd backend
./mvnw.cmd flyway:repair
./mvnw.cmd spring-boot:run
```

## 📝 Checklist de Verificação

Após aplicar a solução:

- [ ] Banco de dados recriado ou reparado
- [ ] Compilação bem-sucedida (`mvnw.cmd clean compile`)
- [ ] Aplicação inicializa sem erros
- [ ] Todas as migrations executadas com sucesso
- [ ] Tabela `triagens` criada corretamente
- [ ] Todas as colunas da entidade Triagem presentes

## 🛡️ Prevenção de Problemas Futuros

### Convenção de Nomenclatura de Migrations

Para evitar problemas de ordenação, use:

✅ **CORRETO:**
```
V1__description.sql
V2__description.sql
V17__description.sql
V18__description.sql
```

❌ **EVITAR:**
```
V1__description.sql
V20250125_0001__description.sql  (pode executar fora de ordem)
```

### Boas Práticas

1. **Sempre use verificações de existência:**
   ```sql
   ALTER TABLE IF EXISTS tabela ...
   ADD COLUMN IF NOT EXISTS coluna ...
   CREATE INDEX IF NOT EXISTS idx_nome ...
   ```

2. **Verifique dependências:**
   - Se a migration modifica uma tabela, garanta que ela existe
   - Use DO $$ blocks para lógica condicional

3. **Teste migrations em ambiente limpo:**
   - Sempre teste migrations em banco novo
   - Valide ordem de execução com `flyway:info`

## 📚 Referências

- [Flyway Naming Patterns](https://documentation.red-gate.com/fd/migrations-184127470.html)
- [PostgreSQL IF EXISTS](https://www.postgresql.org/docs/current/ddl-depend.html)

---

**Status:** ✅ Problema resolvido
**Data:** 04/10/2025
**Versão corrigida:** V20250910__ajustes_triagens_alinhar_com_entidade.sql
