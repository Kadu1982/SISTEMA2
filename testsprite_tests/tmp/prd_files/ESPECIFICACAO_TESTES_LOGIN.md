# 📋 Especificação Técnica - Testes de Login e Gestão de Operadores

## 📌 Visão Geral

Este documento detalha a especificação técnica para testes automatizados do módulo de **Login** e **Gestão de Operadores** do Sistema de Saúde.

---

## 🎯 Objetivos dos Testes

1. Validar o processo completo de autenticação de operadores
2. Verificar controle de acesso baseado em horários
3. Garantir proteção do operador master (admin.master)
4. Validar criação e edição de operadores
5. Verificar validações de campos e regras de negócio

---

## 🔧 Arquitetura Técnica

### Backend
- **Framework:** Spring Boot 3.2.5
- **Linguagem:** Java 17
- **Autenticação:** Spring Security + JWT
- **Banco de Dados:** PostgreSQL
- **ORM:** Spring Data JPA
- **Migrations:** Flyway

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Roteamento:** React Router 7
- **State Management:** TanStack Query
- **Forms:** React Hook Form + Zod
- **UI:** Radix UI + Tailwind CSS

### Endpoints Testados
```
POST /api/auth/login
GET  /api/operadores
POST /api/operadores
PUT  /api/operadores/{id}
PUT  /api/operadores/{id}/perfis
PUT  /api/operadores/{id}/unidades
DELETE /api/operadores/{id}
```

---

## 🧪 Casos de Teste Detalhados

### Suite 1: Testes de Autenticação

#### TC-001: Login com Operador Master
**Prioridade:** Alta  
**Tipo:** Funcional - Positivo

**Pré-condições:**
- Banco de dados inicializado com operador master
- Operador master: `login = admin.master`, `senha = Admin@123`
- `isMaster = true`, `ativo = true`

**Dados de Entrada:**
```json
{
  "login": "admin.master",
  "senha": "Admin@123"
}
```

**Passos:**
1. Acessar `/login`
2. Preencher campo "Login" com `admin.master`
3. Preencher campo "Senha" com `Admin@123`
4. Clicar no botão "Entrar"

**Resultado Esperado:**
- HTTP 200 OK
- Response contém:
  ```json
  {
    "token": "<JWT_TOKEN>",
    "operador": {
      "id": 1,
      "login": "admin.master",
      "nome": "Administrador Master",
      "isMaster": true,
      "ativo": true,
      "perfis": ["ADMINISTRADOR_SISTEMA"]
    }
  }
  ```
- Token JWT válido com claims do operador
- Redirecionamento para `/dashboard`
- Token armazenado no localStorage/sessionStorage

**Validações:**
- ✅ Token JWT presente e válido
- ✅ Operador tem perfil `ADMINISTRADOR_SISTEMA`
- ✅ Flag `isMaster = true`
- ✅ Operador pode acessar em qualquer horário

---

#### TC-002: Login com Operador Normal (Sem Horários)
**Prioridade:** Alta  
**Tipo:** Funcional - Positivo

**Pré-condições:**
- Operador criado sem horários de acesso definidos
- `ativo = true`, `isMaster = false`

**Dados de Entrada:**
```json
{
  "login": "operador.teste",
  "senha": "Teste@123"
}
```

**Resultado Esperado:**
- HTTP 200 OK
- Login bem-sucedido
- Operador pode fazer login em qualquer horário
- Redirecionamento conforme perfil

---

#### TC-003: Login com Horários Definidos - Dentro do Horário
**Prioridade:** Alta  
**Tipo:** Funcional - Positivo

**Pré-condições:**
- Operador com horário: Seg-Sex, 08:00-18:00
- Teste executado dentro do horário permitido
- `ativo = true`, `isMaster = false`

**Resultado Esperado:**
- HTTP 200 OK
- Login bem-sucedido
- Acesso permitido

---

#### TC-004: Login com Horários Definidos - Fora do Horário
**Prioridade:** Alta  
**Tipo:** Funcional - Negativo

**Pré-condições:**
- Operador com horário: Seg-Sex, 08:00-18:00
- Teste executado FORA do horário (ex: 20:00 ou sábado)
- `ativo = true`, `isMaster = false`

**Resultado Esperado:**
- HTTP 403 Forbidden
- Response:
  ```json
  {
    "error": "AccessDeniedException",
    "message": "Acesso fora do horário permitido para este operador"
  }
  ```
- Login bloqueado
- Mensagem de erro exibida no frontend
- Token JWT NÃO gerado

---

#### TC-005: Login com Operador Inativo
**Prioridade:** Alta  
**Tipo:** Funcional - Negativo

**Pré-condições:**
- Operador existe no banco
- `ativo = false`

**Resultado Esperado:**
- HTTP 401 Unauthorized
- Login bloqueado
- Mensagem: "Conta desabilitada"

