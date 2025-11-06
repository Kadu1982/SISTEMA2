# 📋 Regras de Login dos Operadores - Sistema de Saúde

## 🔐 Processo de Autenticação

### 1. Autenticação Login/Senha
- **Autenticação via Spring Security** (`AuthenticationManager`)
- Validação de credenciais (login e senha) contra o banco de dados
- Se inválidos, lança exceção de autenticação

### 2. Validação de Operador
- Operador deve **existir** no banco de dados
- Operador deve estar **ativo** (`ativo = true`)
- Se não encontrado, lança `UsernameNotFoundException`

### 3. Validação de Horários de Acesso ⏰
- **Validador:** `AcessoValidator.validarJanelaDeLogin()`
- **Regra Master:** Operadores com `isMaster = true` **IGNORAM** todas as restrições de horário
- **Sem regras:** Se operador não tiver horários definidos, **permite acesso** (sem restrição)
- **Com regras:** Valida apenas horários **GLOBAIS** (sem unidade) no momento do login
  - Considera o dia da semana atual
  - Verifica se o horário atual está dentro da janela permitida
  - Se fora do horário permitido, lança `AccessDeniedException`

### 4. Verificação de Termo de Uso 📄
- **Validador:** `TermoUsoService.isTermoObrigatorioENaoAceito()`
- **Status Atual:** Sempre retorna `false` (termo não obrigatório)
- **Comportamento Futuro:** Se obrigatório e não aceito:
  - Retorna flag `requiresTermAccept = true` no `LoginResponse`
  - Frontend redireciona para página de aceite do termo

### 5. Geração de Token JWT
- Após todas as validações, gera token JWT
- Token inclui informações do operador e perfis
- Token é retornado no `LoginResponse`

---

## 🎯 Operador Master (admin.master)

### Características Especiais:
- **Login:** `admin.master`
- **Senha:** `Admin@123` (hash bcrypt)
- **isMaster:** `true`
- **Privilégios:**
  - ✅ Ignora todas as restrições de horário
  - ✅ Ignora restrições de unidade
  - ✅ Acesso total ao sistema
  - ✅ Perfil `ADMINISTRADOR_SISTEMA`

### ⚠️ IMPORTANTE:
- **NÃO alterar** o login do operador master
- **NÃO alterar** as credenciais `admin.master`
- Este operador é essencial para administração do sistema

---

## 📝 Regras de Criação de Operadores (Módulo Configurações)

### Campos Obrigatórios:
1. **Nome:** Mínimo 3 caracteres
2. **Login:** Mínimo 4 caracteres, único no sistema
3. **Senha:** Mínimo 6 caracteres
4. **CPF:** 11 caracteres, único no sistema
5. **Email:** Formato válido (se fornecido)

### Regras de Negócio:
1. **Perfis:** Deve selecionar **pelo menos 1 perfil**
2. **Unidades:** Deve selecionar **pelo menos 1 unidade de saúde**
3. **Unidade Principal:** Deve definir **1 unidade principal**

### Processo de Criação:
1. Criar operador com dados básicos e unidade principal
2. Adicionar perfis ao operador (via endpoint `/api/operadores/{id}/perfis`)
3. Adicionar todas as unidades selecionadas (incluindo a principal)

---

## 🔍 Fluxo Completo de Login

```
1. Usuário insere login/senha
   ↓
2. AuthenticationManager valida credenciais
   ↓
3. Carrega Operador do banco
   ↓
4. Verifica se operador está ativo
   ↓
5. Valida Horários de Acesso (se não for master)
   ↓
6. Verifica Termo de Uso obrigatório
   ↓
7. Gera token JWT
   ↓
8. Retorna LoginResponse com token e dados do operador
   ↓
9. Frontend armazena token e redireciona conforme perfil
```

---

## 🚫 Casos de Bloqueio

### Login Bloqueado Quando:
- ❌ Credenciais inválidas (login/senha incorretos)
- ❌ Operador não encontrado
- ❌ Operador inativo (`ativo = false`)
- ❌ Fora do horário permitido (exceto master)
- ❌ Termo de uso obrigatório não aceito (quando implementado)

---

## 📊 Estrutura de Dados

### Operador Entity:
- `id`: Long (PK)
- `login`: String (único, obrigatório)
- `senha`: String (hash bcrypt, obrigatório)
- `nome`: String (obrigatório)
- `cpf`: String (único)
- `email`: String (único)
- `ativo`: Boolean (default: true)
- `isMaster`: Boolean (default: false)
- `perfis`: List<String> (roles do sistema)

### LoginResponse:
- `token`: String (JWT)
- `operador`: OperadorDTO
- `requiresTermAccept`: Boolean (opcional)

---

## 🔗 Endpoints Relacionados

- `POST /api/auth/login` - Autenticação
- `POST /api/operadores` - Criar operador
- `PUT /api/operadores/{id}/perfis` - Adicionar perfis
- `PUT /api/operadores/{id}/unidades` - Adicionar unidades

