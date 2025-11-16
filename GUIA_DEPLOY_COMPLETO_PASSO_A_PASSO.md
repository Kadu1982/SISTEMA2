# 🚀 GUIA COMPLETO DE DEPLOY - axiumsistemas.cloud

**Data:** 2025-11-16
**VPS IP:** 72.60.55.213
**Domínio:** axiumsistemas.cloud
**Branch:** staging
**Repositório:** https://github.com/Kadu1982/SISTEMA2.git

---

## 📋 SITUAÇÃO ATUAL

✅ Docker instalado e rodando
✅ Projeto clonado em `/opt/apps/SISTEMA2`
✅ DNS configurado (axiumsistemas.cloud → 72.60.55.213)
✅ .env criado com senhas
✅ Diretórios criados

**FALTA FAZER:**
1. Build das imagens Docker
2. Iniciar containers
3. Configurar SSL
4. Automação de deploy

---

## 🎯 PASSO A PASSO COMPLETO

### **PASSO 1: Entrar no Diretório do Projeto**

```bash
cd /opt/apps/SISTEMA2
```

**Verificar:**
```bash
pwd
# Deve mostrar: /opt/apps/SISTEMA2
```

---

### **PASSO 2: Verificar .env**

```bash
cat .env
```

**Deve conter:**
```
POSTGRES_DB=saude_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=NV2Ck5F6sDjrDpgpbLTn3FjlQF30Lz5H
POSTGRES_PORT=5432
REDIS_PASSWORD=DrxPg4LAjDItgGZejRznYQLEzXC0Gmwx
...
```

**Se não existir, crie:**
```bash
nano .env
```

Cole o conteúdo:
```
POSTGRES_DB=saude_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=NV2Ck5F6sDjrDpgpbLTn3FjlQF30Lz5H
POSTGRES_PORT=5432
REDIS_PASSWORD=DrxPg4LAjDItgGZejRznYQLEzXC0Gmwx
REDIS_PORT=6379
BACKEND_PORT=8080
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=mHENQkJUPY1SGBX9LR9MDHpmGv24CX7cMKFge35aL7o=
JWT_EXPIRATION=3600000
LOGGING_APP_LEVEL=INFO
LOGGING_SECURITY_LEVEL=WARN
SPRING_FLYWAY_ENABLED=true
SPRING_FLYWAY_VALIDATE_ON_MIGRATE=true
SPRING_FLYWAY_OUT_OF_ORDER=false
FRONTEND_PORT=4173
VITE_API_URL=/api
NODE_ENV=production
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
DOMAIN_NAME=axiumsistemas.cloud
```

Salvar: `Ctrl+O` → `Enter` → `Ctrl+X`

---

### **PASSO 3: Verificar Arquivo docker-compose.prod.yml**

```bash
ls -la docker-compose.prod.yml
```

**Se não existir:**
```bash
nano docker-compose.prod.yml
```

Cole o conteúdo (veja no final deste guia na seção "ANEXOS").

---

### **PASSO 4: Build das Imagens (DEMORA 5-10 min)**

```bash
docker compose -f docker-compose.prod.yml build
```

**Aguarde:** Vai baixar dependências e compilar.

**Você verá:**
```
[+] Building 234.5s (45/45) FINISHED
 => [backend] downloading dependencies
 => [frontend] npm install
 => [backend] compiling...
```

**Quando terminar, voltará ao prompt sem erros.**

---

### **PASSO 5: Iniciar Containers**

```bash
docker compose -f docker-compose.prod.yml up -d
```

**Resultado esperado:**
```
[+] Running 5/5
 ✔ Container saude_postgres   Started
 ✔ Container saude_redis      Started
 ✔ Container saude_backend    Started
 ✔ Container saude_frontend   Started
 ✔ Container saude_nginx      Started
```

---

### **PASSO 6: Verificar Status dos Containers**

```bash
docker compose -f docker-compose.prod.yml ps
```

**Todos devem estar "Up" e "healthy":**
```
NAME              STATUS
saude_postgres    Up (healthy)
saude_redis       Up (healthy)
saude_backend     Up (healthy)
saude_frontend    Up (healthy)
saude_nginx       Up (healthy)
```

**Se algum não estiver healthy, aguarde 1-2 minutos e verifique novamente.**

---

### **PASSO 7: Ver Logs (Verificar Migrations)**

```bash
# Logs do backend (Flyway)
docker compose -f docker-compose.prod.yml logs backend | grep -i flyway

# Procure por:
# ✅ "Successfully validated X migrations"
# ✅ "Current version of schema"
# ✅ "Schema is up to date"
```

**Ver logs em tempo real:**
```bash
docker compose -f docker-compose.prod.yml logs -f
```

**Sair dos logs:** `Ctrl+C`

---

### **PASSO 8: Testar Backend**

```bash
curl http://localhost:8080/actuator/health
```

**Resultado esperado:**
```json
{"status":"UP"}
```