---

#### TC-006: Login com Credenciais Inválidas
**Prioridade:** Alta  
**Tipo:** Funcional - Negativo

**Dados de Entrada:**
```json
{
  "login": "operador.inexistente",
  "senha": "senha_errada"
}
```

**Resultado Esperado:**
- HTTP 401 Unauthorized
- Mensagem: "Credenciais inválidas"
- Token NÃO gerado

---

#### TC-007: Operador Master Ignora Restrições
**Prioridade:** Alta  
**Tipo:** Funcional - Regra de Negócio

**Pré-condições:**
- Operador master com horários definidos (ex: Seg-Qui, 09:00-17:00)
- Teste executado FORA do horário definido
- `isMaster = true`

**Resultado Esperado:**
- HTTP 200 OK
- Login bem-sucedido mesmo fora do horário
- Validação `AcessoValidator.validarJanelaDeLogin()` retorna imediatamente para master
- Acesso irrestrito

---

### Suite 2: Testes de Criação de Operadores

#### TC-008: Criar Operador com Dados Válidos
**Prioridade:** Alta  
**Tipo:** Funcional - Positivo

**Pré-condições:**
- Usuário logado como `admin.master`
- Pelo menos 1 perfil disponível
- Pelo menos 1 unidade de saúde disponível

**Dados de Entrada:**
```json
{
  "nome": "Operador Teste",
  "login": "operador.teste",
  "senha": "Teste@123",
  "cpf": "12345678901",
  "email": "operador.teste@teste.com",
  "ativo": true,
  "perfis": ["UPA"],
  "unidades": [1, 2],
  "unidadePrincipalId": 1
}
```

**Passos:**
1. Acessar `/configuracoes/operadores`
2. Clicar em "Novo Operador"
3. Preencher todos os campos obrigatórios
4. Selecionar perfil "UPA"
5. Selecionar unidades 1 e 2
6. Definir unidade 1 como principal
7. Clicar em "Salvar"

**Resultado Esperado:**
- HTTP 201 Created
- Operador criado no banco com ID gerado
- Perfis vinculados corretamente
- Unidades vinculadas corretamente
- Unidade principal definida
- Mensagem de sucesso exibida
- Operador aparece na lista

**Validações SQL:**
```sql
SELECT * FROM operadores WHERE login = 'operador.teste';
SELECT * FROM operador_perfis WHERE operador_id = <novo_id>;
SELECT * FROM operador_unidades WHERE operador_id = <novo_id>;
```

---

#### TC-009: Validação de Campos Obrigatórios
**Prioridade:** Alta  
**Tipo:** Funcional - Validação

**Cenários de Teste:**

| Campo | Valor Inválido | Mensagem Esperada |
|-------|----------------|-------------------|
| nome | "" | "O nome deve ter pelo menos 3 caracteres" |
| nome | "AB" | "O nome deve ter pelo menos 3 caracteres" |
| login | "" | "O login deve ter pelo menos 4 caracteres" |
| login | "ABC" | "O login deve ter pelo menos 4 caracteres" |
| senha | "" | "A senha deve ter pelo menos 6 caracteres" |
| senha | "12345" | "A senha deve ter pelo menos 6 caracteres" |
| cpf | "" | "CPF é obrigatório (11 caracteres)" |
| cpf | "123" | "CPF deve ter 11 caracteres" |
| perfis | [] | "Selecione pelo menos um perfil" |
| unidades | [] | "Selecione pelo menos uma unidade de saúde" |
| unidadePrincipalId | null | "Defina uma unidade principal" |

**Resultado Esperado:**
- HTTP 400 Bad Request (backend) ou validação no frontend
- Mensagens de erro exibidas para cada campo
- Formulário não é enviado até correção

---

#### TC-010: Login Duplicado
**Prioridade:** Alta  
**Tipo:** Funcional - Constraint

**Pré-condições:**
- Operador com login "operador.teste" já existe

**Dados de Entrada:**
```json
{
  "nome": "Outro Operador",
  "login": "operador.teste",  // Login duplicado
  "senha": "Teste@456",
  "cpf": "98765432100",
  "email": "outro@teste.com"
}
```

**Resultado Esperado:**
- HTTP 409 Conflict ou 400 Bad Request
- Mensagem: "Login já existe no sistema"
- Operador NÃO criado
- Constraint de unicidade do banco respeitada

---

#### TC-011: CPF Duplicado
**Prioridade:** Alta  
**Tipo:** Funcional - Constraint

**Resultado Esperado:**
- HTTP 409 Conflict
- Mensagem: "CPF já cadastrado"
- Constraint violation

---

#### TC-012: Email Duplicado
**Prioridade:** Alta  
**Tipo:** Funcional - Constraint

**Resultado Esperado:**
- HTTP 409 Conflict
- Mensagem: "Email já cadastrado"

