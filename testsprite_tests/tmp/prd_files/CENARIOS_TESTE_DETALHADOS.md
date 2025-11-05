# 🎯 Cenários de Teste Detalhados - Login e Operadores

## 📋 Índice
1. [Suite de Autenticação](#suite-autenticacao)
2. [Suite de Gestão de Operadores](#suite-gestao)
3. [Suite de Segurança](#suite-seguranca)
4. [Suite de Performance](#suite-performance)

---

<a name="suite-autenticacao"></a>
## 🔐 Suite 1: Autenticação

### Cenário 1.1: Login Bem-Sucedido - Operador Master

**Given** (Dado que)
- O operador master existe no banco de dados
- O operador tem `login = "admin.master"`
- O operador tem `senha = "Admin@123"` (hash bcrypt)
- O operador está ativo (`ativo = true`)
- O operador tem `isMaster = true`

**When** (Quando)
- O usuário navega para `/login`
- O usuário preenche o campo "Login" com "admin.master"
- O usuário preenche o campo "Senha" com "Admin@123"
- O usuário clica no botão "Entrar"

**Then** (Então)
- O sistema valida as credenciais via Spring Security
- O sistema verifica que o operador está ativo
- O sistema IGNORA validação de horários (pois é master)
- O sistema gera um token JWT válido
- O sistema retorna HTTP 200 OK
- O sistema retorna um LoginResponse com:
  - `token`: JWT assinado
  - `operador.id`: 1
  - `operador.login`: "admin.master"
  - `operador.isMaster`: true
  - `operador.perfis`: ["ADMINISTRADOR_SISTEMA"]
- O frontend armazena o token no localStorage
- O frontend redireciona para `/dashboard`
- O token é incluído no header Authorization em requisições subsequentes

**Validações Técnicas:**
```javascript
// Frontend
expect(localStorage.getItem('token')).toBeTruthy()
expect(window.location.pathname).toBe('/dashboard')

// Backend
expect(response.status).toBe(200)
expect(response.data.token).toBeDefined()
expect(jwt.verify(response.data.token, SECRET_KEY)).toBeTruthy()
```

---

### Cenário 1.2: Login Bloqueado - Operador Fora do Horário

**Given** (Dado que)
- Existe um operador com `login = "operador.horario"`
- O operador tem horário definido: Segunda a Sexta, 08:00-18:00
- O operador NÃO é master (`isMaster = false`)
- O operador está ativo
- A hora atual é 20:00 (FORA do horário permitido)

**When** (Quando)
- O usuário tenta fazer login com "operador.horario"
- O usuário fornece a senha correta

**Then** (Então)
- O sistema valida as credenciais (OK)
- O sistema verifica que o operador está ativo (OK)
- O sistema chama `AcessoValidator.validarJanelaDeLogin(operador)`
- O validador identifica horário global (sem unidade)
- O validador verifica que 20:00 está FORA da janela 08:00-18:00
- O validador lança `AccessDeniedException`
- O sistema retorna HTTP 403 Forbidden
- O sistema retorna mensagem: "Acesso fora do horário permitido para este operador"
- O frontend exibe mensagem de erro
- Nenhum token JWT é gerado
- O usuário permanece na tela de login

**Validações Técnicas:**
```java
// Backend Test
@Test
void deveBloquearLoginForaDoHorario() {
    Operador op = operadorRepository.findByLogin("operador.horario");
    assertThrows(AccessDeniedException.class, () -> {
        acessoValidator.validarJanelaDeLogin(op);
    });
}
```

---

### Cenário 1.3: Login Master Ignora Horários

**Given** (Dado que)
- O operador master tem horários definidos: Segunda a Quinta, 09:00-17:00
- O operador tem `isMaster = true`
- A hora atual é Sexta-feira, 22:00 (completamente FORA do horário)

**When** (Quando)
- O admin.master tenta fazer login

**Then** (Então)
- O sistema valida credenciais (OK)
- O sistema verifica operador ativo (OK)
- O sistema chama `AcessoValidator.validarJanelaDeLogin(operador)`
- O validador detecta `isMaster = true`
- O validador retorna IMEDIATAMENTE (linha 1 do método)
- Nenhuma validação de horário é executada
- Login bem-sucedido
- Token JWT gerado normalmente

**Código Relevante:**
```java
public void validarJanelaDeLogin(Operador operador) {
    if (operador.isMaster()) {
        return; // RETORNA IMEDIATAMENTE
    }
    // ... resto das validações
}
```

---

### Cenário 1.4: Login Bloqueado - Credenciais Inválidas

**Given** (Dado que)
- O usuário está na página de login

**When** (Quando)
- O usuário insere `login = "usuario.inexistente"`
- O usuário insere `senha = "senha_errada"`
- O usuário clica em "Entrar"

**Then** (Então)
- O sistema tenta autenticar via AuthenticationManager
- O AuthenticationManager lança `BadCredentialsException`
- O sistema retorna HTTP 401 Unauthorized
- O sistema retorna mensagem: "Credenciais inválidas"
- Nenhum token é gerado
- O frontend exibe erro de autenticação

---

### Cenário 1.5: Login Bloqueado - Operador Inativo

**Given** (Dado que)
- Existe operador com `login = "operador.inativo"`
- O operador tem senha correta (hash válido)
- O operador tem `ativo = false`

**When** (Quando)
- O usuário tenta login com credenciais corretas

**Then** (Então)
- O sistema valida senha (OK)
- O sistema carrega operador do banco
- O UserDetailsService detecta `enabled = false`
- O sistema lança `DisabledException`
- HTTP 401 Unauthorized
- Mensagem: "Conta desabilitada"

---

<a name="suite-gestao"></a>
## 👥 Suite 2: Gestão de Operadores

### Cenário 2.1: Criação Completa de Operador

**Given** (Dado que)
- O usuário está logado como admin.master
- Existe perfil "UPA" no sistema
- Existem unidades de saúde com IDs 1, 2, 3

**When** (Quando)
- O usuário navega para `/configuracoes/operadores`
- O usuário clica em "Novo Operador"
- O usuário preenche:
  - Nome: "João da Silva"
  - Login: "joao.silva"
  - Senha: "Senha@123"
  - CPF: "12345678901"
  - Email: "joao@exemplo.com"
- O usuário seleciona perfil "UPA"
- O usuário seleciona unidades 1, 2, 3
- O usuário define unidade 1 como principal
- O usuário clica em "Salvar"

**Then** (Então)
- O frontend faz POST `/api/operadores` com:
  ```json
  {
    "nome": "João da Silva",
    "login": "joao.silva",
    "senha": "Senha@123",
    "cpf": "12345678901",
    "email": "joao@exemplo.com",
    "ativo": true,
    "unidadePrincipalId": 1
  }
  ```
- O backend cria operador no banco
- O backend faz hash da senha com BCrypt
- O backend retorna operador criado com ID (ex: 10)
- O frontend faz PUT `/api/operadores/10/perfis` com `["UPA"]`
- O backend vincula perfil ao operador
- O frontend faz PUT `/api/operadores/10/unidades` com `[1, 2, 3]`
- O backend vincula todas as unidades
- Mensagem de sucesso exibida
- Operador aparece na listagem
- Todos os dados são persistidos corretamente

**Validações no Banco:**
```sql
-- Operador criado
SELECT * FROM operadores WHERE login = 'joao.silva';
-- Resultado: 1 linha, id=10, senha=hash bcrypt, ativo=true

-- Perfis vinculados
SELECT * FROM operador_perfis WHERE operador_id = 10;
-- Resultado: 1 linha, perfil='UPA'

-- Unidades vinculadas
SELECT * FROM operador_unidades WHERE operador_id = 10;
-- Resultado: 3 linhas (unidades 1, 2, 3)
```

---

### Cenário 2.2: Validação de Campo Nome

**Given** (Dado que)
- O usuário está no formulário de criação de operador

**When** (Quando)
- O usuário deixa o campo "Nome" vazio
- OU o usuário digita apenas "AB" (2 caracteres)
- O usuário tenta salvar

**Then** (Então)
- O frontend valida via Zod schema
- O frontend exibe erro: "O nome deve ter pelo menos 3 caracteres"
- O campo "Nome" é destacado em vermelho
- O botão "Salvar" permanece desabilitado (ou não envia)
- Nenhuma requisição é feita ao backend

**Zod Schema:**
```typescript
const schema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  // ...
});
```

---

### Cenário 2.3: Tentativa de Login Duplicado

**Given** (Dado que)
- Existe operador com `login = "maria.santos"` no banco
- O usuário está criando um novo operador

**When** (Quando)
- O usuário preenche todos os campos válidos
- O usuário define `login = "maria.santos"` (duplicado)
- O usuário tenta salvar

**Then** (Então)
- O frontend envia POST `/api/operadores`
- O backend tenta criar operador
- O banco de dados rejeita por constraint UNIQUE em `login`
- O backend captura exceção (DataIntegrityViolationException)
- O backend retorna HTTP 409 Conflict
- Response body:
  ```json
  {
    "error": "Conflict",
    "message": "Login já existe no sistema",
    "field": "login"
  }
  ```
- O frontend exibe mensagem de erro
- O operador NÃO é criado
- O usuário permanece no formulário

---

### Cenário 2.4: Criação com Múltiplos Perfis

**Given** (Dado que)
- O usuário está criando operador
- Existem perfis: UPA, ENFERMEIRO, RECEPCIONISTA_UPA

**When** (Quando)
- O usuário seleciona os 3 perfis
- O usuário salva o operador

**Then** (Então)
- Operador criado (ID = 11)
- PUT `/api/operadores/11/perfis` com `["UPA", "ENFERMEIRO", "RECEPCIONISTA_UPA"]`
- Backend cria 3 registros na tabela `operador_perfis`
- Query retorna:
  ```sql
  SELECT perfil FROM operador_perfis WHERE operador_id = 11;
  -- UPA
  -- ENFERMEIRO  
  -- RECEPCIONISTA_UPA
  ```
- Operador tem acesso combinado de todos os perfis

---

<a name="suite-seguranca"></a>
## 🔒 Suite 3: Segurança

### Cenário 3.1: Proteção do Operador Master - Tentativa de Alteração

**Given** (Dado que)
- Operador master existe com ID = 1
- Usuário está logado como admin (mas tentando alterar o master via API)

**When** (Quando)
- O frontend tenta PUT `/api/operadores/1` com:
  ```json
  {
    "login": "novo.login",  // Tentando alterar
    "ativo": false          // Tentando desativar
  }
  ```

**Then** (Então)
- O backend detecta que `operador.isMaster = true`
- O backend lança exceção de validação
- HTTP 403 Forbidden
- Mensagem: "Operador master não pode ser alterado"
- Banco de dados permanece inalterado
- Login continua "admin.master"
- Status continua `ativo = true`

**Código de Proteção:**
```java
@PreAuthorize("hasRole('ADMIN')")
public void update(Long id, OperadorDTO dto) {
    Operador op = repository.findById(id).orElseThrow();
    
    if (op.isMaster()) {
        throw new ForbiddenException("Operador master não pode ser alterado");
    }
    
    // ... resto da atualização
}
```

---

### Cenário 3.2: Tentativa de SQL Injection no Login

**Given** (Dado que)
- Atacante está na página de login

**When** (Quando)
- Atacante insere no campo login: `admin' OR '1'='1`
- Atacante insere senha qualquer

**Then** (Então)
- O sistema usa prepared statements (JPA/Hibernate)
- A string é tratada como valor literal
- Nenhum SQL é executado diretamente
- Autenticação falha (credenciais inválidas)
- HTTP 401 Unauthorized
- Sistema permanece seguro

---

### Cenário 3.3: Token JWT Expirado

**Given** (Dado que)
- Usuário fez login e recebeu token JWT
- Token tem validade de 24h
- 25 horas se passaram

**When** (Quando)
- O frontend tenta fazer requisição com token expirado
- GET `/api/operadores` com `Authorization: Bearer <token_expirado>`

**Then** (Então)
- O Spring Security intercepta a requisição
- O JwtFilter valida o token
- Detecta que token está expirado
- Retorna HTTP 401 Unauthorized
- Response: `{ "error": "Token expired" }`
- Frontend redireciona para `/login`
- Usuário precisa fazer login novamente

---

<a name="suite-performance"></a>
## ⚡ Suite 4: Performance

### Cenário 4.1: Tempo de Resposta do Login

**Given** (Dado que)
- Sistema está em condições normais de carga
- Banco de dados tem 1000 operadores

**When** (Quando)
- 100 usuários fazem login simultâneo

**Then** (Então)
- 95% das requisições respondem em < 2 segundos
- 99% das requisições respondem em < 3 segundos
- Nenhuma requisição excede 5 segundos
- CPU do servidor < 80%
- Memória < 70% do total

**Métricas:**
```
p50: 1.2s
p95: 1.8s
p99: 2.5s
max: 4.8s
```

---

### Cenário 4.2: Carga na Listagem de Operadores

**Given** (Dado que)
- Existem 5000 operadores no banco
- Usuário admin está logado

**When** (Quando)
- Usuário acessa GET `/api/operadores?page=0&size=50`

**Then** (Então)
- Resposta retorna em < 1 segundo
- Apenas 50 registros são retornados (paginação)
- Query usa LIMIT/OFFSET
- Total de páginas calculado
- Memória não aumenta significativamente

---

## 📊 Resumo Estatístico

| Suite | Cenários | Prioridade Alta | Prioridade Média | Prioridade Baixa |
|-------|----------|-----------------|------------------|------------------|
| Autenticação | 5 | 5 | 0 | 0 |
| Gestão | 4 | 3 | 1 | 0 |
| Segurança | 3 | 3 | 0 | 0 |
| Performance | 2 | 2 | 0 | 0 |
| **Total** | **14** | **13** | **1** | **0** |

---

## ✅ Checklist de Execução

### Antes de Executar:
- [ ] Backend rodando (porta 8080)
- [ ] Frontend rodando (porta 5173)
- [ ] PostgreSQL ativo
- [ ] Migrations executadas
- [ ] Operador master criado
- [ ] Perfis de teste criados
- [ ] Unidades de teste criadas

### Durante Execução:
- [ ] Logs do backend monitrados
- [ ] Network tab do navegador aberto
- [ ] Screenshots de falhas capturadas
- [ ] Dados de performance coletados

### Após Execução:
- [ ] Relatório de testes gerado
- [ ] Bugs documentados
- [ ] Métricas analisadas
- [ ] Banco de dados limpo (se necessário)

