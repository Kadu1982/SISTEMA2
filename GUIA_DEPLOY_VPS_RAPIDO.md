# 🚀 Guia Rápido - Deploy na VPS

## ✅ Pré-requisitos

- VPS com Ubuntu 20.04+ (mínimo: 2 CPUs, 4GB RAM, 20GB SSD)
- Acesso SSH à VPS
- IP público da VPS

---

## 📦 PASSO 1: Preparar sua VPS (Execute na VPS)

### 1.1 Conectar na VPS

```bash
ssh root@SEU_IP_VPS
# ou
ssh usuario@SEU_IP_VPS
```

### 1.2 Instalar Docker (um comando só)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh && \
sudo sh get-docker.sh && \
sudo usermod -aG docker $USER && \
rm get-docker.sh && \
docker --version
```

**⚠️ IMPORTANTE:** Após instalar o Docker, faça logout e login novamente:
```bash
exit
# Conecte novamente
ssh root@SEU_IP_VPS
```

### 1.3 Instalar Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
sudo chmod +x /usr/local/bin/docker-compose && \
docker-compose --version
```

### 1.4 Configurar Firewall

```bash
sudo ufw enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw status
```

---

## 📂 PASSO 2: Enviar Projeto para VPS

### Opção A: Usando Git (Recomendado)

**Na VPS:**
```bash
mkdir -p /opt/apps
cd /opt/apps
git clone https://github.com/SEU_USUARIO/SISTEMA2.git
cd SISTEMA2
```

### Opção B: Usando SCP (do seu computador Windows)

**No seu computador (PowerShell ou CMD):**
```bash
scp -r C:\Users\okdur\IdeaProjects\SISTEMA2 root@SEU_IP_VPS:/opt/apps/
```

---

## ⚙️ PASSO 3: Configurar Variáveis de Ambiente (Execute na VPS)

```bash
cd /opt/apps/SISTEMA2

# Copiar arquivo de produção
cp .env.production .env

# Editar arquivo
nano .env
```

**Configure estas 3 variáveis OBRIGATÓRIAS:**

```env
POSTGRES_PASSWORD=SuaSenhaSuperSeguraAqui123!@#
JWT_SECRET=SuaChaveJwtSuperSecretaAquiComMaisDe32Caracteres123!@#
REDIS_PASSWORD=SuaSenhaRedisAqui123!@#
```

**💡 Dica:** Gere senhas seguras com:
```bash
openssl rand -base64 32
```

Pressione `Ctrl+O` (salvar), `Enter`, `Ctrl+X` (sair)

---

## 🚀 PASSO 4: Deploy! (Execute na VPS)

### 4.1 Executar Script Automatizado

```bash
chmod +x scripts/deploy.sh
sudo ./scripts/deploy.sh
```

**OU Deploy Manual:**

```bash
# Criar diretórios
mkdir -p backups storage/documentos nginx/ssl nginx/conf.d

# Build e iniciar
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## ✅ PASSO 5: Verificar se Funcionou

### 5.1 Verificar Containers

```bash
docker-compose -f docker-compose.prod.yml ps
```

**Todos devem estar "Up" e "healthy":**
- ✅ saude_postgres
- ✅ saude_redis
- ✅ saude_backend
- ✅ saude_frontend
- ✅ saude_nginx

### 5.2 Testar Backend

```bash
curl http://localhost:8080/actuator/health
```

**Resposta esperada:** `{"status":"UP"}`

### 5.3 Testar Frontend

```bash
curl http://localhost:4173
```

**Resposta esperada:** HTML da aplicação

### 5.4 Testar via Navegador

Abra no seu navegador:
```
http://SEU_IP_VPS
```

**Você deve ver a tela de login do sistema!**

---

## 🔍 PASSO 6: Verificar Migrations do Flyway

```bash
# Ver logs do Flyway
docker-compose -f docker-compose.prod.yml logs backend | grep -i flyway