---

#### TC-013: Múltiplos Perfis
**Prioridade:** Média  
**Tipo:** Funcional - Positivo

**Dados de Entrada:**
```json
{
  "perfis": ["UPA", "RECEPCIONISTA_UPA", "ENFERMEIRO"]
}
```

**Resultado Esperado:**
- Operador criado com sucesso
- Todos os 3 perfis vinculados
- Query SQL retorna 3 registros em `operador_perfis`

---

#### TC-014: Múltiplas Unidades
**Prioridade:** Média  
**Tipo:** Funcional - Positivo

**Dados de Entrada:**
```json
{
  "unidades": [1, 2, 3, 4],
  "unidadePrincipalId": 2
}
```

**Resultado Esperado:**
- Operador criado com sucesso
- 4 unidades vinculadas
- Unidade 2 marcada como principal

---

#### TC-015: Proteção do Operador Master
**Prioridade:** Crítica  
**Tipo:** Segurança

**Cenários:**
1. Tentar criar operador com login "admin.master"
2. Tentar alterar senha do admin.master
3. Tentar desativar admin.master
4. Tentar remover perfil ADMINISTRADOR_SISTEMA do master

**Resultado Esperado:**
- Operações bloqueadas
- HTTP 403 Forbidden ou 400 Bad Request
- Mensagem: "Operador master não pode ser alterado"
- `isMaster = true` permanece inalterado

---

## 🔍 Matriz de Rastreabilidade

| ID | Requisito | Casos de Teste |
|----|-----------|----------------|
| REQ-001 | Autenticação JWT | TC-001 a TC-007 |
| REQ-002 | Controle de Horários | TC-003, TC-004, TC-007 |
| REQ-003 | Operador Master | TC-001, TC-007, TC-015 |
| REQ-004 | Criação de Operadores | TC-008 a TC-014 |
| REQ-005 | Validações de Campos | TC-009 |
| REQ-006 | Unicidade de Dados | TC-010, TC-011, TC-012 |

---

## 🎭 Personas de Teste

### Operador Master
- **Login:** admin.master
- **Senha:** Admin@123
- **Perfis:** ADMINISTRADOR_SISTEMA
- **Características:** Acesso irrestrito, ignora horários

### Operador Normal
- **Login:** operador.teste
- **Senha:** Teste@123
- **Perfis:** UPA
- **Características:** Sujeito a horários (se definidos)

### Operador Inativo
- **Login:** operador.inativo
- **Ativo:** false
- **Características:** Não pode fazer login

---

## 📊 Métricas de Qualidade

### Critérios de Aceitação
- ✅ 100% dos casos críticos passando
- ✅ 95% de cobertura de código nos módulos testados
- ✅ Tempo de resposta < 2s para login
- ✅ Tempo de resposta < 3s para criação de operador

### KPIs
- **Taxa de Sucesso:** > 95%
- **Cobertura de Testes:** > 80%
- **Bugs Críticos:** 0
- **Performance:** 100% dos requests < 3s

---

## 🔐 Considerações de Segurança

1. **Senhas:**
   - Armazenadas com BCrypt
   - Mínimo 6 caracteres
   - Nunca retornadas em responses

2. **JWT:**
   - Expira em 24h
   - Assinado com chave secreta
   - Contém apenas dados não-sensíveis

3. **Proteção Master:**
   - Login "admin.master" não pode ser alterado
   - isMaster não pode ser modificado via API
   - Garantido por validações no backend

4. **Rate Limiting:**
   - Máximo 5 tentativas de login por minuto
   - Bloqueio temporário após 5 falhas

---

## 🧪 Ambiente de Testes

### Configuração Backend
```properties
spring.profiles.active=test
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/saude_test
```

### Configuração Frontend
```env
VITE_API_URL=http://localhost:8080
VITE_ENV=test
```

### Dados de Seed
```sql
-- Operador Master (sempre presente)
INSERT INTO operadores (login, senha, nome, ativo, is_master) 
VALUES ('admin.master', '$2a$10$...', 'Administrador Master', true, true);

-- Perfis necessários
INSERT INTO perfis_acesso (nome, descricao) 
VALUES ('ADMINISTRADOR_SISTEMA', 'Administrador do Sistema');
```

---

## 📝 Checklist de Execução

- [ ] Backend rodando na porta 8080
- [ ] Frontend rodando na porta 5173
- [ ] Banco de dados PostgreSQL ativo
- [ ] Migrations executadas (Flyway)
- [ ] Seeds de teste carregados
- [ ] Operador master presente
- [ ] Perfis e unidades de teste criados
- [ ] Logs habilitados para debug

---

## 🐛 Bugs Conhecidos

*Nenhum bug conhecido no momento da especificação*

---

## 📚 Referências

- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JWT.io](https://jwt.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)

