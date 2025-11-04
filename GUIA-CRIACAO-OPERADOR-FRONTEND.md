# 🎯 Guia: Criar Operador pelo Frontend com Acesso ao Módulo UPA

## 📋 Pré-requisitos

Antes de criar um operador, **certifique-se que os perfis existem na tabela `perfis`** com os módulos configurados.

### ✅ Perfis Disponíveis (já criados):

| Perfil | Módulos | Permissões |
|--------|---------|------------|
| **UPA** | UPA | 10 permissões UPA |
| Enfermeiro UPA | UPA | 10 permissões |
| Médico UPA | UPA | - |
| Recepcionista UPA | UPA | - |
| UPA_RECEPCIONISTA | AGENDAMENTO, RECEPCAO, UPA | - |
| Dentista | - | - |

---

## 🚀 Passo a Passo: Criar Operador via Frontend

### 1️⃣ Acessar Configurações > Operadores

1. Faça login como **admin.master** / **Admin@123**
2. Acesse: **Configurações** (menu lateral)
3. Clique em: **Operadores**

### 2️⃣ Criar Novo Operador (se ainda não existe interface)

**⚠️ PROBLEMA IDENTIFICADO:** A tela atual NÃO tem botão "Criar Novo Operador", apenas permite **editar** operadores existentes.

**Solução temporária:** Criar operador via SQL ou implementar botão de criação.

### 3️⃣ Editar Operador Existente

1. Na lista de operadores, clique em **Editar** (ícone de lápis) no operador desejado
2. Um drawer lateral abrirá com 9 abas:
   - **OPERADOR** - Dados básicos (nome, email, ativo)
   - **CONFIG** - Configurações adicionais (placeholder)
   - **RESTRICOES** - Restrições de acesso (JSON)
   - **SETORES** - Setores permitidos (IDs)
   - **LOCAIS** - Locais de atendimento (IDs)
   - **HORARIOS** - Horários de acesso (JSON)
   - **MODULOS** - Módulos liberados ⚠️
   - **PERFIS** - Perfis do operador ✅
   - **AUTH** - Autenticação (placeholder)

### 4️⃣ Adicionar Perfil "UPA"

1. Clique na aba **PERFIS**
2. No campo de texto, digite: **UPA**
3. Clique em **Adicionar**
4. Clique em **Salvar**

✅ O perfil "UPA" será adicionado à tabela `operador_perfis`

### 5️⃣ Verificar Módulos (Opcional)

1. Clique na aba **MODULOS**
2. Verifique se "UPA" aparece na lista
3. Se não aparecer, adicione manualmente: **UPA**
4. Clique em **Salvar**

⚠️ **IMPORTANTE:** A aba MODULOS adiciona à uma tabela diferente, não é a mesma coisa que perfis!

---

## ⚠️ Problemas Identificados no Fluxo Atual

### 1. **Aba PERFIS vs Tabela perfis**

**Problema:** Quando você adiciona um perfil pela aba PERFIS, o sistema apenas insere a string na tabela `operador_perfis`, mas **não verifica se o perfil existe na tabela `perfis`** com módulos configurados.

**Exemplo:**
```typescript
// Frontend envia:
perfis: ["UPA", "Médico UPA"]

// Backend salva em operador_perfis:
INSERT INTO operador_perfis (operador_id, perfil) VALUES (9, 'UPA');
INSERT INTO operador_perfis (operador_id, perfil) VALUES (9, 'Médico UPA');

// Mas se o perfil não existir na tabela perfis:
SELECT * FROM perfis WHERE tipo = 'UPA'; -- ❌ Pode retornar vazio!
```

**Resultado:** O operador terá o perfil na lista, mas **sem módulos e sem permissões**.

### 2. **Aba MODULOS é Redundante**

A aba MODULOS permite adicionar módulos diretamente ao operador, mas isso **não é o padrão do sistema**. Os módulos devem vir dos perfis!

### 3. **Falta Botão "Criar Novo Operador"**

A tela só permite editar operadores existentes. Não há interface para criar um novo operador do zero.

---

## ✅ Solução Recomendada

### Opção 1: Usar Perfis Pré-configurados (RECOMENDADO)

1. **Sempre use os perfis que já existem na tabela `perfis`:**
   - UPA
   - Enfermeiro UPA
   - Médico UPA
   - Recepcionista UPA
   - UPA_RECEPCIONISTA

2. **Esses perfis já têm módulos e permissões configurados**

### Opção 2: Criar Perfil Antes de Usar

Se você precisa de um novo perfil:

1. **Primeiro, crie o perfil na tabela `perfis`:**
   ```sql
   INSERT INTO perfis (tipo, nome, ativo, sistema_perfil, nome_customizado)
   VALUES ('MEU_PERFIL', 'Meu Perfil', TRUE, FALSE, 'Meu Perfil Customizado');
   ```

