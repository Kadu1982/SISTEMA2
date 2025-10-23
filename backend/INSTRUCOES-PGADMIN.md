# 🎯 Instruções para PgAdmin (Passo a Passo Visual)

## ⚠️ IMPORTANTE
No PgAdmin, você precisa executar **cada bloco separadamente**, não tudo de uma vez!

---

## 📋 Passo a Passo

### 1️⃣ **Abrir Query Tool**
- No PgAdmin, clique com botão direito em **"PostgreSQL 17"** (o servidor, não o banco)
- Selecione **"Query Tool"**

### 2️⃣ **Abrir o arquivo SQL**
- Abra o arquivo `EXECUTAR-NO-PGADMIN.sql`
- Ou copie o conteúdo dele

### 3️⃣ **Executar BLOCO 1 - Encerrar Conexões**

**Selecione apenas estas linhas:**
```sql
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'sistema_saude'
  AND pid <> pg_backend_pid();
```

- Clique em **F5** ou no botão ▶
- Deve retornar algo como "1 row" ou "0 rows"

### 4️⃣ **Executar BLOCO 2 - Dropar Banco**

**Selecione apenas esta linha:**
```sql
DROP DATABASE IF EXISTS sistema_saude;
```

- Clique em **F5** ou no botão ▶
- Deve aparecer: "DROP DATABASE"

### 5️⃣ **Executar BLOCO 3 - Criar Banco**

**Selecione apenas estas linhas:**
```sql
CREATE DATABASE sistema_saude
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
```

- Clique em **F5** ou no botão ▶
- Deve aparecer: "CREATE DATABASE"

### 6️⃣ **Executar a Aplicação**

Abra o terminal/cmd e execute:

```batch
cd C:\Users\okdur\Desktop\sistema2\backend
mvnw.cmd spring-boot:run
```

---

## 🎬 GIF Visual (Como Selecionar)

```
┌─────────────────────────────────────┐
│ Query Tool                          │
├─────────────────────────────────────┤
│ 1  SELECT pg_terminate_backend...   │ ◄─ Selecione estas linhas
│ 2  FROM pg_stat_activity            │ ◄─ clicando e arrastando
│ 3  WHERE ...                        │ ◄─ depois pressione F5
│ 4                                   │
│ 5  DROP DATABASE IF EXISTS...       │ ◄─ Depois selecione só esta
│ 6                                   │    e pressione F5 novamente
│ 7  CREATE DATABASE sistema_saude    │ ◄─ Por fim, selecione estas
│ 8      WITH                         │    e pressione F5
│ 9      OWNER = postgres             │
└─────────────────────────────────────┘
```

---

## ❌ Erros Comuns

### Erro: "DROP DATABASE não pode ser executado dentro de um bloco de transação"

**Causa:** Você executou tudo de uma vez (F5 com tudo selecionado)

**Solução:** Execute **cada bloco separadamente** (selecionando apenas as linhas de cada bloco)

### Erro: "database is being accessed by other users"

**Causa:** Há conexões ativas ao banco

**Solução:**
1. Execute o BLOCO 1 primeiro (encerrar conexões)
2. Aguarde 2 segundos
3. Execute o BLOCO 2 (dropar banco)

---

## ✅ Verificação

Após executar os 3 blocos, você deve ver no painel esquerdo do PgAdmin:

```
📁 PostgreSQL 17
   📁 Databases
      📁 postgres
      📁 sistema_saude  ✅ (banco recriado)
```

Se ver `sistema_saude` na lista, está correto! Agora execute a aplicação.

---

## 🚀 Próximos Passos

Depois de recriar o banco:

1. Execute a aplicação: `mvnw.cmd spring-boot:run`
2. O Flyway aplicará automaticamente todas as migrations
3. Aguarde a mensagem: "Started BackendApplication"
4. Acesse: http://localhost:8080

---

## 💡 Dica

Se preferir, você pode criar 3 arquivos separados:

- `1-encerrar-conexoes.sql`
- `2-dropar-banco.sql`
- `3-criar-banco.sql`

E executar um de cada vez!
