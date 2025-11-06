# ✅ Requisitos para Executar Testes Automáticos do Testsprite

## ⚠️ Problema Identificado:

O Testsprite precisa que **ambos os serviços estejam rodando**:
- ✅ Frontend na porta **5173**
- ❌ Backend na porta **8080** (FALTANDO)

## 📋 O que está faltando:

### 1. Backend Spring Boot rodando na porta 8080

**Passos para iniciar:**

#### Opção 1: Via IntelliJ IDEA
1. Abra o projeto no IntelliJ
2. Localize a classe `BackendApplication.java`
3. Clique com botão direito → Run 'BackendApplication'
4. Aguarde mensagem: `Started BackendApplication in X seconds`

#### Opção 2: Via Terminal
```bash
cd D:\IntelliJ\sistema2\backend
mvnw.cmd spring-boot:run
```

#### Opção 3: Via Maven (se Maven instalado)
```bash
cd D:\IntelliJ\sistema2\backend
mvn spring-boot:run
```

### 2. Frontend React/Vite rodando na porta 5173

**Verificar se está rodando:**
```bash
cd D:\IntelliJ\sistema2\frontend
npm run dev
```

**Deve abrir em:** http://localhost:5173

## ✅ Checklist antes de executar testes:

- [ ] Backend rodando na porta 8080
  - [ ] Verificar: http://localhost:8080/actuator/health
  - [ ] Deve retornar status 200
  
- [ ] Frontend rodando na porta 5173
  - [ ] Verificar: http://localhost:5173
  - [ ] Deve carregar a página de login
  
- [ ] Banco de dados PostgreSQL rodando
  - [ ] Porta: 5432
  - [ ] Database: saude_db
  - [ ] Operador admin.master deve existir

- [ ] Operador master configurado
  - [ ] Login: `admin.master`
  - [ ] Senha: `Admin@123`
  - [ ] `isMaster = true`
  - [ ] `ativo = true`

## 🚀 Após tudo rodando, executar:

```bash
cd D:\IntelliJ\sistema2
node C:\Users\okdur\AppData\Local\npm-cache\_npx\8ddf6bea01b2519d\node_modules\@testsprite\testsprite-mcp\dist\index.js generateCodeAndExecute
```

## 📊 Testes que serão executados:

1. ✅ Login com operador master (admin.master)
2. ✅ Login com operador normal sem horários
3. ✅ Login bloqueado para operador inativo
4. ✅ Criação de operador válido
5. ✅ Validação de campos obrigatórios
6. ✅ Múltiplos perfis e unidades

## 🔍 Verificar se está tudo OK:

### Backend (porta 8080):
```powershell
Invoke-WebRequest -Uri http://localhost:8080/actuator/health -UseBasicParsing
```

### Frontend (porta 5173):
```powershell
Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing
```

**Ambos devem retornar status 200 OK**

