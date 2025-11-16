# 🚀 Deploy Automatizado via GitHub

Este guia mostra como configurar deploy automático da aplicação na VPS usando GitHub.

## 📋 Pré-requisitos

- ✅ Repositório no GitHub
- ✅ VPS com acesso SSH
- ✅ Docker e Docker Compose instalados na VPS
- ✅ Chave SSH configurada para acesso ao GitHub

## 🔑 Configurar Acesso SSH ao GitHub

### Passo 1: Gerar Chave SSH na VPS

```bash
# Conectar na VPS
ssh usuario@seu-ip-vps

# Gerar chave SSH (se ainda não tiver)
ssh-keygen -t ed25519 -C "seu-email@example.com"

# Exibir chave pública
cat ~/.ssh/id_ed25519.pub
```

### Passo 2: Adicionar Chave no GitHub

1. Acesse: https://github.com/settings/keys
2. Clique em "New SSH key"
3. Cole a chave pública
4. Salve

### Passo 3: Testar Conexão

```bash
# Na VPS, testar conexão SSH
ssh -T git@github.com

# Deve retornar: "Hi usuario! You've successfully authenticated..."
```

## 🔄 Configurar Deploy Automatizado

### Opção 1: Script de Deploy Manual (Recomendado para Início)

Crie um script simples para atualizar:

```bash
# Criar script de atualização
nano /opt/apps/SISTEMA2/scripts/update.sh
```

Conteúdo do script:

```bash
#!/bin/bash
set -e

cd /opt/apps/SISTEMA2

echo "=== Atualizando aplicação do GitHub ==="

# Backup do banco
./scripts/backup-db.sh

# Pull do GitHub
git pull origin main

# Rebuild e restart
docker compose -f docker-compose.prod.yml build --no-cache backend frontend
docker compose -f docker-compose.prod.yml up -d

# Verificar migrations
sleep 10
./scripts/check-migrations.sh

echo "=== Atualização concluída ==="
```

Tornar executável:
```bash
chmod +x /opt/apps/SISTEMA2/scripts/update.sh
```

Uso:
```bash
./scripts/update.sh
```

### Opção 2: GitHub Actions (CI/CD Automatizado)

Crie o arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Deploy to VPS
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USER }}
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd /opt/apps/SISTEMA2
          ./scripts/update.sh
```

**Configurar Secrets no GitHub:**

1. Acesse: https://github.com/seu-usuario/SISTEMA2/settings/secrets/actions
2. Adicione:
   - `VPS_HOST`: IP da sua VPS
   - `VPS_USER`: usuário SSH
   - `VPS_SSH_KEY`: chave SSH privada da VPS

### Opção 3: Webhook do GitHub (Avançado)

Para deploy automático via webhook, você precisaria de um servidor webhook na VPS. Isso é mais complexo e geralmente não é necessário.

## 📝 Fluxo de Trabalho Recomendado

### Desenvolvimento Local

```bash
# 1. Fazer alterações
git checkout -b feature/nova-funcionalidade

# 2. Criar migration (se necessário)
# Criar arquivo em backend/src/main/resources/db/migration/

# 3. Commit e push
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade
```

### Deploy na VPS

```bash
# 1. Conectar na VPS
ssh usuario@seu-ip-vps

# 2. Ir para diretório do projeto
cd /opt/apps/SISTEMA2

# 3. Atualizar do GitHub
git pull origin main

# 4. Executar script de atualização
./scripts/update.sh

# 5. Verificar logs
docker compose -f docker-compose.prod.yml logs -f
```

## 🔍 Verificar Migrations Após Deploy

```bash
# Verificar se novas migrations foram aplicadas
./scripts/check-migrations.sh

# Ver logs do Flyway
docker compose -f docker-compose.prod.yml logs backend | grep -i flyway
```

## ⚠️ Boas Práticas

1. **Sempre faça backup** antes de fazer deploy
2. **Teste localmente** antes de fazer push
3. **Use branches** para features grandes
4. **Revise migrations** antes de commit
5. **Monitore logs** após deploy
6. **Tenha plano de rollback** pronto

## 🚨 Rollback de Emergência

Se algo der errado após deploy:

```bash
# 1. Parar containers
docker compose -f docker-compose.prod.yml down

# 2. Voltar para commit anterior
git log --oneline  # Ver histórico
git checkout <commit-anterior>

# 3. Restaurar banco (se necessário)
./scripts/restore-db.sh backups/backup_antes_do_deploy.sql.gz

# 4. Reiniciar
docker compose -f docker-compose.prod.yml up -d
```

## 📚 Recursos Adicionais

- [GitHub SSH Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Docker Compose](https://docs.docker.com/compose/)

---

**Última atualização**: 2024

