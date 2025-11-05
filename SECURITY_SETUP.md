# 🔒 Configuração de Segurança - Setup Guide

## ⚠️ IMPORTANTE: Configuração de Secrets

Este projeto utiliza variáveis de ambiente para proteger informações sensíveis. **NUNCA** commite senhas, tokens ou secrets diretamente no código.

---

## 📋 Arquivos de Configuração

### Arquivos de Exemplo (Podem ser commitados)
✅ `application.properties.example`
✅ `application-dev.properties.example`
✅ `frontend/.env.example`

### Arquivos Reais (NÃO devem ser commitados)
❌ `application.properties` (com secrets)
❌ `application-dev.properties` (com secrets)
❌ `frontend/.env` (se contiver secrets)

---

## 🚀 Setup Inicial

### 1. Backend - Application Properties

**Passo 1:** Copie os arquivos de exemplo:
```bash
cd backend/src/main/resources
cp application.properties.example application.properties
cp application-dev.properties.example application-dev.properties
```

**Passo 2:** Gere um JWT Secret seguro:
```bash
# Linux/Mac
openssl rand -base64 64

# Windows (PowerShell)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Passo 3:** Configure as variáveis de ambiente:

#### Opção A: Arquivo .env local (recomendado para desenvolvimento)
Crie `.env` na raiz do projeto:
```bash
# Database
SPRING_DATASOURCE_PASSWORD=sua_senha_postgresql

# JWT Secret (use o valor gerado acima)
JWT_SECRET=SEU_SECRET_GERADO_AQUI_BASE64_LONGO

# Opcional
JWT_EXPIRATION=86400000
```

#### Opção B: Variáveis de ambiente do sistema

**Windows:**
```bash
setx JWT_SECRET "SEU_SECRET_GERADO_AQUI"
setx SPRING_DATASOURCE_PASSWORD "sua_senha"
```

**Linux/Mac:**
```bash
export JWT_SECRET="SEU_SECRET_GERADO_AQUI"
export SPRING_DATASOURCE_PASSWORD="sua_senha"
```

---

### 2. Frontend - Environment Variables

**Passo 1:** Copie o arquivo de exemplo:
```bash
cd frontend
cp .env.example .env
```

**Passo 2:** Configure se necessário (valores padrão já funcionam):
```env
VITE_API_URL=/api
VITE_NODE_ENV=development
VITE_API_TIMEOUT=30000
VITE_DEBUG_MODE=true
```

---

## 🛡️ Proteção do Repositório

### Adicionar ao .gitignore

Certifique-se que o `.gitignore` contém:
```
# Arquivos de configuração com secrets
backend/src/main/resources/application.properties
backend/src/main/resources/application-dev.properties
backend/src/main/resources/application-*.properties
!backend/src/main/resources/application*.properties.example

# Environment files
.env
.env.local
.env.*.local
!.env.example

# Credenciais
**/credentials.json
**/secrets.json
**/*.key
**/*.pem
```

---

## 🔐 Boas Práticas de Segurança

### ✅ FAZER:

1. **Usar variáveis de ambiente** para todos os secrets
2. **Gerar secrets únicos** para cada ambiente (dev, staging, prod)
3. **Rotacionar secrets** periodicamente (a cada 90 dias)
4. **Usar secrets managers** em produção (AWS Secrets Manager, Azure Key Vault, etc.)
5. **Commitar apenas arquivos .example** sem valores reais

### ❌ NÃO FAZER:

1. **Nunca** commite senhas ou tokens no código
2. **Nunca** use senhas fracas como "123456" em produção
3. **Nunca** compartilhe secrets via email ou chat
4. **Nunca** reutilize secrets entre ambientes
5. **Nunca** deixe secrets em logs ou outputs

---

## 🚨 Se Você Commitou um Secret Acidentalmente

### Opção 1: Remover do histórico (PERIGOSO - pode quebrar repositórios clonados)
```bash
# Use git filter-branch ou BFG Repo-Cleaner
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (⚠️ CUIDADO!)
git push origin --force --all
```

### Opção 2: Rotacionar o secret (RECOMENDADO)
1. Gere um novo secret
2. Atualize em todos os ambientes
3. Remova o arquivo do próximo commit
4. Continue normalmente

---

## 📊 Checklist de Segurança

Antes de fazer deploy ou compartilhar o código:

- [ ] Todos os secrets estão em variáveis de ambiente
- [ ] Arquivos .example não contêm valores reais
- [ ] .gitignore está configurado corretamente
- [ ] Senhas de produção são fortes e únicas
- [ ] JWT secret tem no mínimo 64 caracteres
- [ ] Logs não expõem informações sensíveis
- [ ] Backups do banco estão protegidos
- [ ] HTTPS está habilitado em produção

---

## 🔧 Troubleshooting

### Erro: "JWT Secret is not configured"
**Solução:** Configure a variável de ambiente `JWT_SECRET`

### Erro: "Database password is incorrect"
**Solução:** Verifique `SPRING_DATASOURCE_PASSWORD`

### Erro: "Cannot find application.properties"
**Solução:** Copie o arquivo `.example` conforme instruções acima

---

## 📚 Referências

- [OWASP Security Guidelines](https://owasp.org/)
- [Spring Boot Security Best Practices](https://spring.io/guides/topicals/spring-security-architecture/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [12 Factor App - Config](https://12factor.net/config)

---

**Dúvidas?** Consulte o time de segurança ou abra uma issue no repositório.
