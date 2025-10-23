# Configuração de Permissões SAMU

## Data: 01/10/2025

## Problema

Frontend do módulo SAMU retorna erro **403 (Forbidden)** ao acessar os endpoints porque os operadores não possuem as permissões (roles) necessárias.

## Solução Implementada

### 1. Novos Perfis SAMU Adicionados ao Enum

Arquivo: `backend/src/main/java/com/sistemadesaude/backend/perfilacesso/entity/Perfil.java`

```java
SAMU_OPERADOR("SAMU_OPERADOR", "Operador SAMU - Registro de Solicitações", 9),
SAMU_REGULADOR("SAMU_REGULADOR", "Regulador Médico SAMU", 9);
```

### 2. Migration Criada

Arquivo: `backend/src/main/resources/db/migration/V202510012100__add_samu_perfis_to_admin.sql`

```sql
-- Adicionar perfis SAMU a todos os operadores com perfil ADMIN
INSERT INTO operador_perfis (operador_id, perfil)
SELECT DISTINCT op.operador_id, 'SAMU_OPERADOR'
FROM operador_perfis op
WHERE op.perfil = 'ADMIN'
  AND NOT EXISTS (
    SELECT 1 FROM operador_perfis op2
    WHERE op2.operador_id = op.operador_id
    AND op2.perfil = 'SAMU_OPERADOR'
  );

INSERT INTO operador_perfis (operador_id, perfil)
SELECT DISTINCT op.operador_id, 'SAMU_REGULADOR'
FROM operador_perfis op
WHERE op.perfil = 'ADMIN'
  AND NOT EXISTS (
    SELECT 1 FROM operador_perfis op2
    WHERE op2.operador_id = op.operador_id
    AND op2.perfil = 'SAMU_REGULADOR'
  );
```

## IMPORTANTE: Como Adicionar Permissões SAMU aos Operadores

### Opção 1: Adicionar Automaticamente ao Operador admin.master (RECOMENDADO)

A migration `V202510012100__add_samu_perfis_to_admin.sql` adiciona automaticamente os perfis SAMU ao operador `admin.master` que possui o perfil `ADMINISTRADOR_SISTEMA`.

**Esta configuração é automática quando você iniciar o backend!**

Credenciais do operador master:
- **Login**: `admin.master`
- **Senha**: `Admin@123`

### Opção 2: Adicionar Manualmente via SQL (Para outros operadores)

Se você quiser adicionar permissões SAMU a um operador diferente do admin.master, execute este SQL no PostgreSQL:

```sql
-- Primeiro, verifique o ID do seu operador
SELECT id, login, nome FROM operador WHERE login = 'seu_usuario';

-- Depois, adicione as permissões SAMU (substitua X pelo id encontrado acima)
INSERT INTO operador_perfis (operador_id, perfil)
VALUES
    (X, 'SAMU_OPERADOR'),
    (X, 'SAMU_REGULADOR')
ON CONFLICT (operador_id, perfil) DO NOTHING;
```

### Opção 2: Adicionar Automaticamente aos ADMIN (Requer ADMIN Existente)

A migration `V202510012100__add_samu_perfis_to_admin.sql` adiciona automaticamente os perfis SAMU a todos os operadores que já possuem o perfil `ADMIN`.

**ATENÇÃO**: Se você ainda não tem nenhum operador com perfil `ADMIN`, a migration não fará nada. Nesse caso, use a Opção 1 acima.

## Estrutura de Permissões SAMU

### SAMU_OPERADOR
- Pode criar e visualizar solicitações/ocorrências
- Pode visualizar configurações do SAMU
- Pode acessar todos os cadastros (ambulâncias, tipos de ocorrência, etc.)

**Controllers que requerem SAMU_OPERADOR**:
- `SolicitacaoSamuController.criarSolicitacao()` - POST /api/samu/solicitacoes

### SAMU_REGULADOR
- Todas as permissões do SAMU_OPERADOR
- Pode regular pacientes
- Pode atribuir ambulâncias
- Pode encaminhar ocorrências

**Controllers que requerem SAMU_REGULADOR**:
- `RegulacaoMedicaController` - Todos os endpoints de regulação médica

### Endpoints Acessíveis com Qualquer Perfil SAMU (ou ADMIN)

Estes endpoints aceitam tanto `SAMU_OPERADOR` quanto `SAMU_REGULADOR` quanto `ADMIN`:

```
GET  /api/samu/solicitacoes
GET  /api/samu/solicitacoes/{id}
PUT  /api/samu/solicitacoes/{id}
GET  /api/samu/configuracoes/unidade/{id}
POST /api/samu/configuracoes
GET  /api/samu/cadastros/*
```

## Como Testar as Permissões

### 1. Faça login e obtenha o token JWT

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"seu_usuario","password":"sua_senha"}'
```

Você receberá uma resposta como:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer"
}
```

### 2. Use o token para acessar os endpoints SAMU

```bash
curl -X GET "http://localhost:8080/api/samu/solicitacoes" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Se você receber **200 OK**, as permissões estão configuradas corretamente.

Se você receber **403 Forbidden**, o operador não possui as permissões necessárias.

## Troubleshooting

### Erro 403 (Forbidden)

**Causa**: O operador não possui os perfis SAMU_OPERADOR ou SAMU_REGULADOR

**Solução**: Execute o SQL da Opção 1 acima para adicionar as permissões

### Erro 401 (Unauthorized)

**Causa**: Token JWT inválido ou expirado

**Solução**: Faça login novamente para obter um novo token

### Migration Não Adiciona Permissões Automaticamente

**Causa**: Não existem operadores com perfil ADMIN no banco de dados

**Solução**: Use a Opção 1 (SQL manual) para adicionar as permissões ao seu operador

## Arquivos Modificados

1. ✅ `backend/src/main/java/com/sistemadesaude/backend/perfilacesso/entity/Perfil.java`
   - Adicionados: SAMU_OPERADOR e SAMU_REGULADOR

2. ✅ `backend/src/main/resources/db/migration/V202510012100__add_samu_perfis_to_admin.sql`
   - Migration para adicionar perfis SAMU aos operadores ADMIN

3. ✅ `backend/src/main/java/com/sistemadesaude/backend/samu/controller/*`
   - Controllers com anotações @PreAuthorize verificando os perfis SAMU

## Status

| Item | Status |
|------|--------|
| Perfis SAMU criados no enum | ✅ |
| Migration criada | ✅ |
| Controllers com @PreAuthorize | ✅ |
| **Permissões adicionadas ao operador** | ⚠️ Aguardando configuração manual |

## Próximos Passos

1. Identifique o `operador_id` do seu usuário
2. Execute o SQL da Opção 1 para adicionar as permissões SAMU
3. Faça login novamente para obter um token JWT atualizado
4. Teste os endpoints SAMU no frontend

Após concluir esses passos, o módulo SAMU deve funcionar sem erros 403.
