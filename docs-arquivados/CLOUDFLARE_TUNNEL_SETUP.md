# Configuração do Cloudflare Tunnel

Este guia explica como configurar o Cloudflare Tunnel para expor sua aplicação para fora da rede local.

## Pré-requisitos

1. **Cloudflare Tunnel instalado**: Baixe em https://github.com/cloudflare/cloudflared/releases
2. **Conta Cloudflare**: Crie uma conta gratuita em https://cloudflare.com
3. **Aplicação rodando**: Certifique-se de que o backend e frontend estão funcionando localmente

## Passo a Passo

### 1. Instalar Cloudflare Tunnel

**Windows:**
```bash
# Baixe o arquivo .exe da página de releases
# Adicione ao PATH ou coloque na pasta do projeto
```

**Verificar instalação:**
```bash
cloudflared --version
```

### 2. Fazer Login no Cloudflare

```bash
cloudflared tunnel login
```

Isso abrirá o navegador para você fazer login na sua conta Cloudflare.

### 3. Criar um Tunnel

```bash
cloudflared tunnel create saude-sistema
```

### 4. Configurar o Tunnel

O arquivo `cloudflare-tunnel.yml` já está configurado com:

- **Frontend**: `saude-sistema.trycloudflare.com` → `http://localhost:4173`
- **Backend API**: `api-saude-sistema.trycloudflare.com` → `http://localhost:8080`

### 5. Iniciar a Aplicação

```bash
# Iniciar com Docker Compose
docker-compose up -d

# Aguardar inicialização (30 segundos)
```

### 6. Iniciar o Tunnel

**Opção 1 - Script Automático:**
```bash
# Windows
start-cloudflare-tunnel.bat

# PowerShell
.\start-cloudflare-tunnel.ps1
```

**Opção 2 - Manual:**
```bash
cloudflared tunnel --config cloudflare-tunnel.yml run
```

## URLs Públicas

Após iniciar o tunnel, você receberá URLs como:

- **Frontend**: `https://saude-sistema-xxxxx.trycloudflare.com`
- **Backend API**: `https://api-saude-sistema-xxxxx.trycloudflare.com`

## Solução de Problemas

### Erro 403 - Forbidden

**Causas comuns:**
1. **CORS mal configurado** - ✅ Já corrigido
2. **CSP muito restritivo** - ✅ Já corrigido
3. **Favicon não encontrado** - ✅ Já corrigido

### Erro de Conexão

1. **Verificar se a aplicação está rodando:**
   ```bash
   # Backend
   curl http://localhost:8080/health
   
   # Frontend
   curl http://localhost:4173
   ```

2. **Verificar logs do tunnel:**
   ```bash
   cloudflared tunnel --config cloudflare-tunnel.yml run --loglevel debug
   ```

### Problemas de CORS

Se ainda houver problemas de CORS, verifique:

1. **Backend** - Arquivo `SecurityConfig.java`:
   - Domínios permitidos incluem `*.trycloudflare.com` e `*.cloudflare.com`
   - Headers CORS configurados corretamente

2. **Frontend** - Arquivo `vite.config.ts`:
   - Host configurado como `0.0.0.0`
   - CORS habilitado

## Configurações de Segurança

### Headers de Segurança Ajustados

O sistema foi configurado para funcionar com Cloudflare Tunnel:

- **CSP**: Permite conexões com domínios Cloudflare
- **CORS**: Inclui domínios `*.trycloudflare.com` e `*.cloudflare.com`
- **Favicon**: Servido pelo backend para evitar 404

### Recursos Públicos

As seguintes rotas são acessíveis publicamente:
- `/favicon.ico` - Favicon da aplicação
- `/` - Página inicial da API
- `/health` - Health check
- `/api/auth/**` - Autenticação

## Monitoramento

### Logs do Tunnel

```bash
# Logs detalhados
cloudflared tunnel --config cloudflare-tunnel.yml run --loglevel debug

# Logs em arquivo
cloudflared tunnel --config cloudflare-tunnel.yml run > tunnel.log 2>&1
```

### Health Checks

```bash
# Backend
curl https://api-saude-sistema-xxxxx.trycloudflare.com/health

# Frontend
curl https://saude-sistema-xxxxx.trycloudflare.com
```

## Próximos Passos

1. **Testar acesso externo** - Acesse as URLs fornecidas pelo tunnel
2. **Configurar domínio personalizado** (opcional) - Use um domínio próprio
3. **Configurar SSL** - Cloudflare fornece SSL automático
4. **Monitorar performance** - Use as ferramentas do Cloudflare

## Suporte

Se encontrar problemas:

1. Verifique os logs do tunnel
2. Teste as URLs localmente primeiro
3. Verifique as configurações de CORS e CSP
4. Consulte a documentação do Cloudflare Tunnel

