# 🚨 AÇÕES URGENTES DE SEGURANÇA - VPS

## ⚠️ PROBLEMA IDENTIFICADO

Você compartilhou suas credenciais de acesso ROOT publicamente. Isso é extremamente perigoso!

---

## 🔴 EXECUTE IMEDIATAMENTE (Nesta Ordem)

### 1. Mudar Senha do Root

```bash
# Conecte na VPS
ssh root@72.60.55.213

# Mude a senha IMEDIATAMENTE
passwd root
# Digite uma nova senha FORTE (mínimo 16 caracteres, com letras, números e símbolos)
```

### 2. Verificar Acessos Suspeitos

```bash
# Ver últimos logins
last -20

# Ver tentativas de login falhadas
lastb -20

# Ver usuários conectados atualmente
w

# Ver processos em execução
ps aux | head -20

# Ver conexões de rede ativas
netstat -tuln
```

### 3. Criar Usuário Não-Root (Mais Seguro)

```bash
# Criar novo usuário
adduser deploy
# Digite uma senha FORTE

# Adicionar ao grupo sudo
usermod -aG sudo deploy

# Testar acesso
su - deploy
sudo ls -la /root  # Deve pedir senha
exit
```

### 4. Configurar SSH com Chave Pública (Mais Seguro que Senha)

**No seu computador Windows (PowerShell):**

```powershell
# Gerar chave SSH (se ainda não tiver)
ssh-keygen -t ed25519 -C "seu-email@example.com"

# Copiar chave pública para VPS
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh root@72.60.55.213 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**Testar acesso sem senha:**
```powershell
ssh root@72.60.55.213
# Deve conectar SEM pedir senha
```

### 5. Desabilitar Login com Senha (Apenas Chave SSH)

**Na VPS:**
```bash
# Editar configuração SSH
nano /etc/ssh/sshd_config

# Alterar/adicionar estas linhas:
PasswordAuthentication no
PermitRootLogin prohibit-password
PubkeyAuthentication yes

# Salvar: Ctrl+O, Enter, Ctrl+X

# Reiniciar SSH
systemctl restart sshd
```

**⚠️ ATENÇÃO:** Antes de fazer isso, certifique-se que consegue logar com a chave SSH!

### 6. Configurar Firewall

```bash
# Habilitar UFW
ufw enable

# Permitir apenas portas necessárias
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS

# BLOQUEAR todo o resto
ufw default deny incoming
ufw default allow outgoing

# Verificar regras
ufw status numbered
```

### 7. Instalar Fail2Ban (Bloqueia Ataques de Força Bruta)

```bash
apt update
apt install -y fail2ban

# Configurar
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Editar
nano /etc/fail2ban/jail.local

# Procurar por [sshd] e alterar:
enabled = true
maxretry = 3
bantime = 3600

# Salvar e reiniciar
systemctl restart fail2ban
systemctl status fail2ban
```

---

## 🔍 AUDITORIA COMPLETA DA VPS

### Verificar o que já está instalado

```bash
# Serviços rodando
systemctl list-units --type=service --state=running

# Portas abertas
netstat -tuln

# Usuários do sistema
cat /etc/passwd | grep -v nologin | grep -v false

# Processos
ps aux --sort=-%mem | head -20

# Uso de disco
df -h

# Uso de RAM
free -h

# Versão do OS
cat /etc/os-release
```

### Verificar Docker (se instalado)

```bash
# Docker está instalado?
docker --version

# Containers rodando
docker ps -a

# Imagens
docker images

# Volumes
docker volume ls

# Redes
docker network ls
```

---

## 📋 CHECKLIST DE SEGURANÇA

Marque conforme for completando:

- [ ] Mudei a senha do root
- [ ] Verifiquei acessos suspeitos (comando `last`)
- [ ] Criei usuário não-root
- [ ] Configurei acesso SSH com chave pública
- [ ] Testei acesso SSH com chave (sem senha)
- [ ] Desabilitei login com senha no SSH
- [ ] Configurei firewall (UFW)
- [ ] Instalei Fail2Ban
- [ ] Auditei o que já está na VPS
- [ ] Documentei o que já existe na VPS

---

## 🎯 PRÓXIMOS PASSOS (Após Segurança)

Depois de completar o checklist acima, me informe:

1. ✅ "Segurança configurada"
2. 📋 O que já existe na VPS (Docker? Nginx? PostgreSQL?)
3. 🚀 Aí sim podemos prosseguir com o deploy do sistema!

---

## 💡 DICAS DE SEGURANÇA

### Senhas Fortes
- Mínimo 16 caracteres
- Misture: maiúsculas, minúsculas, números, símbolos
- Use gerenciador de senhas (Bitwarden, 1Password, etc)
- Nunca compartilhe senhas em conversas/emails

### Acesso SSH
- ✅ Usar chaves SSH (mais seguro)
- ❌ Evitar senhas
- ✅ Usar porta não-padrão (ex: 2222 em vez de 22)
- ✅ Usar Fail2Ban
- ❌ Nunca permitir root login com senha

### Firewall
- ✅ Bloquear tudo por padrão
- ✅ Abrir apenas o necessário
- ✅ Monitorar logs regularmente

---

**IMPORTANTE:** NÃO compartilhe credenciais em conversas, chats, emails ou qualquer lugar público!

**Última atualização:** 2025-11-15