2. **Adicione módulos ao perfil:**
   ```sql
   INSERT INTO perfil_acesso_modulos (perfil_id, modulo)
   SELECT id, 'UPA' FROM perfis WHERE tipo = 'MEU_PERFIL';
   ```

3. **Adicione permissões:**
   ```sql
   INSERT INTO perfil_acesso_permissoes (perfil_id, permissao)
   SELECT id, 'UPA_ACESSAR' FROM perfis WHERE tipo = 'MEU_PERFIL';
   ```

4. **Depois, adicione o perfil ao operador via frontend:**
   - Vá na aba PERFIS
   - Digite: MEU_PERFIL
   - Salve

---

## 🎯 Checklist: Criar Operador com Acesso UPA

- [ ] **Passo 1:** Verificar se perfil "UPA" existe na tabela `perfis`
  ```sql
  SELECT * FROM perfis WHERE tipo = 'UPA';
  ```
  - Se não existir, execute: `corrigir-perfis-teste-operador.sql`

- [ ] **Passo 2:** Acessar Configurações > Operadores (como admin.master)

- [ ] **Passo 3:** Editar o operador desejado

- [ ] **Passo 4:** Aba PERFIS > Adicionar "UPA" > Salvar

- [ ] **Passo 5:** Fazer logout e login com o operador

- [ ] **Passo 6:** Verificar se menu lateral mostra item "UPA"

- [ ] **Passo 7:** Clicar em UPA e verificar se página carrega

---

## 🔧 Melhorias Sugeridas para o Frontend

### 1. Validar Perfis Antes de Salvar

```typescript
// Antes de salvar perfis, verificar se existem:
const perfisValidos = await verificarPerfisExistem(perfis);
if (perfisValidos.length < perfis.length) {
  alert("Alguns perfis não existem no sistema!");
}
```

### 2. Dropdown de Perfis Disponíveis

Ao invés de campo de texto livre, mostrar um dropdown com perfis disponíveis:

```typescript
const perfisDisponiveis = await buscarPerfisDisponiveis();
// Mostrar SELECT com perfisDisponiveis
```

### 3. Mostrar Módulos do Perfil

Quando adicionar um perfil, mostrar quais módulos ele dá acesso:

```
✅ Perfil: UPA
   Módulos: UPA
   Permissões: 10
```

### 4. Botão "Criar Novo Operador"

Adicionar botão na listagem:
```tsx
<Button onClick={() => abrirCriacao()}>
  <Plus /> Novo Operador
</Button>
```

---

## 📊 Estrutura de Dados

### Tabela: `perfis`
```sql
CREATE TABLE perfis (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(255) NOT NULL,      -- Código do perfil (ex: "UPA")
    nome VARCHAR(255) NOT NULL,       -- Nome para exibição
    ativo BOOLEAN DEFAULT TRUE,
    sistema_perfil BOOLEAN DEFAULT FALSE,
    nome_customizado VARCHAR(255)
);
```

### Tabela: `operador_perfis`
```sql
CREATE TABLE operador_perfis (
    operador_id BIGINT NOT NULL,
    perfil VARCHAR(255) NOT NULL,     -- Código do perfil (STRING, não FK!)
    PRIMARY KEY (operador_id, perfil)
);
```

### Tabela: `perfil_acesso_modulos`
```sql
CREATE TABLE perfil_acesso_modulos (
    perfil_id BIGINT NOT NULL,        -- FK para perfis(id)
    modulo VARCHAR(255) NOT NULL,
    PRIMARY KEY (perfil_id, modulo)
);
```

**⚠️ IMPORTANTE:** `operador_perfis.perfil` é VARCHAR e deve corresponder a `perfis.tipo`!

---

## 🎯 Resumo Executivo

### ✅ O que funciona:
1. Adicionar perfis via aba PERFIS
2. Perfis são salvos em `operador_perfis`
3. Backend retorna perfis no login (array de strings)
4. Frontend verifica perfis para mostrar menu

### ⚠️ O que precisa atenção:
1. **Perfis devem existir na tabela `perfis`** antes de serem usados
2. **Módulos vêm dos perfis**, não são diretos do operador
3. **Sempre use perfis pré-configurados** (UPA, Enfermeiro UPA, etc.)
4. **Reinicie o backend** após criar novos perfis
5. **Faça logout/login** para recarregar perfis do operador

### 🎯 Fluxo Ideal:
```
1. Admin cria perfil na tabela perfis (com módulos)
   ↓
2. Admin adiciona perfil ao operador via frontend (aba PERFIS)
   ↓
3. Operador faz logout/login
   ↓
4. Menu aparece com módulos do perfil
```
