# 📋 Plano de Testes - Login e Criação de Operadores

## ⚠️ Observação sobre Testsprite

O Testsprite requer uma chave de API configurada. Para usar o Testsprite, você precisa:
1. Acessar: https://www.testsprite.com/dashboard/settings/apikey
2. Criar uma nova API_KEY
3. Configurar a chave no ambiente

Por enquanto, apresentamos um plano de testes manual que pode ser executado diretamente.

---

## 🔐 Testes de Login de Operadores

### Teste 1: Login com Operador Master (admin.master)
**Objetivo:** Verificar que o operador master pode fazer login com sucesso

**Pré-condições:**
- Operador `admin.master` existe no banco
- Senha: `Admin@123`
- `isMaster = true`
- `ativo = true`

**Passos:**
1. Acessar página de login (`/login`)
2. Inserir login: `admin.master`
3. Inserir senha: `Admin@123`
4. Clicar em "Entrar"

**Resultado Esperado:**
- ✅ Login bem-sucedido
- ✅ Redirecionamento para dashboard
- ✅ Token JWT gerado e armazenado
- ✅ Dados do operador no contexto
- ✅ Operador master ignora restrições de horário

**Validações:**
- Verificar que o token JWT está presente
- Verificar que o operador tem perfil `ADMINISTRADOR_SISTEMA`
- Verificar que `isMaster = true`

---

### Teste 2: Login com Operador Normal (sem horários definidos)
**Objetivo:** Verificar que operador sem horários definidos pode fazer login

**Pré-condições:**
- Operador de teste criado
- `ativo = true`
- `isMaster = false`
- Sem horários de acesso definidos

**Passos:**
1. Criar operador de teste via módulo Configurações
2. Acessar página de login
3. Inserir credenciais do operador
4. Clicar em "Entrar"

**Resultado Esperado:**
- ✅ Login bem-sucedido
- ✅ Redirecionamento conforme perfil do operador
- ✅ Token JWT gerado

**Validações:**
- Verificar que operador sem horários pode fazer login a qualquer hora
- Verificar que redirecionamento está correto conforme perfil

---

### Teste 3: Login com Operador Normal (com horários definidos - dentro do horário)
**Objetivo:** Verificar que operador com horários pode fazer login dentro da janela permitida

**Pré-condições:**
- Operador de teste criado
- `ativo = true`
- `isMaster = false`
- Horário de acesso definido: 08:00-18:00 (segunda a sexta)
- Teste executado dentro do horário permitido

**Passos:**
1. Criar operador com horários de acesso
2. Acessar página de login (dentro do horário permitido)
3. Inserir credenciais
4. Clicar em "Entrar"

**Resultado Esperado:**
- ✅ Login bem-sucedido
- ✅ Redirecionamento conforme perfil

**Validações:**
- Verificar que login funciona dentro da janela de horário
- Verificar que validação de horário está funcionando

---

### Teste 4: Login com Operador Normal (com horários definidos - fora do horário)
**Objetivo:** Verificar que operador com horários NÃO pode fazer login fora da janela permitida

**Pré-condições:**
- Operador de teste criado
- `ativo = true`
- `isMaster = false`
- Horário de acesso definido: 08:00-18:00 (segunda a sexta)
- Teste executado FORA do horário permitido (ex: 20:00 ou fim de semana)

**Passos:**
1. Criar operador com horários de acesso
2. Acessar página de login (fora do horário permitido)
3. Inserir credenciais
4. Clicar em "Entrar"

**Resultado Esperado:**
- ❌ Login bloqueado
- ❌ Mensagem de erro: "Acesso fora do horário permitido para este operador"
- ❌ Não redireciona para dashboard

**Validações:**
- Verificar que `AccessDeniedException` é lançada
- Verificar que mensagem de erro é exibida
- Verificar que token JWT NÃO é gerado

---

### Teste 5: Login com Operador Inativo
**Objetivo:** Verificar que operador inativo NÃO pode fazer login

**Pré-condições:**
- Operador de teste criado
- `ativo = false`

**Passos:**
1. Desativar operador via módulo Configurações
2. Acessar página de login
3. Inserir credenciais
4. Clicar em "Entrar"

**Resultado Esperado:**
- ❌ Login bloqueado
- ❌ Mensagem de erro de autenticação
- ❌ Não redireciona para dashboard

