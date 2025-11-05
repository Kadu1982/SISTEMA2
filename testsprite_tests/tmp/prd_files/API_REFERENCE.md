# 📡 Referência de API - Login e Operadores

## Base URL
```
Development: http://localhost:8080/api
Production: https://api.sistema-saude.com/api
```

---

## 🔐 Autenticação

### POST /auth/login
Autentica um operador e retorna token JWT.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "login": "admin.master",
  "senha": "Admin@123"
}
```

**Response Success (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "operador": {
    "id": 1,
    "login": "admin.master",
    "nome": "Administrador Master",
    "cpf": "00000000000",
    "email": "admin@sistema.com",
    "ativo": true,
    "isMaster": true,
    "perfis": ["ADMINISTRADOR_SISTEMA"],
    "unidades": [
      {
        "id": 1,
        "nome": "UPA Central",
        "principal": true
      }
    ]
  },
  "requiresTermAccept": false
}
```

**Response Error (401 Unauthorized):**
```json
{
  "timestamp": "2025-11-04T16:30:00.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Credenciais inválidas",
  "path": "/api/auth/login"
}
```

**Response Error (403 Forbidden - Fora do Horário):**
```json
{
  "timestamp": "2025-11-04T22:30:00.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Acesso fora do horário permitido para este operador",
  "path": "/api/auth/login"
}
```

**Validações:**
- Login e senha são obrigatórios
- Operador deve estar ativo
- Horário de acesso deve ser válido (exceto para master)

---

## 👥 Operadores

### GET /operadores
Lista todos os operadores (paginado).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
page: int (default: 0)
size: int (default: 20, max: 100)
sort: string (ex: "nome,asc")
ativo: boolean (filtro opcional)
```

**Request:**
```http
GET /api/operadores?page=0&size=20&ativo=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "login": "admin.master",
      "nome": "Administrador Master",
      "cpf": "00000000000",
      "email": "admin@sistema.com",
      "ativo": true,
      "isMaster": true,
      "perfis": ["ADMINISTRADOR_SISTEMA"],
      "dataCriacao": "2025-01-01T00:00:00",
      "dataAtualizacao": "2025-01-01T00:00:00"
    },
    {
      "id": 2,
      "login": "joao.silva",
      "nome": "João da Silva",
      "cpf": "12345678901",
      "email": "joao@exemplo.com",
      "ativo": true,
      "isMaster": false,
      "perfis": ["UPA", "ENFERMEIRO"],
      "dataCriacao": "2025-11-01T10:00:00",
      "dataAtualizacao": "2025-11-01T10:00:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": false,
      "unsorted": true,
      "empty": true
    }
  },
  "totalElements": 42,
  "totalPages": 3,
  "last": false,
  "first": true,
  "number": 0,
  "size": 20,
  "numberOfElements": 20
}
```

---

### GET /operadores/{id}
Busca um operador específico por ID.

**Request:**
```http
GET /api/operadores/1
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "login": "admin.master",
  "nome": "Administrador Master",
  "cpf": "00000000000",
  "email": "admin@sistema.com",
  "ativo": true,
  "isMaster": true,
  "perfis": ["ADMINISTRADOR_SISTEMA"],
  "unidades": [
    {
      "id": 1,
      "nome": "UPA Central",
      "principal": true
    }
  ],
  "horarios": [],
  "dataCriacao": "2025-01-01T00:00:00",
  "dataAtualizacao": "2025-01-01T00:00:00"
}
```

**Response (404 Not Found):**
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Operador não encontrado com ID: 999"
}
```

---

### POST /operadores
Cria um novo operador.

**Request:**
```http
POST /api/operadores
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "Maria Santos",
  "login": "maria.santos",
  "senha": "Senha@123",
  "cpf": "98765432100",
  "email": "maria@exemplo.com",
  "ativo": true,
  "unidadePrincipalId": 1
}
```

**Response (201 Created):**
```json
{
  "id": 10,
  "login": "maria.santos",
  "nome": "Maria Santos",
  "cpf": "98765432100",
  "email": "maria@exemplo.com",
  "ativo": true,
  "isMaster": false,
  "perfis": [],
  "dataCriacao": "2025-11-04T16:30:00",
  "dataAtualizacao": "2025-11-04T16:30:00"
}
```

