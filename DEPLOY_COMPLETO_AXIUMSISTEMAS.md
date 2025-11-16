# 🚀 Deploy Completo - axiumsistemas.cloud

**Data:** 2025-11-15
**VPS IP:** 72.60.55.213
**Domínio:** axiumsistemas.cloud
**Sistema:** Debian 13, 16GB RAM, 197GB SSD

---

## 📋 ÍNDICE DO DEPLOY

1. [Configurar DNS do Domínio](#1-configurar-dns-do-domínio) ⏱️ 5-30 min (depende do DNS)
2. [Instalar Docker Compose](#2-instalar-docker-compose) ⏱️ 1 min
3. [Enviar Projeto para VPS](#3-enviar-projeto-para-vps) ⏱️ 3-5 min
4. [Configurar Variáveis de Ambiente](#4-configurar-variáveis-de-ambiente) ⏱️ 5 min
5. [Configurar Nginx](#5-configurar-nginx) ⏱️ 2 min
6. [Deploy Inicial (HTTP)](#6-deploy-inicial-http) ⏱️ 5-10 min
7. [Configurar SSL/HTTPS](#7-configurar-sslhttps) ⏱️ 5 min
8. [Testar Aplicação](#8-testar-aplicação) ⏱️ 2 min
9. [Configurar Renovação Automática SSL](#9-configurar-renovação-automática-ssl) ⏱️ 1 min
10. [Trocar Credenciais](#10-trocar-credenciais) ⏱️ 5 min

**Tempo Total:** ~40-60 minutos

---

## 1. 🌐 CONFIGURAR DNS DO DOMÍNIO

### Por que fazer isso PRIMEIRO?

O DNS demora 5-30 minutos para propagar. Vamos configurar agora e enquanto propaga, fazemos o resto!

### 1.1 Acessar Painel do Seu Provedor de Domínio

Vá até o painel onde você registrou **axiumsistemas.cloud** (ex: Registro.br, GoDaddy, Cloudflare, etc.)

### 1.2 Configurar Registros DNS

Adicione/edite estes registros:

```dns
Tipo: A
Nome: @
Valor: 72.60.55.213
TTL: 300 (ou menor possível)

Tipo: A
Nome: www
Valor: 72.60.55.213
TTL: 300
```

**Explicação:**
- `@` = domínio raiz (axiumsistemas.cloud)
- `www` = subdomínio www (www.axiumsistemas.cloud)
- `72.60.55.213` = IP da sua VPS
- `TTL 300` = 5 minutos (atualiza mais rápido)

### 1.3 Verificar Propagação

Aguarde 5-10 minutos e teste:

**No seu computador (PowerShell/CMD):**
```bash
nslookup axiumsistemas.cloud
```

**Resultado esperado:**
```
Server:  ...
Address:  ...

Name:    axiumsistemas.cloud
Address:  72.60.55.213
```

**✅ Se aparecer o IP correto (72.60.55.213), DNS está OK!**
**⏳ Se não aparecer, aguarde mais 10-20 minutos e teste novamente**

**📝 MARQUE AQUI quando DNS estiver OK:** [ ]

---

## 2. 🐳 INSTALAR DOCKER COMPOSE

### 2.1 Conectar na VPS

```bash
ssh root@72.60.55.213
```

### 2.2 Instalar Docker Compose

```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
chmod +x /usr/local/bin/docker-compose && \
docker-compose --version
```

**Resultado esperado:**
```
Docker Compose version v2.x.x
```

**✅ Se aparecer a versão, está OK!**

**📝 MARQUE AQUI quando instalado:** [ ]

---

## 3. 📦 ENVIAR PROJETO PARA VPS

### 3.1 Criar Diretório na VPS

**Na VPS:**
```bash
mkdir -p /opt/apps/SISTEMA2 && \
cd /opt/apps/SISTEMA2 && \
pwd
```

**Resultado esperado:**
```
/opt/apps/SISTEMA2
```

### 3.2 Enviar Projeto (Do Windows)

**No seu computador Windows (PowerShell):**

```powershell
# Ir para pasta do projeto
cd C:\Users\okdur\IdeaProjects\SISTEMA2

# Enviar tudo para VPS
scp -r * root@72.60.55.213:/opt/apps/SISTEMA2/
```

**⏳ Aguarde:** Pode demorar 3-5 minutos. Você verá vários arquivos sendo copiados.

### 3.3 Verificar Upload

**Na VPS:**
```bash
cd /opt/apps/SISTEMA2 && \
ls -la
```

**Resultado esperado:** Deve mostrar pastas `backend/`, `frontend/`, `scripts/`, etc.

**📝 MARQUE AQUI quando upload concluído:** [ ]

---

## 4. ⚙️ CONFIGURAR VARIÁVEIS DE AMBIENTE

### 4.1 Gerar Senhas Seguras

**Na VPS:**
```bash
echo "=== SENHAS GERADAS ===" && \
echo "PostgreSQL: $(openssl rand -base64 24)" && \
echo "JWT Secret: $(openssl rand -base64 32)" && \
echo "Redis: $(openssl rand -base64 24)"
```

**📋 COPIE as 3 senhas que aparecerem!** Vamos usar no próximo passo.

### 4.2 Criar Arquivo .env

**Na VPS:**
```bash
cd /opt/apps/SISTEMA2 && \
cat > .env << 'EOF'
# ============================================
# PRODUÇÃO - axiumsistemas.cloud
# ============================================

# POSTGRESQL
POSTGRES_DB=saude_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=COLE_SENHA_POSTGRESQL_AQUI
POSTGRES_PORT=5432

# REDIS
REDIS_PASSWORD=COLE_SENHA_REDIS_AQUI
REDIS_PORT=6379

# BACKEND
BACKEND_PORT=8080
SPRING_PROFILES_ACTIVE=prod

# JWT
JWT_SECRET=COLE_SENHA_JWT_AQUI
JWT_EXPIRATION=3600000

# LOGGING
LOGGING_APP_LEVEL=INFO
LOGGING_SECURITY_LEVEL=WARN

# FLYWAY
SPRING_FLYWAY_ENABLED=true
SPRING_FLYWAY_VALIDATE_ON_MIGRATE=true
SPRING_FLYWAY_OUT_OF_ORDER=false

# FRONTEND
FRONTEND_PORT=4173
VITE_API_URL=/api
NODE_ENV=production

# NGINX
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# DOMÍNIO
DOMAIN_NAME=axiumsistemas.cloud
EOF
```

### 4.3 Editar e Colar as Senhas

```bash
nano .env
```

**Substitua:**
- `COLE_SENHA_POSTGRESQL_AQUI` → Cole a senha do PostgreSQL
- `COLE_SENHA_JWT_AQUI` → Cole a senha JWT
- `COLE_SENHA_REDIS_AQUI` → Cole a senha Redis

**Salvar:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 4.4 Verificar Arquivo

```bash
cat .env | grep -v "^#" | grep -v "^$"
```

**Certifique-se que NÃO tem mais "COLE_SENHA"**

**📝 MARQUE AQUI quando .env configurado:** [ ]

---

## 5. 🌐 CONFIGURAR NGINX

### 5.1 Criar Diretórios Nginx

**Na VPS:**
```bash
cd /opt/apps/SISTEMA2 && \
mkdir -p nginx/conf.d nginx/ssl
```

### 5.2 Criar Configuração Nginx

```bash
cat > nginx/conf.d/default.conf << 'EOF'
# ============================================
# NGINX - axiumsistemas.cloud
# ============================================

# Upstream para Backend
upstream backend {
    server backend:8080;
}

# Upstream para Frontend
upstream frontend {
    server frontend:4173;
}

# ============================================
# HTTP (Porta 80)
# Redirecionamento para HTTPS será adicionado depois
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name axiumsistemas.cloud www.axiumsistemas.cloud;

    # Health check
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }

    # API - Backend
    location /api/ {
        proxy_pass http://backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffer
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Actuator - Backend
    location /actuator/ {
        proxy_pass http://backend/actuator/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Frontend - Todas as outras rotas
    location / {
        proxy_pass http://frontend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support (se necessário)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
}

# ============================================
# HTTPS (Porta 443) - SERÁ CONFIGURADO DEPOIS DO CERTBOT
# ============================================
# Esta seção será adicionada após obter certificado SSL
EOF
```

### 5.3 Criar nginx.conf Principal

```bash
cat > nginx/nginx.conf << 'EOF'
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout  65;
    types_hash_max_size 2048;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;

    # Incluir configurações dos sites
    include /etc/nginx/conf.d/*.conf;
}
EOF
```

**📝 MARQUE AQUI quando Nginx configurado:** [ ]

---

## 6. 🚀 DEPLOY INICIAL (HTTP)

### Por que fazer HTTP primeiro?

1. Testar se tudo funciona antes de adicionar SSL
2. Certbot precisa validar o domínio pela porta 80
3. Mais fácil debugar problemas sem SSL

### 6.1 Criar Diretórios Necessários

```bash
cd /opt/apps/SISTEMA2 && \
mkdir -p backups storage/documentos
```

### 6.2 Build das Imagens

```bash
docker-compose -f docker-compose.prod.yml build
```

**⏳ Aguarde:** 5-10 minutos. Você verá o build do backend e frontend.

### 6.3 Iniciar Containers

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 6.4 Verificar Containers

```bash
docker-compose -f docker-compose.prod.yml ps
```

**Resultado esperado:** Todos com status "Up" e "healthy"
```
NAME              STATUS
saude_postgres    Up (healthy)
saude_redis       Up (healthy)
saude_backend     Up (healthy)
saude_frontend    Up (healthy)
saude_nginx       Up (healthy)
```

### 6.5 Ver Logs do Backend (Migrations)

```bash
docker-compose -f docker-compose.prod.yml logs backend | grep -i flyway
```

**Procure por:**
- ✅ "Successfully validated X migrations"
- ✅ "Current version of schema"
- ✅ "Schema is up to date"

### 6.6 Testar Backend

```bash
curl http://localhost:8080/actuator/health
```

**Resultado esperado:** `{"status":"UP"}`

### 6.7 Testar Nginx

```bash
curl http://localhost/health
```

**Resultado esperado:** `OK`

### 6.8 Testar pelo Domínio (HTTP)

**No seu computador (navegador):**
```
http://axiumsistemas.cloud
```

**✅ Deve aparecer a tela de login do sistema!**

**Se não funcionar:**
```bash
# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

**📝 MARQUE AQUI quando aplicação funcionar via HTTP:** [ ]

---

## 7. 🔐 CONFIGURAR SSL/HTTPS

### 7.1 Instalar Certbot

```bash
apt update && \
apt install -y certbot python3-certbot-nginx
```

### 7.2 Parar Nginx Temporariamente

```bash
docker-compose -f docker-compose.prod.yml stop nginx
```

### 7.3 Obter Certificado SSL

```bash
certbot certonly --standalone \
  -d axiumsistemas.cloud \
  -d www.axiumsistemas.cloud \
  --non-interactive \
  --agree-tos \
  --email seu-email@example.com
```

**⚠️ IMPORTANTE:** Substitua `seu-email@example.com` pelo seu email real!

**Resultado esperado:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/axiumsistemas.cloud/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/axiumsistemas.cloud/privkey.pem
```

### 7.4 Copiar Certificados para Projeto

```bash
cp /etc/letsencrypt/live/axiumsistemas.cloud/fullchain.pem /opt/apps/SISTEMA2/nginx/ssl/ && \
cp /etc/letsencrypt/live/axiumsistemas.cloud/privkey.pem /opt/apps/SISTEMA2/nginx/ssl/ && \
chmod 644 /opt/apps/SISTEMA2/nginx/ssl/*.pem
```

### 7.5 Atualizar Configuração Nginx para HTTPS

```bash
cat > /opt/apps/SISTEMA2/nginx/conf.d/default.conf << 'EOF'
# ============================================
# NGINX - axiumsistemas.cloud COM SSL
# ============================================

# Upstream para Backend
upstream backend {
    server backend:8080;
}

# Upstream para Frontend
upstream frontend {
    server frontend:4173;
}

# ============================================
# HTTP (Porta 80) - REDIRECIONA PARA HTTPS
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name axiumsistemas.cloud www.axiumsistemas.cloud;

    # Redirecionar tudo para HTTPS
    return 301 https://$server_name$request_uri;
}

# ============================================
# HTTPS (Porta 443)
# ============================================
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name axiumsistemas.cloud www.axiumsistemas.cloud;

    # Certificados SSL
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Configurações SSL (Segurança)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Health check
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }

    # API - Backend
    location /api/ {
        proxy_pass http://backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffer
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Actuator - Backend
    location /actuator/ {
        proxy_pass http://backend/actuator/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Frontend - Todas as outras rotas
    location / {
        proxy_pass http://frontend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
}
EOF
```

### 7.6 Reiniciar Nginx

```bash
docker-compose -f docker-compose.prod.yml start nginx && \
docker-compose -f docker-compose.prod.yml logs nginx
```

**📝 MARQUE AQUI quando SSL configurado:** [ ]

---

## 8. ✅ TESTAR APLICAÇÃO

### 8.1 Testar HTTPS

**No navegador:**
```
https://axiumsistemas.cloud
```

**✅ Deve mostrar:**
- Cadeado verde/seguro
- Tela de login do sistema

### 8.2 Testar Redirecionamento HTTP → HTTPS

**No navegador:**
```
http://axiumsistemas.cloud
```

**✅ Deve redirecionar automaticamente para HTTPS**

### 8.3 Verificar Certificado

No navegador, clique no cadeado → Ver certificado

**✅ Deve mostrar:**
- Emitido por: Let's Encrypt
- Válido para: axiumsistemas.cloud
- Expira em: ~90 dias

### 8.4 Fazer Login

**Credenciais padrão:**
```
Usuário: admin.master
Senha: Admin@123
```

**✅ Deve fazer login com sucesso!**

**📝 MARQUE AQUI quando tudo funcionando:** [ ]

---

## 9. 🔄 CONFIGURAR RENOVAÇÃO AUTOMÁTICA SSL

### Por que isso é importante?

Certificados Let's Encrypt expiram em **90 dias**. Renovação automática evita que o site fique "inseguro".

### 9.1 Criar Script de Renovação

```bash
cat > /opt/apps/SISTEMA2/scripts/renovar-ssl.sh << 'EOF'
#!/bin/bash

# Parar Nginx
cd /opt/apps/SISTEMA2
docker-compose -f docker-compose.prod.yml stop nginx

# Renovar certificado
certbot renew --quiet

# Copiar novos certificados
cp /etc/letsencrypt/live/axiumsistemas.cloud/fullchain.pem /opt/apps/SISTEMA2/nginx/ssl/
cp /etc/letsencrypt/live/axiumsistemas.cloud/privkey.pem /opt/apps/SISTEMA2/nginx/ssl/
chmod 644 /opt/apps/SISTEMA2/nginx/ssl/*.pem

# Reiniciar Nginx
docker-compose -f docker-compose.prod.yml start nginx
EOF
```

### 9.2 Dar Permissão

```bash
chmod +x /opt/apps/SISTEMA2/scripts/renovar-ssl.sh
```

### 9.3 Configurar Cron (Renovação Automática)

```bash
crontab -e
```

**Adicione esta linha:**
```cron
0 2 * * * /opt/apps/SISTEMA2/scripts/renovar-ssl.sh >> /var/log/ssl-renew.log 2>&1
```

**Explicação:** Todo dia às 2h da manhã, tenta renovar o certificado.

**Salvar:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 9.4 Testar Renovação (Dry Run)

```bash
/opt/apps/SISTEMA2/scripts/renovar-ssl.sh
```

**Não deve dar erro!**

**📝 MARQUE AQUI quando renovação configurada:** [ ]

---

## 10. 🔒 TROCAR CREDENCIAIS (COMO PROMETIDO!)

### 10.1 Trocar Senha do Root

```bash
passwd root
```

Digite nova senha FORTE!

### 10.2 Trocar Senha do Admin.Master

**No navegador:**
1. Login como admin.master
2. Ir em Configurações/Perfil
3. Alterar senha para algo seguro

### 10.3 Trocar Senhas do .env (Opcional mas Recomendado)

Se quiser trocar as senhas do PostgreSQL/Redis/JWT:

```bash
# Gerar novas senhas
openssl rand -base64 32

# Editar .env
nano /opt/apps/SISTEMA2/.env

# Após editar, rebuild e restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

**⚠️ ATENÇÃO:** Isso vai resetar o banco! Só faça se for ANTES de ter dados importantes!

**📝 MARQUE AQUI quando credenciais trocadas:** [ ]

---

## 🎉 DEPLOY COMPLETO!

### ✅ Checklist Final

- [ ] DNS configurado e propagado
- [ ] Docker Compose instalado
- [ ] Projeto enviado para VPS
- [ ] Arquivo .env configurado
- [ ] Nginx configurado
- [ ] Containers rodando (HTTP)
- [ ] SSL instalado e funcionando
- [ ] HTTPS funcionando
- [ ] Renovação automática SSL configurada
- [ ] Credenciais trocadas
- [ ] Sistema acessível em https://axiumsistemas.cloud

---

## 📊 Comandos Úteis Pós-Deploy

### Ver Logs
```bash
cd /opt/apps/SISTEMA2
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Ver Status
```bash
docker-compose -f docker-compose.prod.yml ps
docker stats
```

### Reiniciar Serviço
```bash
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml restart nginx
```

### Parar Tudo
```bash
docker-compose -f docker-compose.prod.yml down
```

### Iniciar Tudo
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Ver Uso de Recursos
```bash
free -h
df -h
docker stats --no-stream
```

### Backup do Banco
```bash
docker exec saude_postgres pg_dump -U postgres saude_db | gzip > /opt/apps/SISTEMA2/backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

---

## 🆘 Troubleshooting

### Problema: Containers não iniciam
```bash
docker-compose -f docker-compose.prod.yml logs
```

### Problema: Erro de SSL
```bash
docker-compose -f docker-compose.prod.yml logs nginx
```

### Problema: Backend não conecta no banco
```bash
docker-compose -f docker-compose.prod.yml logs backend
docker exec -it saude_postgres psql -U postgres -d saude_db
```

### Problema: n8n parou de funcionar
```bash
docker ps -a | grep n8n
docker restart n8n
```

---

## 🎯 URLs Finais

- **Sistema Principal:** https://axiumsistemas.cloud
- **Backend Health:** https://axiumsistemas.cloud/api/actuator/health
- **n8n (já existia):** http://72.60.55.213:5678

---

**Data do Deploy:** _____/_____/_____
**Responsável:** _____________________
**Status:** ✅ Completo

---

**FIM DO GUIA**
