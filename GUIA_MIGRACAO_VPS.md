# 🚀 Guia Completo de Migração para VPS com Docker

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Preparação da VPS](#preparação-da-vps)
3. [Configuração do Projeto](#configuração-do-projeto)
4. [Deploy da Aplicação](#deploy-da-aplicação)
5. [Configuração de Domínio e SSL](#configuração-de-domínio-e-ssl)
6. [Monitoramento e Manutenção](#monitoramento-e-manutenção)
7. [Troubleshooting](#troubleshooting)

---

## 📦 Pré-requisitos

### O que você precisa:

- ✅ **VPS** com pelo menos:
  - 2 CPU cores
  - 4GB RAM
  - 20GB SSD
  - Ubuntu 20.04+ ou Debian 11+
- ✅ **Domínio** (opcional, mas recomendado)
- ✅ **Acesso SSH** à VPS
- ✅ **Conhecimento básico** de Linux e Docker

---

## 🖥️ Preparação da VPS

### Passo 1: Conectar na VPS via SSH

```bash
ssh root@seu-ip-vps
# ou
ssh usuario@seu-ip-vps
```

### Passo 2: Atualizar o Sistema

```bash
# Atualizar lista de pacotes
sudo apt update && sudo apt upgrade -y

# Instalar pacotes essenciais
sudo apt install -y curl wget git nano ufw
```

### Passo 3: Instalar Docker

```bash
# Remover versões antigas (se houver)
sudo apt remove docker docker-engine docker.io containerd runc

# Instalar dependências
sudo apt install -y \
    ca-certificates \
    gnupg \
    lsb-release

# Adicionar repositório oficial do Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Adicionar seu usuário ao grupo docker (para não precisar usar sudo)
sudo usermod -aG docker $USER

# Verificar instalação
docker --version
docker compose version
```

**⚠️ IMPORTANTE:** Faça logout e login novamente para que as permissões do Docker sejam aplicadas.

### Passo 4: Configurar Firewall (UFW)

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH (IMPORTANTE: faça isso antes de fechar outras portas!)
sudo ufw allow 22/tcp

# Permitir portas da aplicação
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 8080/tcp # Backend (opcional, se não usar Nginx)

# Verificar status
sudo ufw status
```

---

## 📁 Configuração do Projeto

### Passo 1: Clonar o Repositório do GitHub

```bash
# Criar diretório para aplicações
mkdir -p /opt/apps
cd /opt/apps

# Clonar repositório do GitHub
# Substitua pela URL do seu repositório
git clone https://github.com/seu-usuario/SISTEMA2.git
cd SISTEMA2

# Verificar branch correta (geralmente main ou master)
git checkout main

# Ou fazer upload via SCP do seu computador local:
# scp -r /caminho/local/SISTEMA2 usuario@vps:/opt/apps/
```

**💡 Dica:** Se usar autenticação SSH no GitHub:
```bash
# Configurar SSH key na VPS
ssh-keygen -t ed25519 -C "seu-email@example.com"
cat ~/.ssh/id_ed25519.pub
# Adicionar a chave pública no GitHub: Settings > SSH and GPG keys

# Clonar usando SSH
git clone git@github.com:seu-usuario/SISTEMA2.git
```

### Passo 2: Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo .env
nano .env
```

**Configure as seguintes variáveis no arquivo `.env`:**

```env
# Banco de Dados - ALTERE AS SENHAS!
POSTGRES_DB=saude_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=SUA_SENHA_SEGURA_AQUI_MINIMO_16_CARACTERES

# JWT - ALTERE A CHAVE SECRETA!
JWT_SECRET=SUA_CHAVE_SECRETA_JWT_AQUI_MINIMO_32_CARACTERES_ALEATORIOS
JWT_EXPIRATION=3600000

# Domínio (se tiver)
DOMAIN_NAME=seudominio.com.br
```

**💡 Dica:** Para gerar uma senha segura:
```bash
openssl rand -base64 32
```

### Passo 3: Criar Diretórios Necessários

```bash
# Criar diretórios para volumes Docker
mkdir -p backups
mkdir -p storage/documentos
mkdir -p nginx/ssl
mkdir -p nginx/conf.d

# Dar permissões adequadas
chmod -R 755 backups storage nginx
```

### Passo 4: Verificar Arquivos Docker

Certifique-se de que os seguintes arquivos existem:
- ✅ `docker-compose.prod.yml`
- ✅ `backend/Dockerfile`
- ✅ `frontend/Dockerfile`
- ✅ `nginx/nginx.conf`
- ✅ `nginx/conf.d/default.conf`

---

## 🚀 Deploy da Aplicação

### Opção 1: Deploy Automatizado (Recomendado)

```bash
# Tornar script executável
chmod +x scripts/deploy.sh

# Executar script de deploy
sudo ./scripts/deploy.sh
```

### Opção 2: Deploy Manual

```bash
# 1. Parar containers existentes (se houver)
docker compose -f docker-compose.prod.yml down

# 2. Construir imagens
docker compose -f docker-compose.prod.yml build

# 3. Iniciar serviços
docker compose -f docker-compose.prod.yml up -d

# 4. Verificar logs
docker compose -f docker-compose.prod.yml logs -f
```

### Verificar Status dos Containers

```bash
# Ver status de todos os containers
docker compose -f docker-compose.prod.yml ps

# Ver logs de um serviço específico
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
docker compose -f docker-compose.prod.yml logs postgres
```

### Verificar Migrations do Flyway

```bash
# Tornar script executável
chmod +x scripts/check-migrations.sh

# Verificar status das migrations
./scripts/check-migrations.sh

# Ou verificar manualmente via logs
docker compose -f docker-compose.prod.yml logs backend | grep -i flyway
```

**⚠️ IMPORTANTE:** As migrations do Flyway são executadas automaticamente quando o backend inicia pela primeira vez. Verifique os logs para garantir que todas foram aplicadas com sucesso.

### Verificar Saúde dos Serviços

```bash
# Backend health check
curl http://localhost:8080/actuator/health

# Frontend
curl http://localhost:4173

# Nginx
curl http://localhost/health
```

---

## 🌐 Configuração de Domínio e SSL

### Passo 1: Configurar DNS

No seu provedor de domínio, configure os registros DNS:

```
Tipo: A
Nome: @
Valor: IP_DA_SUA_VPS

Tipo: A
Nome: www
Valor: IP_DA_SUA_VPS
```

### Passo 2: Instalar Certbot (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Parar Nginx temporariamente (se estiver rodando)
docker compose -f docker-compose.prod.yml stop nginx
```

### Passo 3: Obter Certificado SSL

```bash
# Obter certificado (modo standalone)
sudo certbot certonly --standalone -d seudominio.com.br -d www.seudominio.com.br

# Os certificados serão salvos em:
# /etc/letsencrypt/live/seudominio.com.br/fullchain.pem
# /etc/letsencrypt/live/seudominio.com.br/privkey.pem
```

### Passo 4: Copiar Certificados para o Projeto

```bash
# Criar diretório de certificados
mkdir -p nginx/ssl

# Copiar certificados
sudo cp /etc/letsencrypt/live/seudominio.com.br/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/seudominio.com.br/privkey.pem nginx/ssl/

# Ajustar permissões
sudo chmod 644 nginx/ssl/*.pem
sudo chown $USER:$USER nginx/ssl/*.pem
```

### Passo 5: Configurar Nginx para HTTPS

Edite o arquivo `nginx/conf.d/default.conf`:

```bash
nano nginx/conf.d/default.conf
```

Descomente e configure a seção HTTPS no final do arquivo. Veja o exemplo no arquivo.

### Passo 6: Reiniciar Serviços

```bash
# Reiniciar containers
docker compose -f docker-compose.prod.yml restart nginx

# Verificar logs
docker compose -f docker-compose.prod.yml logs nginx
```

### Passo 7: Configurar Renovação Automática

```bash
# Editar crontab
sudo crontab -e

# Adicionar linha para renovação automática (executa todo dia às 2h da manhã)
0 2 * * * certbot renew --quiet --deploy-hook "docker compose -f /opt/apps/SISTEMA2/docker-compose.prod.yml restart nginx"
```

---

## 📊 Monitoramento e Manutenção

### Comandos Úteis

```bash
# Ver logs em tempo real
docker compose -f docker-compose.prod.yml logs -f

# Ver logs de um serviço específico
docker compose -f docker-compose.prod.yml logs -f backend

# Ver uso de recursos
docker stats

# Ver status dos containers
docker compose -f docker-compose.prod.yml ps

# Reiniciar um serviço específico
docker compose -f docker-compose.prod.yml restart backend

# Parar todos os serviços
docker compose -f docker-compose.prod.yml down

# Parar e remover volumes (CUIDADO: apaga dados!)
docker compose -f docker-compose.prod.yml down -v
```

### Backup do Banco de Dados

```bash
# Tornar script executável
chmod +x scripts/backup-db.sh

# Executar backup manual
./scripts/backup-db.sh

# Configurar backup automático (crontab)
crontab -e

# Adicionar linha para backup diário às 3h da manhã
0 3 * * * /opt/apps/SISTEMA2/scripts/backup-db.sh >> /var/log/backup.log 2>&1
```

### Restaurar Banco de Dados

```bash
# Tornar script executável
chmod +x scripts/restore-db.sh

# Executar restauração
./scripts/restore-db.sh backups/backup_20240101_120000.sql.gz
```

### Atualizar Aplicação

```bash
# 1. Fazer backup do banco de dados
./scripts/backup-db.sh

# 2. Parar containers
docker compose -f docker-compose.prod.yml down

# 3. Atualizar código do GitHub
git pull origin main

# 4. Verificar se há novas migrations
git log --oneline --since="1 week ago" -- backend/src/main/resources/db/migration/

# 5. Reconstruir e iniciar
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# 6. Verificar logs (especialmente Flyway)
docker compose -f docker-compose.prod.yml logs -f backend | grep -i flyway

# 7. Verificar status das migrations
./scripts/check-migrations.sh
```

**💡 Importante:** Novas migrations do Flyway serão aplicadas automaticamente quando o backend iniciar. Sempre faça backup antes de atualizar!

---

## 🔧 Troubleshooting

### Problema: Container não inicia

```bash
# Ver logs detalhados
docker compose -f docker-compose.prod.yml logs nome_do_container

# Verificar se porta está em uso
sudo netstat -tulpn | grep :8080

# Verificar recursos disponíveis
free -h
df -h
```

### Problema: Banco de dados não conecta

```bash
# Verificar se PostgreSQL está rodando
docker compose -f docker-compose.prod.yml ps postgres

# Ver logs do PostgreSQL
docker compose -f docker-compose.prod.yml logs postgres

# Testar conexão manualmente
docker exec -it saude_postgres psql -U postgres -d saude_db
```

### Problema: Migrations não foram aplicadas

```bash
# Verificar logs do Flyway
docker compose -f docker-compose.prod.yml logs backend | grep -i flyway

# Verificar status das migrations
./scripts/check-migrations.sh

# Verificar se migrations existem no container
docker exec -it saude_backend ls -la /app/BOOT-INF/classes/db/migration/

# Se necessário, forçar reinicialização do backend
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml logs -f backend
```

### Problema: Frontend não carrega

```bash
# Verificar logs do frontend
docker compose -f docker-compose.prod.yml logs frontend

# Verificar se build foi feito corretamente
docker exec -it saude_frontend ls -la /app/dist

# Verificar variáveis de ambiente
docker exec -it saude_frontend env | grep VITE
```

### Problema: Nginx retorna 502 Bad Gateway

```bash
# Verificar logs do Nginx
docker compose -f docker-compose.prod.yml logs nginx

# Verificar se backend está acessível
docker exec -it saude_nginx wget -O- http://backend:8080/actuator/health

# Verificar configuração do Nginx
docker exec -it saude_nginx nginx -t
```

### Limpar Recursos Não Utilizados

```bash
# Remover containers parados
docker container prune -f

# Remover imagens não utilizadas
docker image prune -a -f

# Remover volumes não utilizados (CUIDADO!)
docker volume prune -f

# Limpeza completa (CUIDADO: remove tudo!)
docker system prune -a --volumes -f
```

---

## 📝 Checklist Final

Antes de considerar a migração completa, verifique:

- [ ] Todos os containers estão rodando (`docker compose ps`)
- [ ] Banco de dados está acessível
- [ ] Backend responde em `/actuator/health`
- [ ] Frontend carrega corretamente
- [ ] Nginx está funcionando como reverse proxy
- [ ] SSL/HTTPS está configurado (se aplicável)
- [ ] Backups automáticos estão configurados
- [ ] Firewall está configurado corretamente
- [ ] Logs estão sendo monitorados
- [ ] Domínio está apontando para a VPS

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker compose -f docker-compose.prod.yml logs`
2. Verifique o status: `docker compose -f docker-compose.prod.yml ps`
3. Verifique recursos: `docker stats`
4. Consulte a seção de Troubleshooting acima

---

## 📚 Recursos Adicionais

- [Documentação Docker](https://docs.docker.com/)
- [Documentação Docker Compose](https://docs.docker.com/compose/)
- [Documentação Nginx](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Última atualização:** 2024