**Validações:**
- Verificar que Spring Security bloqueia login de conta desabilitada
- Verificar que mensagem de erro é exibida

---

### Teste 6: Login com Credenciais Inválidas
**Objetivo:** Verificar que login com credenciais inválidas é bloqueado

**Passos:**
1. Acessar página de login
2. Inserir login: `operador.inexistente`
3. Inserir senha: `senha_qualquer`
4. Clicar em "Entrar"

**Resultado Esperado:**
- ❌ Login bloqueado
- ❌ Mensagem de erro: "Credenciais inválidas" ou "Operador não encontrado"
- ❌ Não redireciona para dashboard

**Validações:**
- Verificar que exceção de autenticação é lançada
- Verificar que mensagem de erro é exibida

---

### Teste 7: Login com Operador Master - Verificação de Restrições Ignoradas
**Objetivo:** Verificar que operador master ignora restrições de horário mesmo com horários definidos

**Pré-condições:**
- Operador `admin.master` existe
- Operador master tem horários de acesso definidos (fora do horário atual)

**Passos:**
1. Definir horários de acesso para admin.master (fora do horário atual)
2. Tentar fazer login com admin.master (fora do horário)
3. Verificar que login é bem-sucedido

**Resultado Esperado:**
- ✅ Login bem-sucedido mesmo fora do horário
- ✅ Operador master ignora restrições

**Validações:**
- Verificar que `AcessoValidator` retorna imediatamente para operadores master
- Verificar que `isMaster = true` faz com que restrições sejam ignoradas

---

## 👥 Testes de Criação de Operadores (Módulo Configurações)

### Teste 8: Criar Operador com Dados Válidos
**Objetivo:** Verificar que criação de operador funciona com dados válidos

**Pré-condições:**
- Usuário logado como `admin.master`
- Perfis disponíveis no sistema
- Unidades disponíveis no sistema

**Passos:**
1. Acessar Configurações > Operadores
2. Clicar em "Novo Operador" ou abrir diálogo de criação
3. Preencher campos obrigatórios:
   - Nome: "Operador Teste"
   - Login: "operador.teste"
   - Senha: "Teste@123"
   - CPF: "12345678901"
   - Email: "operador.teste@teste.com"
4. Selecionar pelo menos 1 perfil
5. Selecionar pelo menos 1 unidade
6. Definir unidade principal
7. Clicar em "Salvar" ou "Criar"

**Resultado Esperado:**
- ✅ Operador criado com sucesso
- ✅ Mensagem de sucesso exibida
- ✅ Operador aparece na lista
- ✅ Perfis vinculados ao operador
- ✅ Unidades vinculadas ao operador

**Validações:**
- Verificar que operador foi criado no banco
- Verificar que perfis foram vinculados
- Verificar que unidades foram vinculadas
- Verificar que unidade principal foi definida

---

### Teste 9: Criar Operador - Validação de Campos Obrigatórios
**Objetivo:** Verificar que campos obrigatórios são validados

**Passos:**
1. Acessar diálogo de criação de operador
2. Tentar salvar sem preencher campos obrigatórios
3. Verificar mensagens de erro

**Resultado Esperado:**
- ❌ Mensagem de erro para cada campo obrigatório não preenchido:
  - Nome: "O nome deve ter pelo menos 3 caracteres"
  - Login: "O login deve ter pelo menos 4 caracteres"
  - Senha: "A senha deve ter pelo menos 6 caracteres"
  - CPF: "CPF é obrigatório (11 caracteres)"
  - Perfis: "Selecione pelo menos um perfil"
  - Unidades: "Selecione pelo menos uma unidade de saúde"
  - Unidade Principal: "Defina uma unidade principal"

**Validações:**
- Verificar que validação do frontend funciona
- Verificar que backend também valida

---

### Teste 10: Criar Operador - Login Duplicado
**Objetivo:** Verificar que não é possível criar operador com login duplicado

**Pré-condições:**
- Operador com login "operador.teste" já existe

**Passos:**
1. Tentar criar operador com login "operador.teste"
2. Preencher outros campos válidos
3. Tentar salvar

**Resultado Esperado:**
- ❌ Erro de validação: "Login já existe" ou similar
- ❌ Operador não é criado

**Validações:**
- Verificar que backend retorna erro 400 ou 409
- Verificar que mensagem de erro é exibida no frontend

---

### Teste 11: Criar Operador - CPF Duplicado
**Objetivo:** Verificar que não é possível criar operador com CPF duplicado

