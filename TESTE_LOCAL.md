# 🧪 Guia de Teste Local Antes do Deploy

Antes de fazer deploy na VPS, é recomendado testar localmente para garantir que tudo está funcionando.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados localmente
- Portas 5432, 6379, 8080, 4173 disponíveis

## 🚀 Passos para Teste Local

### 1. Preparar Ambiente

```bash
# Navegar até o diretório do projeto
cd /caminho/para/SISTEMA2

# Criar arquivo .env para teste local
cp env.example.txt .env

# Editar .env (use valores de teste)
nano .env
```

**Configuração mínima para teste local:**
```env
POSTGRES_DB=saude_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=teste123
POSTGRES_PORT=5432

JWT_SECRET=chave_teste_jwt_minimo_32_caracteres_123456789
JWT_EXPIRATION=3600000

BACKEND_PORT=8080
FRONTEND_PORT=4173
SPRING_PROFILES_ACTIVE=dev
```

### 2. Criar Diretórios Necessários

```bash
mkdir -p backups storage/documentos nginx/ssl nginx/conf.d
```

### 3. Testar Build das Imagens

```bash
# Build do backend
cd backend
docker build -t saude-backend-test .
cd ..

# Build do frontend
cd frontend
docker build -t saude-frontend-test .
cd ..
```

### 4. Iniciar Serviços

```bash
# Usar docker-compose.prod.yml para teste
docker compose -f docker-compose.prod.yml up -d

# Ou usar docker-compose.yml original (se existir)
docker compose up -d
```

### 5. Verificar Status

```bash
# Ver status dos containers
docker compose -f docker-compose.prod.yml ps

# Ver logs
docker compose -f docker-compose.prod.yml logs -f
```

### 6. Testar Endpoints

```bash
# Health check do backend
curl http://localhost:8080/actuator/health

# Frontend
curl http://localhost:4173

# Banco de dados (via container)
docker exec -it saude_postgres psql -U postgres -d saude_db -c "SELECT version();"
```

### 7. Acessar Aplicação

- **Frontend**: http://localhost:4173
- **Backend API**: http://localhost:8080
- **Swagger/OpenAPI**: http://localhost:8080/swagger-ui.html (se configurado)

## ✅ Checklist de Teste Local

- [ ] Todos os containers iniciam sem erros
- [ ] PostgreSQL está acessível
- [ ] Backend responde em `/actuator/health`
- [ ] Frontend carrega no navegador
- [ ] Login funciona corretamente
- [ ] API responde às requisições
- [ ] Nenhum erro crítico nos logs

## 🐛 Problemas Comuns no Teste Local

### Porta já em uso

```bash
# Verificar qual processo está usando a porta
# Windows
netstat -ano | findstr :8080

# Linux/Mac
sudo lsof -i :8080

# Parar processo ou alterar porta no docker-compose
```

### Banco de dados não conecta

```bash
# Verificar se PostgreSQL está rodando
docker compose ps postgres

# Ver logs
docker compose logs postgres

# Testar conexão manual
docker exec -it saude_postgres psql -U postgres
```

### Frontend não carrega

```bash
# Verificar build
docker exec -it saude_frontend ls -la /app/dist

# Ver logs
docker compose logs frontend

# Rebuild se necessário
docker compose build frontend
docker compose up -d frontend
```

## 🧹 Limpeza Após Teste

```bash
# Parar todos os containers
docker compose -f docker-compose.prod.yml down

# Remover volumes (CUIDADO: apaga dados!)
docker compose -f docker-compose.prod.yml down -v

# Remover imagens
docker rmi saude-backend-test saude-frontend-test
```

## 📝 Notas

- Use perfis de desenvolvimento (`SPRING_PROFILES_ACTIVE=dev`) para testes locais
- Os dados do banco serão perdidos ao remover volumes
- Mantenha backups antes de testar operações destrutivas

---

**Próximo passo**: Após validar localmente, proceda com o deploy na VPS seguindo o `GUIA_MIGRACAO_VPS.md`