---

### **PASSO 9: Testar Frontend**

```bash
curl http://localhost:4173
```

**Deve retornar HTML da aplicação.**

---

### **PASSO 10: Testar Nginx**

```bash
curl http://localhost/health
```

**Resultado esperado:**
```
OK
```

---

### **PASSO 11: Testar pelo Domínio (HTTP)**

**No navegador do seu computador:**
```
http://axiumsistemas.cloud
```

**✅ Deve aparecer a tela de login!**

**Login padrão:**
```
Usuário: admin.master
Senha: Admin@123
```

---

## 🔐 CONFIGURAR SSL/HTTPS

### **PASSO 12: Instalar Certbot**

```bash
apt update
apt install -y certbot python3-certbot-nginx
```

---

### **PASSO 13: Parar Nginx Temporariamente**

```bash
docker compose -f docker-compose.prod.yml stop nginx
```

---

### **PASSO 14: Obter Certificado SSL**

**⚠️ IMPORTANTE: Substitua `seu-email@example.com` pelo seu email real!**

```bash
certbot certonly --standalone \
  -d axiumsistemas.cloud \
  -d www.axiumsistemas.cloud \
  --non-interactive \
  --agree-tos \
  --email seu-email@example.com
```

**Resultado esperado:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/axiumsistemas.cloud/fullchain.pem
Key is saved at: /etc/letsencrypt/live/axiumsistemas.cloud/privkey.pem
```

---

### **PASSO 15: Copiar Certificados**

```bash
cp /etc/letsencrypt/live/axiumsistemas.cloud/fullchain.pem /opt/apps/SISTEMA2/nginx/ssl/
cp /etc/letsencrypt/live/axiumsistemas.cloud/privkey.pem /opt/apps/SISTEMA2/nginx/ssl/
chmod 644 /opt/apps/SISTEMA2/nginx/ssl/*.pem
```

---

### **PASSO 16: Atualizar Configuração Nginx para HTTPS**

```bash
nano /opt/apps/SISTEMA2/nginx/conf.d/default.conf
```

**Substitua TODO o conteúdo por:**

```nginx
upstream backend {
    server backend:8080;
}

upstream frontend {
    server frontend:4173;
}

# HTTP - Redireciona para HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name axiumsistemas.cloud www.axiumsistemas.cloud;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name axiumsistemas.cloud www.axiumsistemas.cloud;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }

    location /api/ {
        proxy_pass http://backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /actuator/ {
        proxy_pass http://backend/actuator/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://frontend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Salvar:** `Ctrl+O` → `Enter` → `Ctrl+X`

---

### **PASSO 17: Reiniciar Nginx**

```bash
docker compose -f docker-compose.prod.yml start nginx
docker compose -f docker-compose.prod.yml logs nginx
```

**Verificar se não tem erros nos logs.**

---

### **PASSO 18: Testar HTTPS**

**No navegador:**
```
https://axiumsistemas.cloud
```

**✅ Deve mostrar:**
- Cadeado verde/seguro
- Tela de login

---

### **PASSO 19: Configurar Renovação Automática SSL**

```bash
nano /opt/apps/SISTEMA2/scripts/renovar-ssl.sh
```

**Cole:**
```bash
#!/bin/bash
cd /opt/apps/SISTEMA2
docker compose -f docker-compose.prod.yml stop nginx
certbot renew --quiet
cp /etc/letsencrypt/live/axiumsistemas.cloud/fullchain.pem /opt/apps/SISTEMA2/nginx/ssl/
cp /etc/letsencrypt/live/axiumsistemas.cloud/privkey.pem /opt/apps/SISTEMA2/nginx/ssl/
chmod 644 /opt/apps/SISTEMA2/nginx/ssl/*.pem
docker compose -f docker-compose.prod.yml start nginx
```

**Salvar e dar permissão:**
```bash
chmod +x /opt/apps/SISTEMA2/scripts/renovar-ssl.sh
```

**Configurar cron:**
```bash
crontab -e
```

**Adicionar:**
```
0 2 * * * /opt/apps/SISTEMA2/scripts/renovar-ssl.sh >> /var/log/ssl-renew.log 2>&1
```

**Salvar:** `Ctrl+O` → `Enter` → `Ctrl+X`

---

## 🤖 AUTOMAÇÃO DE DEPLOY (GitHub Actions)

### **PASSO 20: Criar GitHub Action**

**No seu computador local (Windows), crie:**

```
.github/workflows/deploy-vps.yml
```

**Conteúdo:**

```yaml
name: Deploy to VPS

on:
  push:
    branches:
      - staging

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Deploy via SSH
      uses: appleboy/ssh-action@master
      with:
        host: 72.60.55.213
        username: root
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd /opt/apps/SISTEMA2
          git pull origin staging
          docker compose -f docker-compose.prod.yml build
          docker compose -f docker-compose.prod.yml up -d
          docker compose -f docker-compose.prod.yml logs --tail=50
```

---

### **PASSO 21: Configurar SSH Key no GitHub**

**Na VPS, gerar chave SSH:**
```bash
ssh-keygen -t ed25519 -C "deploy@axiumsistemas.cloud" -f ~/.ssh/deploy_key -N ""
cat ~/.ssh/deploy_key
```

**Copie a chave PRIVADA que aparecer (começa com `-----BEGIN`).**

**No GitHub:**
1. Vá em: `Settings` → `Secrets and variables` → `Actions`
2. Clique em `New repository secret`
3. Nome: `VPS_SSH_KEY`
4. Value: Cole a chave privada
5. Salvar

---

### **PASSO 22: Autorizar Chave Pública na VPS**

**Na VPS:**
```bash
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

### **PASSO 23: Testar Automação**

**No seu computador local:**

1. Faça uma mudança qualquer no código
2. Commit e push:
```bash
git add .
git commit -m "test: deploy automation"
git push origin staging
```

3. Vá no GitHub → Actions
4. Veja o deploy acontecendo automaticamente!

---

## 📊 COMANDOS ÚTEIS

### Ver Status
```bash
cd /opt/apps/SISTEMA2
docker compose -f docker-compose.prod.yml ps
docker stats --no-stream
```

### Ver Logs
```bash
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
```

### Reiniciar Serviço
```bash
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart frontend
docker compose -f docker-compose.prod.yml restart nginx
```

### Atualizar Aplicação Manualmente
```bash
cd /opt/apps/SISTEMA2
git pull origin staging
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Parar Tudo
```bash
docker compose -f docker-compose.prod.yml down
```

### Iniciar Tudo
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Backup do Banco
```bash
docker exec saude_postgres pg_dump -U postgres saude_db | gzip > /opt/apps/SISTEMA2/backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restaurar Backup
```bash
gunzip < backup.sql.gz | docker exec -i saude_postgres psql -U postgres -d saude_db
```

---

## 🔧 TROUBLESHOOTING

### Container não inicia
```bash
docker compose -f docker-compose.prod.yml logs nome_do_container
docker compose -f docker-compose.prod.yml restart nome_do_container
```

### Backend não conecta no banco
```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs backend

# Testar conexão direta
docker exec -it saude_postgres psql -U postgres -d saude_db
```

### Frontend não carrega
```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs frontend

# Verificar se backend está acessível
docker exec -it saude_frontend curl http://backend:8080/actuator/health
```

### Nginx retorna 502
```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs nginx

# Testar backend
curl http://localhost:8080/actuator/health
```

### Migrations não foram aplicadas
```bash
# Ver logs do Flyway
docker compose -f docker-compose.prod.yml logs backend | grep -i flyway

# Reiniciar backend
docker compose -f docker-compose.prod.yml restart backend
```

### n8n parou de funcionar
```bash
docker ps -a | grep n8n
docker restart n8n
```

### Limpar Docker (cuidado!)
```bash
# Remover containers parados
docker container prune -f

# Remover imagens não usadas
docker image prune -a -f

# ATENÇÃO: Não use 'docker volume prune' pois apaga dados do banco!
```

---

## 📝 CHECKLIST FINAL

- [ ] Docker rodando
- [ ] Projeto clonado em /opt/apps/SISTEMA2
- [ ] .env configurado com senhas
- [ ] Build das imagens concluído
- [ ] Containers rodando (todos healthy)
- [ ] Aplicação acessível via HTTP
- [ ] SSL/HTTPS configurado
- [ ] Aplicação acessível via HTTPS
- [ ] Renovação automática SSL configurada
- [ ] GitHub Actions configurado
- [ ] Teste de deploy automático funcionando
- [ ] Backup do banco configurado

---

## 🆘 CONTATOS DE EMERGÊNCIA

**Se algo der errado:**

1. Ver logs: `docker compose -f docker-compose.prod.yml logs -f`
2. Ver status: `docker compose -f docker-compose.prod.yml ps`
3. Reiniciar: `docker compose -f docker-compose.prod.yml restart`
4. Último recurso: `docker compose -f docker-compose.prod.yml down && docker compose -f docker-compose.prod.yml up -d`

---

## 📚 ANEXOS

### Arquivo nginx/nginx.conf

```nginx
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

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;

    include /etc/nginx/conf.d/*.conf;
}
```

---

## ✅ FIM DO GUIA

**Deploy concluído com sucesso!**

**URLs Finais:**
- Sistema: https://axiumsistemas.cloud
- Backend Health: https://axiumsistemas.cloud/api/actuator/health
- n8n: http://72.60.55.213:5678

**Credenciais padrão:**
- Usuário: admin.master
- Senha: Admin@123

**⚠️ LEMBRE-SE: Troque a senha após o primeiro login!**

---

**Última atualização:** 2025-11-16
**Versão:** 1.0
