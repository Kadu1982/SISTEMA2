# ✅ INSTRUÇÕES: Marcar Baseline como Aplicada

## 🎯 Objetivo

Marcar a baseline V999999999999 como "já aplicada" no seu banco atual para evitar que ela tente executar novamente.

---

## 📋 Opção 1: Usando pgAdmin (MAIS FÁCIL) ⭐

1. **Abrir pgAdmin**

2. **Conectar ao banco `saude_db`**

3. **Abrir Query Tool** (botão com ícone de SQL ou `Tools > Query Tool`)

4. **Copiar e colar este SQL:**

```sql
-- Marcar baseline como aplicada
INSERT INTO flyway_schema_history (
    installed_rank,
    version,
    description,
    type,
    script,
    checksum,
    installed_by,
    installed_on,
    execution_time,
    success
) VALUES (
    (SELECT COALESCE(MAX(installed_rank), 0) + 1 FROM flyway_schema_history),
    '999999999999',
    'baseline sistema saude',
    'SQL',
    'V999999999999__baseline_sistema_saude.sql',
    NULL,
    CURRENT_USER,
    NOW(),
    0,
    TRUE
) ON CONFLICT DO NOTHING;

-- Verificar se foi inserida
SELECT version, description, installed_on, success
FROM flyway_schema_history
WHERE version = '999999999999';
```

5. **Executar** (F5 ou botão Execute)

6. **Verificar resultado:**
   - Deve mostrar: `version: 999999999999`
   - `description: baseline sistema saude`
   - `success: true`

✅ **PRONTO!**

---

## 📋 Opção 2: Usando Linha de Comando (psql)

1. **Abrir terminal/cmd**

2. **Executar:**

```bash
cd C:\Users\okdur\IdeaProjects\SISTEMA2\backend

"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d saude_db
```

3. **Digitar a senha quando solicitado:** `123456`

4. **Copiar e colar este SQL:**

```sql
INSERT INTO flyway_schema_history (
    installed_rank,
    version,
    description,
    type,
    script,
    checksum,
    installed_by,
    installed_on,
    execution_time,
    success
) VALUES (
    (SELECT COALESCE(MAX(installed_rank), 0) + 1 FROM flyway_schema_history),
    '999999999999',
    'baseline sistema saude',
    'SQL',
    'V999999999999__baseline_sistema_saude.sql',
    NULL,
    CURRENT_USER,
    NOW(),
    0,
    TRUE
) ON CONFLICT DO NOTHING;
```

5. **Verificar:**

```sql
SELECT version, description FROM flyway_schema_history WHERE version = '999999999999';
```

6. **Sair:** `\q`

✅ **PRONTO!**

---

## 📋 Opção 3: Usando Script (mais rápido)

1. **Abrir terminal/cmd**

2. **Executar:**

```bash
cd C:\Users\okdur\IdeaProjects\SISTEMA2\backend

"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d saude_db -f marcar_baseline_aplicada.sql
```

3. **Digitar senha:** `123456`

4. **Verificar mensagem de sucesso**

✅ **PRONTO!**

---

## 🚀 Depois de Marcar a Baseline

Após marcar a baseline, teste o startup:

```bash
cd C:\Users\okdur\IdeaProjects\SISTEMA2\backend

mvnw.cmd clean spring-boot:run
```

O sistema deve iniciar **SEM ERROS** de migration!

---

## ✅ Como Saber se Funcionou?

### Ao executar o SQL, você deve ver:

```
INSERT 0 1
```

ou

```
INSERT 0 0  (se já existia)
```

### Ao verificar (`SELECT`), você deve ver:

```
   version    |      description
--------------+------------------------
 999999999999 | baseline sistema saude
```

### Ao rodar o Spring Boot, você deve ver:

```
Started BackendApplication in X seconds
```

**Sem erros de migration!**

---

## ❌ Troubleshooting

### Erro: "relation flyway_schema_history does not exist"

**Causa:** Banco vazio, Flyway ainda não rodou.

**Solução:** Apenas rode `mvnw.cmd spring-boot:run` - o Flyway vai criar tudo automaticamente.

---

### Erro: "password authentication failed"

**Causa:** Senha incorreta.

**Solução:** Verifique a senha do PostgreSQL (padrão: `123456`)

---

### Erro: "connection refused"

**Causa:** PostgreSQL não está rodando.

**Solução:** Inicie o PostgreSQL:
- Windows: Abra Services e inicie "postgresql-x64-17"
- Ou: `net start postgresql-x64-17`

---

## 📞 Precisa de Ajuda?

Se tiver algum problema:

1. Verifique se o PostgreSQL está rodando
2. Verifique se o banco `saude_db` existe
3. Verifique a senha (padrão: 123456)
4. Tente usar o pgAdmin (Opção 1) - é mais fácil!

---

**Criado em:** 2025-11-15
**Versão:** 1.0