**Response (400 Bad Request - Validação):**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Erro de validação",
  "errors": [
    {
      "field": "nome",
      "message": "O nome deve ter pelo menos 3 caracteres"
    },
    {
      "field": "cpf",
      "message": "CPF deve ter 11 caracteres"
    }
  ]
}
```

**Response (409 Conflict - Login Duplicado):**
```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Login já existe no sistema",
  "field": "login",
  "value": "maria.santos"
}
```

**Validações:**
- Nome: mínimo 3 caracteres
- Login: mínimo 4 caracteres, único
- Senha: mínimo 6 caracteres
- CPF: 11 caracteres, único
- Email: formato válido, único (se fornecido)
- unidadePrincipalId: deve existir

---

### PUT /operadores/{id}
Atualiza um operador existente.

**Request:**
```http
PUT /api/operadores/10
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "Maria Santos Oliveira",
  "email": "maria.oliveira@exemplo.com",
  "ativo": true
}
```

**Response (200 OK):**
```json
{
  "id": 10,
  "login": "maria.santos",
  "nome": "Maria Santos Oliveira",
  "cpf": "98765432100",
  "email": "maria.oliveira@exemplo.com",
  "ativo": true,
  "dataAtualizacao": "2025-11-04T17:00:00"
}
```

**Response (403 Forbidden - Tentativa de Alterar Master):**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Operador master não pode ser alterado"
}
```

**Regras:**
- Não pode alterar `login`
- Não pode alterar `isMaster`
- Não pode alterar operador master (ID 1)
- Senha só pode ser alterada via endpoint específico

---

### PUT /operadores/{id}/perfis
Atualiza os perfis de um operador.

**Request:**
```http
PUT /api/operadores/10/perfis
Authorization: Bearer <token>
Content-Type: application/json

{
  "perfis": ["UPA", "ENFERMEIRO", "RECEPCIONISTA_UPA"]
}
```

**Response (200 OK):**
```json
{
  "id": 10,
  "login": "maria.santos",
  "nome": "Maria Santos",
  "perfis": ["UPA", "ENFERMEIRO", "RECEPCIONISTA_UPA"]
}
```

**Validações:**
- Deve fornecer pelo menos 1 perfil
- Perfis devem existir no sistema
- Não pode remover ADMINISTRADOR_SISTEMA do master

---

### PUT /operadores/{id}/unidades
Atualiza as unidades de um operador.

**Request:**
```http
PUT /api/operadores/10/unidades
Authorization: Bearer <token>
Content-Type: application/json

{
  "unidadeIds": [1, 2, 3],
  "unidadePrincipalId": 2
}
```

**Response (200 OK):**
```json
{
  "id": 10,
  "login": "maria.santos",
  "unidades": [
    { "id": 1, "nome": "UPA Central", "principal": false },
    { "id": 2, "nome": "UBS Norte", "principal": true },
    { "id": 3, "nome": "UBS Sul", "principal": false }
  ]
}
```

**Validações:**
- Deve fornecer pelo menos 1 unidade
- Unidade principal deve estar na lista de unidades
- Unidades devem existir

---

### PUT /operadores/{id}/senha
Altera a senha de um operador.

**Request:**
```http
PUT /api/operadores/10/senha
Authorization: Bearer <token>
Content-Type: application/json

{
  "senhaAtual": "Senha@123",
  "novaSenha": "NovaSenha@456"
}
```

**Response (200 OK):**
```json
{
  "message": "Senha alterada com sucesso"
}
```

**Response (400 Bad Request):**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Senha atual incorreta"
}
```

**Validações:**
- Senha atual deve estar correta
- Nova senha: mínimo 6 caracteres
- Nova senha é hasheada com BCrypt

---

### DELETE /operadores/{id}
Desativa (soft delete) um operador.

**Request:**
```http
DELETE /api/operadores/10
Authorization: Bearer <token>
```

**Response (204 No Content):**
```
(sem corpo)
```

**Response (403 Forbidden - Tentativa de Deletar Master):**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Operador master não pode ser deletado"
}
```

**Comportamento:**
- Não deleta fisicamente, apenas marca `ativo = false`
- Operador master não pode ser desativado

---

## 🔍 Perfis de Acesso

### GET /perfis
Lista todos os perfis disponíveis.

