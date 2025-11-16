# 🚀 Guia Rápido de Deploy para VPS

## 📋 Resumo do Projeto

Este é um sistema de gestão em saúde pública com:
- **Backend**: Spring Boot (Java 17)
- **Frontend**: React/Vite (TypeScript)
- **Banco de Dados**: PostgreSQL 15
- **Cache**: Redis (opcional)
- **Reverse Proxy**: Nginx

## ⚡ Início Rápido

### 1. Preparar VPS

```bash
# Conectar na VPS
ssh usuario@seu-ip-vps

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Configurar Projeto

```bash
# Clonar do GitHub
cd /opt/apps
git clone https://github.com/seu-usuario/SISTEMA2.git
cd SISTEMA2

# Criar arquivo .env
cp env.example.txt .env
nano .env  # Configure as senhas e variáveis
```

**⚠️ IMPORTANTE:** As migrations do Flyway serão executadas automaticamente na primeira inicialização do backend!

### 3. Deploy

```bash
# Tornar scripts executáveis
chmod +x scripts/*.sh

# Executar deploy
sudo ./scripts/deploy.sh
```

### 4. Verificar

```bash
# Ver status
docker compose -f docker-compose.prod.yml ps

# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Testar aplicação
curl http://localhost:8080/actuator/health
curl http://localhost:4173
```

## 📚 Documentação Completa

Para instruções detalhadas, consulte: **[GUIA_MIGRACAO_VPS.md](./GUIA_MIGRACAO_VPS.md)**

## 🔧 Comandos Úteis

```bash
# Parar aplicação
docker compose -f docker-compose.prod.yml down

# Iniciar aplicação
docker compose -f docker-compose.prod.yml up -d

# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Backup do banco
./scripts/backup-db.sh

# Restaurar banco
./scripts/restore-db.sh backups/backup_arquivo.sql.gz

# Atualizar aplicação
git pull
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

## 🆘 Problemas Comuns

### Container não inicia
```bash
docker compose -f docker-compose.prod.yml logs nome_container
```

### Banco não conecta
```bash
docker compose -f docker-compose.prod.yml logs postgres
docker exec -it saude_postgres psql -U postgres -d saude_db
```

### Porta em uso
```bash
sudo netstat -tulpn | grep :8080
```

## 📞 Suporte

Consulte a seção de Troubleshooting no **[GUIA_MIGRACAO_VPS.md](./GUIA_MIGRACAO_VPS.md)**