**Pré-condições:**
- Operador com CPF "12345678901" já existe

**Passos:**
1. Tentar criar operador com CPF "12345678901"
2. Preencher outros campos válidos
3. Tentar salvar

**Resultado Esperado:**
- ❌ Erro de validação: "CPF já existe" ou similar
- ❌ Operador não é criado

**Validações:**
- Verificar que backend retorna erro de constraint violation
- Verificar que mensagem de erro é exibida

---

### Teste 12: Criar Operador - Email Duplicado
**Objetivo:** Verificar que não é possível criar operador com email duplicado

**Pré-condições:**
- Operador com email "teste@teste.com" já existe

**Passos:**
1. Tentar criar operador com email "teste@teste.com"
2. Preencher outros campos válidos
3. Tentar salvar

**Resultado Esperado:**
- ❌ Erro de validação: "Email já existe" ou similar
- ❌ Operador não é criado

**Validações:**
- Verificar que backend retorna erro de constraint violation
- Verificar que mensagem de erro é exibida

---

### Teste 13: Criar Operador - Múltiplos Perfis
**Objetivo:** Verificar que é possível vincular múltiplos perfis ao operador

**Passos:**
1. Criar operador selecionando múltiplos perfis (ex: "UPA", "RECEPCIONISTA_UPA")
2. Salvar operador
3. Verificar perfis vinculados

**Resultado Esperado:**
- ✅ Operador criado com sucesso
- ✅ Todos os perfis selecionados foram vinculados
- ✅ Perfis aparecem na lista de perfis do operador

**Validações:**
- Verificar no banco que todos os perfis foram vinculados
- Verificar na interface que perfis são exibidos corretamente

---

### Teste 14: Criar Operador - Múltiplas Unidades
**Objetivo:** Verificar que é possível vincular múltiplas unidades ao operador

**Passos:**
1. Criar operador selecionando múltiplas unidades
2. Definir uma unidade principal
3. Salvar operador
4. Verificar unidades vinculadas

**Resultado Esperado:**
- ✅ Operador criado com sucesso
- ✅ Todas as unidades selecionadas foram vinculadas
- ✅ Unidade principal foi definida corretamente

**Validações:**
- Verificar no banco que todas as unidades foram vinculadas
- Verificar que unidade principal está correta

---

### Teste 15: Criar Operador - Verificar que admin.master NÃO é Alterado
**Objetivo:** Verificar que operador master não pode ser alterado via criação

**Passos:**
1. Tentar criar operador com login "admin.master"
2. Verificar resultado

**Resultado Esperado:**
- ❌ Erro: "Login já existe" ou "Operador master não pode ser alterado"
- ❌ Operador master não é modificado

**Validações:**
- Verificar que operador master permanece intacto
- Verificar que `isMaster = true` não pode ser alterado

---

## 📊 Resumo dos Testes

| ID | Teste | Status Esperado |
|----|-------|----------------|
| 1 | Login com Operador Master | ✅ Sucesso |
| 2 | Login sem horários definidos | ✅ Sucesso |
| 3 | Login dentro do horário | ✅ Sucesso |
| 4 | Login fora do horário | ❌ Bloqueado |
| 5 | Login com operador inativo | ❌ Bloqueado |
| 6 | Login com credenciais inválidas | ❌ Bloqueado |
| 7 | Login master ignora restrições | ✅ Sucesso |
| 8 | Criar operador válido | ✅ Sucesso |
| 9 | Validação campos obrigatórios | ❌ Erros |
| 10 | Login duplicado | ❌ Erro |
| 11 | CPF duplicado | ❌ Erro |
| 12 | Email duplicado | ❌ Erro |
| 13 | Múltiplos perfis | ✅ Sucesso |
| 14 | Múltiplas unidades | ✅ Sucesso |
| 15 | Proteção admin.master | ❌ Erro |

---

## 🔧 Como Executar os Testes

### Opção 1: Testes Manuais
Execute cada teste manualmente seguindo os passos descritos acima.

### Opção 2: Testsprite (Requer API Key)
1. Obter API Key em: https://www.testsprite.com/dashboard/settings/apikey
2. Configurar API Key no ambiente
3. Executar comandos Testsprite para gerar e executar testes automatizados

### Opção 3: Playwright/Testes E2E
Criar testes automatizados usando Playwright ou outra ferramenta de teste E2E.