**Request:**
```http
GET /api/perfis
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "nome": "ADMINISTRADOR_SISTEMA",
    "descricao": "Administrador do Sistema",
    "permissoes": ["*"]
  },
  {
    "id": 2,
    "nome": "UPA",
    "descricao": "Perfil para UPA",
    "permissoes": ["ATENDIMENTO", "TRIAGEM", "PRESCRICAO"]
  },
  {
    "id": 3,
    "nome": "ENFERMEIRO",
    "descricao": "Enfermeiro",
    "permissoes": ["TRIAGEM", "PROCEDIMENTOS"]
  }
]
```

---

## 🏥 Unidades de Saúde

### GET /unidades
Lista todas as unidades de saúde.

**Request:**
```http
GET /api/unidades
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "nome": "UPA Central",
    "tipo": "UPA",
    "endereco": "Rua Principal, 100",
    "ativo": true
  },
  {
    "id": 2,
    "nome": "UBS Norte",
    "tipo": "UBS",
    "endereco": "Av. Norte, 200",
    "ativo": true
  }
]
```

---

## 🛡️ Autenticação e Autorização

### Headers Obrigatórios
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Perfis Requeridos por Endpoint

| Endpoint | Método | Perfis Autorizados |
|----------|--------|-------------------|
| /auth/login | POST | Público |
| /operadores | GET | ADMINISTRADOR_SISTEMA, GESTOR |
| /operadores | POST | ADMINISTRADOR_SISTEMA |
| /operadores/{id} | PUT | ADMINISTRADOR_SISTEMA |
| /operadores/{id}/perfis | PUT | ADMINISTRADOR_SISTEMA |
| /operadores/{id}/senha | PUT | Próprio operador ou ADMIN |

### Tratamento de Erros JWT

**Token Inválido (401):**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Token JWT inválido"
}
```

**Token Expirado (401):**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Token expirado"
}
```

**Sem Permissão (403):**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Acesso negado"
}
```

---

## 📊 Códigos de Status HTTP

| Código | Significado | Quando Usar |
|--------|-------------|-------------|
| 200 | OK | Sucesso em GET, PUT |
| 201 | Created | Sucesso em POST (criação) |
| 204 | No Content | Sucesso em DELETE |
| 400 | Bad Request | Erro de validação |
| 401 | Unauthorized | Credenciais inválidas, token inválido |
| 403 | Forbidden | Sem permissão, fora do horário |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Constraint violation (login duplicado, etc) |
| 500 | Internal Server Error | Erro do servidor |

---

## 🔐 Segurança

### Rate Limiting
- **Login:** 5 tentativas por minuto por IP
- **API Geral:** 100 requisições por minuto por token

### CORS
```
Allowed Origins: http://localhost:5173, https://app.sistema-saude.com
Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
Allowed Headers: Authorization, Content-Type
```

### Criptografia
- **Senhas:** BCrypt (custo: 10)
- **JWT:** HS256 (secret key de 256 bits)
- **HTTPS:** TLS 1.2+ em produção

---

## 📝 Exemplos de Uso

### Fluxo Completo: Login e Listagem

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    login: 'admin.master',
    senha: 'Admin@123'
  })
});

const { token } = await loginResponse.json();

// 2. Listar operadores
const operadoresResponse = await fetch('http://localhost:8080/api/operadores', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const operadores = await operadoresResponse.json();
console.log(operadores.content);
```

### Fluxo Completo: Criar Operador

```javascript
// 1. Criar operador
const createResponse = await fetch('http://localhost:8080/api/operadores', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nome: 'Carlos Mendes',
    login: 'carlos.mendes',
    senha: 'Senha@789',
    cpf: '11122233344',
    email: 'carlos@exemplo.com',
    ativo: true,
    unidadePrincipalId: 1
  })
});

const novoOperador = await createResponse.json();
const operadorId = novoOperador.id;

// 2. Adicionar perfis
await fetch(`http://localhost:8080/api/operadores/${operadorId}/perfis`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    perfis: ['UPA', 'ENFERMEIRO']
  })
});

// 3. Adicionar unidades
await fetch(`http://localhost:8080/api/operadores/${operadorId}/unidades`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    unidadeIds: [1, 2],
    unidadePrincipalId: 1
  })
});
```

---

## 🐛 Troubleshooting

### Erro: "Token expired"
**Solução:** Fazer login novamente para obter novo token

### Erro: "Login já existe"
**Solução:** Escolher outro login único

### Erro: "Acesso fora do horário"
**Solução:** Aguardar horário permitido ou pedir ajuste ao admin

### Erro: "CORS blocked"
**Solução:** Verificar configuração de CORS no backend

