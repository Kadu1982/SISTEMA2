# 🚀 Passo a Passo - Corrigir Banco de Dados

## ⚡ Solução Rápida (Recomendada)

### 1️⃣ Recriar Banco no PgAdmin

1. **Abra o PgAdmin 4**

2. **Conecte ao servidor PostgreSQL**
   - Servidor: localhost
   - Usuário: postgres
   - Senha: 123456

3. **Abra o Query Tool**
   - Clique com botão direito em "PostgreSQL 17" (ou sua versão)
   - Selecione: **"Query Tool"**

4. **Execute o script de recriação**
   - Abra o arquivo: `EXECUTAR-NO-PGADMIN.sql`
   - Copie TODO o conteúdo
   - Cole no Query Tool do PgAdmin
   - Clique no botão ▶ (Execute/Refresh) ou pressione **F5**

5. **Verifique o resultado**
   - Deve aparecer a mensagem: "Banco de dados sistema_saude recriado com sucesso!"

### 2️⃣ Executar a Aplicação

Após recriar o banco, execute a aplicação:

```batch
cd C:\Users\okdur\Desktop\sistema2\backend
mvnw.cmd spring-boot:run
```

Ou use o script que criamos:

```batch
cd C:\Users\okdur\Desktop\sistema2\backend
start-dev.cmd
```

### 3️⃣ Verificar Sucesso

A aplicação deve iniciar sem erros. Você verá mensagens como:

```
✅ Flyway: Successfully applied X migrations
✅ Tomcat started on port 8080
✅ Started BackendApplication
```

---

## 🔍 O Que Foi Corrigido?

### Problema Original

```
ERRO: relação "triagens" não existe
Onde: comando SQL "ALTER TABLE triagens ADD COLUMN..."
```

### Causa

O Flyway executava as migrations em ordem alfabética, causando:

1. ❌ `V20250910` tentava modificar `triagens` (tabela não existia ainda)
2. ✅ `V20250125_0001` criava a tabela `triagens` (tarde demais)

### Solução Aplicada

Modifiquei `V20250910__ajustes_triagens_alinhar_com_entidade.sql` para:

✅ Verificar se a tabela existe antes de modificar
✅ Usar `IF NOT EXISTS` em todas as operações
✅ Ser completamente **idempotente**

---

## 🛠️ Solução Alternativa (Se a primeira não funcionar)

### Opção A: Limpar Histórico do Flyway

Execute no PgAdmin (conectado ao banco `sistema_saude`):

```sql
-- Limpar histórico de migrations com falha
DELETE FROM flyway_schema_history
WHERE success = false;

-- Marcar migration problemática como reparada
UPDATE flyway_schema_history
SET success = true
WHERE version = '20250910';
```

Depois execute a aplicação novamente.

### Opção B: Recriar apenas a tabela triagens

Execute no PgAdmin (conectado ao banco `sistema_saude`):

```sql
-- Dropar tabela se existir
DROP TABLE IF EXISTS triagens CASCADE;

-- Recriar tabela com TODAS as colunas necessárias
CREATE TABLE triagens (
    id BIGSERIAL PRIMARY KEY,
    agendamento_id BIGINT NOT NULL,
    paciente_id BIGINT NOT NULL,
    profissional_id BIGINT,

    -- Datas
    data_triagem TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_referencia_atendimento DATE,
    data_criacao TIMESTAMP DEFAULT now(),
    data_atualizacao TIMESTAMP,

    -- Sinais Vitais
    pressao_arterial VARCHAR(20),
    temperatura DOUBLE PRECISION,
    peso DOUBLE PRECISION,
    altura DOUBLE PRECISION,
    frequencia_cardiaca INTEGER,
    frequencia_respiratoria INTEGER,
    saturacao_oxigenio INTEGER,
    escala_dor INTEGER,

    -- Dados Clínicos
    queixa_principal TEXT,
    motivo_consulta VARCHAR(50),
    classificacao_risco VARCHAR(20),
    classificacao_original VARCHAR(20),
    protocolo_aplicado VARCHAR(255),
    conduta_sugerida TEXT,
    diagnosticos_sugeridos TEXT,
    observacoes TEXT,
    alergias TEXT,

    -- Saúde da Mulher
    dum_informada DATE,
    gestante_informado BOOLEAN DEFAULT FALSE,
    semanas_gestacao_informadas INTEGER,

    -- Flags
    is_upa_triagem BOOLEAN DEFAULT FALSE,
    cancelada BOOLEAN DEFAULT FALSE,

    -- Foreign Keys
    CONSTRAINT fk_triagem_agendamento FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id),
    CONSTRAINT fk_triagem_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);

-- Índices
CREATE INDEX idx_triagens_paciente_id ON triagens(paciente_id);
CREATE INDEX idx_triagens_profissional_id ON triagens(profissional_id);
CREATE INDEX idx_triagens_classificacao_risco ON triagens(classificacao_risco);
CREATE INDEX idx_triagens_data_triagem ON triagens(data_triagem);
```

---

## 📊 Verificação Final

Execute no PgAdmin para confirmar que está tudo OK:

```sql
-- 1. Verificar se o banco existe
SELECT datname FROM pg_database WHERE datname = 'sistema_saude';

-- 2. Conectar ao banco sistema_saude, depois verificar tabelas
\c sistema_saude

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. Verificar estrutura da tabela triagens
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'triagens'
ORDER BY ordinal_position;

-- 4. Verificar histórico de migrations
SELECT version, description, installed_on, success
FROM flyway_schema_history
ORDER BY installed_rank;
```

---

## ❓ Precisa de Ajuda?

Se ainda houver problemas:

1. **Copie o log completo do erro**
2. **Execute a query de verificação acima**
3. **Me envie os resultados**

Estou aqui para ajudar! 🚀