# Você deve ver linhas como:
# ✅ Flyway Community Edition 9.x.x
# ✅ Successfully validated X migrations
# ✅ Current version of schema "public": 999999999999 (baseline)
# ✅ Schema "public" is up to date. No migration necessary.
```

**Se vir erros de migration:**
```bash
# Reiniciar backend
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml logs -f backend
```

---

## 📊 Comandos Úteis

### Ver Logs em Tempo Real
```bash
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
docker-compose -f docker-compose.prod.yml restart frontend
```

### Parar Tudo
```bash
docker-compose -f docker-compose.prod.yml down
```

### Reiniciar Tudo
```bash
docker-compose -f docker-compose.prod.yml restart
```

---

## 🔧 Troubleshooting

### Backend não inicia

```bash
# Ver logs detalhados
docker-compose -f docker-compose.prod.yml logs backend

# Verificar se PostgreSQL está rodando
docker-compose -f docker-compose.prod.yml ps postgres

# Reiniciar backend
docker-compose -f docker-compose.prod.yml restart backend
```

### Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está acessível
docker exec -it saude_backend ping -c 3 postgres

# Testar conexão direta
docker exec -it saude_postgres psql -U postgres -d saude_db -c "SELECT 1;"
```

### Frontend não carrega

```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs frontend

# Verificar se backend está acessível
docker exec -it saude_frontend curl http://backend:8080/actuator/health
```

### Nginx retorna 502

```bash
# Verificar logs do Nginx
docker-compose -f docker-compose.prod.yml logs nginx

# Testar conectividade
docker exec -it saude_nginx wget -O- http://backend:8080/actuator/health
```

---

## 🔐 PASSO 7: Configurar SSL (Opcional mas Recomendado)

### 7.1 Ter um Domínio

Configure no seu provedor de domínio:
```
Tipo: A
Nome: @
Valor: SEU_IP_VPS
```

### 7.2 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.3 Obter Certificado

```bash
# Parar Nginx temporariamente
docker-compose -f docker-compose.prod.yml stop nginx

# Obter certificado
sudo certbot certonly --standalone -d seudominio.com.br -d www.seudominio.com.br

# Copiar certificados
sudo cp /etc/letsencrypt/live/seudominio.com.br/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/seudominio.com.br/privkey.pem nginx/ssl/
sudo chmod 644 nginx/ssl/*.pem

# Reiniciar Nginx
docker-compose -f docker-compose.prod.yml start nginx
```

### 7.4 Renovação Automática

```bash
sudo crontab -e
# Adicionar linha:
0 2 * * * certbot renew --quiet --deploy-hook "docker-compose -f /opt/apps/SISTEMA2/docker-compose.prod.yml restart nginx"
```

---

## 📦 Backup Automático

```bash
# Criar script de backup
chmod +x scripts/backup-db.sh

# Configurar backup diário
crontab -e
# Adicionar:
0 3 * * * /opt/apps/SISTEMA2/scripts/backup-db.sh >> /var/log/backup.log 2>&1
```

---

## 🎯 Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Containers estão rodando: `docker-compose -f docker-compose.prod.yml ps`
- [ ] Backend responde: `curl http://localhost:8080/actuator/health`
- [ ] Frontend carrega: `curl http://localhost:4173`
- [ ] Aplicação acessível pelo IP: `http://SEU_IP_VPS`
- [ ] Migrations aplicadas: verificar logs do Flyway
- [ ] Firewall configurado: `sudo ufw status`
- [ ] Senhas alteradas no .env
- [ ] Backup configurado (opcional)
- [ ] SSL configurado (opcional)

---

## 🆘 Precisa de Ajuda?

### Ver Logs Completos
```bash
cd /opt/apps/SISTEMA2
docker-compose -f docker-compose.prod.yml logs --tail=100 > logs.txt
cat logs.txt
```

### Status de Tudo
```bash
docker-compose -f docker-compose.prod.yml ps
docker stats --no-stream
df -h
free -h
```

---

## 📝 Login Padrão

Após deploy bem-sucedido, use:

```
Usuário: admin.master
Senha: Admin@123
```

**⚠️ IMPORTANTE:** Altere a senha do admin.master após o primeiro login!

---

**Última atualização:** 2025-11-15
**Versão:** 1.0
