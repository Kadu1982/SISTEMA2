# 🔧 Solução Alternativa - Usar Interface Gráfica do PgAdmin

Se os scripts SQL estão dando erro, use a **interface gráfica** do PgAdmin:

## 🖱️ Método 1: Usando Interface Gráfica (MAIS FÁCIL)

### Passo 1: Desconectar do Banco
1. No painel esquerdo do PgAdmin, localize `sistema_saude`
2. **Clique com botão direito** em `sistema_saude`
3. Selecione **"Disconnect Database"**

### Passo 2: Deletar o Banco
1. **Clique com botão direito** em `sistema_saude` novamente
2. Selecione **"Delete/Drop"**
3. Confirme clicando em **"Yes"**

### Passo 3: Criar Banco Novo
1. **Clique com botão direito** em **"Databases"**
2. Selecione **"Create" → "Database..."**
3. Na aba **"General"**:
   - **Database:** `sistema_saude`
   - **Owner:** `postgres`
4. Na aba **"Definition"**:
   - **Encoding:** `UTF8`
   - **Collation:** (deixe padrão)
5. Clique em **"Save"**

---

## 💻 Método 2: Usando Terminal Windows (ALTERNATIVA)

Abra o **Prompt de Comando** (cmd) e execute:

```batch
cd C:\Users\okdur\Desktop\sistema2\backend
fix-database.bat
```

Se der erro, execute os comandos manualmente:

```batch
set PGPASSWORD=123456
psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS sistema_saude;"
psql -U postgres -d postgres -c "CREATE DATABASE sistema_saude;"
```

---

## 🚀 Método 3: Flyway Clean (ÚLTIMA OPÇÃO)

Se nenhum dos métodos acima funcionar, tente limpar usando Flyway:

```batch
cd C:\Users\okdur\Desktop\sistema2\backend

# Configurar variáveis
set SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/sistema_saude
set SPRING_DATASOURCE_USERNAME=postgres
set SPRING_DATASOURCE_PASSWORD=123456

# Limpar banco
./mvnw.cmd flyway:clean
```

**CUIDADO:** Flyway clean apaga **TODOS os dados**!

Depois execute a aplicação normalmente:
```batch
./mvnw.cmd spring-boot:run
```

---

## ✅ Após Recriar o Banco

Execute a aplicação:

```batch
cd C:\Users\okdur\Desktop\sistema2\backend
mvnw.cmd spring-boot:run
```

O Flyway aplicará automaticamente todas as migrations corrigidas!

---

## ❓ Ainda com Problemas?

Me envie uma captura de tela mostrando:
1. O painel esquerdo do PgAdmin (lista de bancos)
2. O erro completo que está aparecendo

Vou ajustar a solução conforme necessário! 🛠️
