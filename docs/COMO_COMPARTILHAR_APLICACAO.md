# 🌐 Como Compartilhar sua Aplicação via Web

> **Guia completo passo a passo para compartilhar sua aplicação localmente via Cloudflare Tunnel usando PowerShell**

[![Status](https://img.shields.io/badge/Status-Funcionando-success)](https://github.com)
[![Windows](https://img.shields.io/badge/Windows-10%2B-blue)](https://www.microsoft.com/windows)
[![PowerShell](https://img.shields.io/badge/PowerShell-5.1%2B-blue)](https://docs.microsoft.com/powershell)

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação do Cloudflare Tunnel](#-instalação-do-cloudflare-tunnel)
- [Passo a Passo Detalhado](#-passo-a-passo-detalhado)
- [Executando via PowerShell](#-executando-via-powershell)
- [Verificação e Testes](#-verificação-e-testes)
- [Solução de Problemas](#-solução-de-problemas)
- [Monitoramento](#-monitoramento)
- [Parar o Tunnel](#-parar-o-tunnel)

---

## 🎯 Visão Geral

Este guia explica como compartilhar sua aplicação Spring Boot + React localmente através da internet usando **Cloudflare Tunnel**. A solução permite que qualquer pessoa acesse sua aplicação através de uma URL pública temporária, sem necessidade de configurar firewall ou roteador.

### O que você vai precisar:

- ✅ Backend Spring Boot rodando (porta 8080)
- ✅ Frontend React/Vite rodando (porta 5173)
- ✅ Cloudflare Tunnel (cloudflared) instalado
- ✅ PowerShell ou Terminal do Windows

### O que será criado:

- 🌐 URL pública temporária (ex: `https://abc-123.trycloudflare.com`)
- 🔒 Conexão segura via HTTPS
- ⚡ Acesso rápido e simples

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

### 1. ✅ Backend Spring Boot Rodando

O backend deve estar rodando na porta **8080**.

#### Opção A: Via IntelliJ IDEA (Recomendado)

1. Abra o projeto no IntelliJ IDEA
2. Localize o arquivo: `backend/src/main/java/com/sistemadesaude/backend/BackendApplication.java`
3. Clique com o botão direito no arquivo
4. Selecione: **Run 'BackendApplication'**
5. Aguarde a mensagem: `Started BackendApplication in X seconds`

#### Opção B: Via PowerShell

Abra o PowerShell na raiz do projeto e execute:

```powershell
# Navegar para a pasta do backend
cd backend

# Executar o Spring Boot
.\mvnw.cmd spring-boot:run
```

**Saída esperada:**
```
[INFO] Starting BackendApplication...
[INFO] Started BackendApplication in 15.234 seconds
```

#### Verificar se o Backend está Rodando

Em um novo terminal PowerShell, execute:

```powershell
# Verificar se o backend está respondendo
Invoke-WebRequest -Uri "http://localhost:8080/health" -Method GET
```

**Saída esperada:**
```
StatusCode        : 200
StatusDescription : OK
Content           : OK
```

Ou usando `curl` (se disponível):

```powershell
curl http://localhost:8080/health
```

**Saída esperada:**
```
OK
```

### 2. ✅ Frontend React/Vite (Será iniciado pelo script)

O frontend será iniciado automaticamente pelo script de compartilhamento. Não é necessário iniciá-lo manualmente.

### 3. ✅ Banco de Dados PostgreSQL

O PostgreSQL deve estar rodando e conectado ao backend.

**Verificar PostgreSQL:**
```powershell
# Verificar se o PostgreSQL está rodando
Get-Service -Name "postgresql*" | Select-Object Name, Status
```

---

## 🔧 Instalação do Cloudflare Tunnel

### Passo 1: Verificar se já está Instalado

Abra o PowerShell e execute:

```powershell
# Verificar se o cloudflared está instalado
cloudflared --version
```

**Se aparecer uma versão**, você já tem instalado! Pule para a próxima seção.

**Se aparecer erro**, continue com a instalação abaixo.

### Passo 2: Instalar via Winget (Recomendado)

```powershell
# Instalar Cloudflare Tunnel via winget
winget install --id Cloudflare.cloudflared
```

**Saída esperada:**
```
Found Cloudflare Tunnel [Cloudflare.cloudflared]
This application is licensed to you by its owner.
...
Successfully installed!
```

### Passo 3: Verificar Instalação

Após a instalação, **feche e reabra o PowerShell** e execute:

```powershell
# Verificar instalação
cloudflared --version
```

**Saída esperada:**
```
cloudflared version 2024.X.X (built YYYY-MM-DD)
```

### Passo 4: Instalação Manual (Alternativa)

Se o `winget` não funcionar:

1. Acesse: https://github.com/cloudflare/cloudflared/releases
2. Baixe o arquivo `cloudflared-windows-amd64.exe`
3. Renomeie para `cloudflared.exe`
4. Coloque na pasta do projeto ou adicione ao PATH do Windows

---

## 🚀 Passo a Passo Detalhado

### Método 1: Script Automático (RECOMENDADO)

Este é o método mais simples e completo. O script faz tudo automaticamente.

#### Passo 1: Abrir PowerShell na Raiz do Projeto

1. Abra o **PowerShell** ou **Terminal do Windows**
2. Navegue até a raiz do projeto:

```powershell
# Navegar para a pasta do projeto
cd C:\Users\okdur\IdeaProjects\SISTEMA2

# Verificar se está na pasta correta
Get-Location
```

**Saída esperada:**
```
Path
----
C:\Users\okdur\IdeaProjects\SISTEMA2
```

#### Passo 2: Verificar se o Backend está Rodando

Antes de executar o script, certifique-se de que o backend está rodando:

```powershell
# Verificar backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend está rodando!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend NÃO está rodando!" -ForegroundColor Red
    Write-Host "Inicie o backend primeiro antes de continuar." -ForegroundColor Yellow
    exit 1
}
```

**Se o backend não estiver rodando**, inicie-o primeiro (veja seção Pré-requisitos).

#### Passo 3: Executar o Script de Compartilhamento

Execute o script principal:

```powershell
# Executar script de compartilhamento
.\compartilhar-aplicacao-final-v2.bat
```

**O que o script faz:**

1. ✅ Verifica dependências (cloudflared, node.js)
2. ✅ Verifica se o backend está respondendo
3. ✅ Limpa processos antigos (node, cloudflared)
4. ✅ Instala dependências do Playwright (se necessário)
5. ✅ Inicia o frontend em uma janela separada
6. ✅ Executa testes automatizados
7. ✅ Cria o Cloudflare Tunnel em outra janela

**Saída esperada no terminal:**
```
============================================
  COMPARTILHAR APLICACAO - VERSAO FINAL
  (Com correcoes para Cloudflare Tunnel)
============================================

[1/5] Verificando backend...
[OK] Backend funcionando

[2/5] Limpando processos antigos...

[3/5] Instalando dependencias do Playwright...

[4/5] Iniciando frontend com configuracao de tunnel...
[OK] Frontend funcionando

[5/5] Testando aplicacao e criando tunnel...
Executando testes automatizados...

Criando Cloudflare Tunnel...
Aguarde a URL aparecer na janela "Cloudflare Tunnel"...

============================================
  APLICACAO COMPARTILHAVEL COM SUCESSO!
============================================
```

#### Passo 4: Aguardar a URL do Tunnel

O script abrirá **duas janelas**:

1. **Janela "Frontend"** - Servidor frontend rodando
2. **Janela "Cloudflare Tunnel"** - Tunnel sendo criado

**Na janela "Cloudflare Tunnel"**, você verá algo como:

```
+--------------------------------------------------------------------------------------------+
| Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
| https://abc-123-xyz-456.trycloudflare.com                                                 |
+--------------------------------------------------------------------------------------------+
```

**⏱️ Aguarde:** Pode levar de 10 a 30 segundos para a URL aparecer.

#### Passo 5: Copiar a URL

1. **Localize a URL** na janela "Cloudflare Tunnel"
2. **Copie a URL completa** (ex: `https://abc-123-xyz-456.trycloudflare.com`)
3. **Compartilhe** com quem precisa acessar

**Exemplo de URL:**
```
https://abc-123-xyz-456.trycloudflare.com
```

#### Passo 6: Testar o Acesso

1. **Abra o navegador** (Chrome, Firefox, Edge, etc.)
2. **Cole a URL** na barra de endereços
3. **Pressione Enter**
4. **Aguarde** a página carregar (pode levar alguns segundos na primeira vez)

**Credenciais de teste:**
- **Login:** `admin.master`
- **Senha:** `Admin@123`
- **Unidade:** `UBS - Unidade Básica de Saúde`

---

### Método 2: Script Simples e Rápido

Se preferir um script mais simples (sem testes automatizados):

```powershell
# Executar script simples
.\iniciar-tunnel-completo.bat
```

Este script faz:
- ✅ Verifica se o backend está rodando
- ✅ Inicia o frontend
- ✅ Cria o Cloudflare Tunnel

---

## 💻 Executando via PowerShell

Se preferir executar os comandos manualmente via PowerShell, siga os passos abaixo:

### Passo 1: Verificar Backend

```powershell
# Verificar se backend está rodando
$backendStatus = try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method GET -TimeoutSec 5
    $true
} catch {
    $false
}

if ($backendStatus) {
    Write-Host "✅ Backend está rodando" -ForegroundColor Green
} else {
    Write-Host "❌ Backend NÃO está rodando. Inicie primeiro!" -ForegroundColor Red
    exit 1
}
```

### Passo 2: Limpar Processos Antigos

```powershell
# Parar processos Node.js antigos
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Parar processos Cloudflared antigos
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "✅ Processos antigos limpos" -ForegroundColor Green
```

### Passo 3: Iniciar Frontend

```powershell
# Navegar para pasta frontend
cd frontend

# Iniciar frontend com configuração de tunnel
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx vite --config vite.config.tunnel.ts"

# Voltar para raiz
cd ..

# Aguardar frontend iniciar
Start-Sleep -Seconds 15

# Verificar se frontend está rodando
$frontendStatus = try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    $true
} catch {
    $false
}

if ($frontendStatus) {
    Write-Host "✅ Frontend está rodando" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend não conseguiu iniciar" -ForegroundColor Red
    exit 1
}
```

### Passo 4: Criar Cloudflare Tunnel

```powershell
# Criar tunnel para frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cloudflared tunnel --url http://localhost:5173"

Write-Host "✅ Cloudflare Tunnel criado" -ForegroundColor Green
Write-Host "📋 Aguarde a URL aparecer na janela 'Cloudflare Tunnel'" -ForegroundColor Yellow
```

### Passo 5: Aguardar URL

Aguarde a URL aparecer na janela "Cloudflare Tunnel" (pode levar 10-30 segundos).

---

## ✅ Verificação e Testes

### Verificar Status dos Serviços

Execute os comandos abaixo para verificar se tudo está funcionando:

```powershell
# Verificar Backend
Write-Host "🔍 Verificando Backend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method GET
    Write-Host "✅ Backend: OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend: ERRO" -ForegroundColor Red
}

# Verificar Frontend
Write-Host "🔍 Verificando Frontend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET
    Write-Host "✅ Frontend: OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend: ERRO" -ForegroundColor Red
}

# Verificar Processos
Write-Host "🔍 Verificando Processos..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
$cloudflaredProcesses = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "✅ Node.js: $($nodeProcesses.Count) processo(s) rodando" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js: Nenhum processo encontrado" -ForegroundColor Red
}

if ($cloudflaredProcesses) {
    Write-Host "✅ Cloudflared: $($cloudflaredProcesses.Count) processo(s) rodando" -ForegroundColor Green
} else {
    Write-Host "❌ Cloudflared: Nenhum processo encontrado" -ForegroundColor Red
}
```

### Testar Acesso Local

Antes de testar via tunnel, teste localmente:

```powershell
# Testar backend local
Write-Host "🧪 Testando Backend Local..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method GET
    Write-Host "✅ Backend local: Funcionando" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend local: Não está respondendo" -ForegroundColor Red
}

# Testar frontend local
Write-Host "🧪 Testando Frontend Local..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET
    Write-Host "✅ Frontend local: Funcionando" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend local: Não está respondendo" -ForegroundColor Red
}
```

### Testar Acesso via Tunnel

1. **Copie a URL** da janela "Cloudflare Tunnel"
2. **Abra o navegador**
3. **Cole a URL** e pressione Enter
4. **Aguarde** a página carregar
5. **Teste o login** com as credenciais:
   - Login: `admin.master`
   - Senha: `Admin@123`

---

## 🔧 Solução de Problemas

### ❌ Erro: "Cloudflared não encontrado"

**Problema:** O comando `cloudflared` não é reconhecido.

**Solução:**

```powershell
# Instalar via winget
winget install --id Cloudflare.cloudflared

# Fechar e reabrir PowerShell
# Verificar instalação
cloudflared --version
```

**Se ainda não funcionar:**

1. Baixe manualmente: https://github.com/cloudflare/cloudflared/releases
2. Extraia o arquivo `cloudflared.exe`
3. Coloque na pasta do projeto ou adicione ao PATH

---

### ❌ Erro: "Backend não está respondendo"

**Problema:** O script não consegue conectar ao backend na porta 8080.

**Soluções:**

#### 1. Verificar se o Backend está Rodando

```powershell
# Verificar se há processo Java rodando
Get-Process -Name "java" -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, StartTime

# Verificar porta 8080
netstat -ano | Select-String ":8080"
```

#### 2. Iniciar o Backend

**Via IntelliJ:**
- Execute `BackendApplication.java`

**Via PowerShell:**
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

#### 3. Verificar Logs do Backend

Procure por erros nos logs do backend. Erros comuns:
- Banco de dados não conectado
- Porta 8080 já em uso
- Erro de compilação

---

### ❌ Erro: "Port 5173 is already in use"

**Problema:** A porta 5173 (frontend) já está em uso.

**Solução:**

```powershell
# Encontrar processo usando a porta 5173
$port = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port) {
    $processId = $port.OwningProcess
    $process = Get-Process -Id $processId
    Write-Host "Processo usando porta 5173: $($process.ProcessName) (PID: $processId)" -ForegroundColor Yellow
    
    # Parar processo
    Stop-Process -Id $processId -Force
    Write-Host "✅ Processo parado" -ForegroundColor Green
}

# Ou parar todos os processos Node.js
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

### ❌ Erro 403 no Login

**Problema:** Ao tentar fazer login, aparece erro 403 Forbidden.

**Possíveis Causas e Soluções:**

#### 1. Frontend não está usando `vite.config.tunnel.ts`

**Solução:** O script `compartilhar-aplicacao-final-v2.bat` já faz isso automaticamente. Se estiver executando manualmente:

```powershell
cd frontend
npx vite --config vite.config.tunnel.ts
```

#### 2. CORS não configurado

**Verificar:** O arquivo `SecurityConfig.java` deve ter:

```java
configuration.setAllowedOriginPatterns(Arrays.asList(
    "http://localhost:*",
    "https://*.trycloudflare.com",
    "https://*.cloudflare.com"
));
```

#### 3. Cache do Navegador

**Solução:**
- Limpe o cache do navegador (Ctrl + Shift + Delete)
- Ou use modo anônimo/privado

---

### ❌ URL do Tunnel não aparece

**Problema:** A URL não aparece na janela "Cloudflare Tunnel".

**Soluções:**

1. **Aguarde mais tempo** (pode levar até 30 segundos)
2. **Verifique se há erros** na janela "Cloudflare Tunnel"
3. **Feche e execute o script novamente**
4. **Verifique conexão com internet**

```powershell
# Verificar conexão
Test-NetConnection -ComputerName cloudflare.com -Port 443
```

---

### ❌ Erro: "Cannot connect to localhost:5173"

**Problema:** O Cloudflare Tunnel não consegue conectar ao frontend local.

**Soluções:**

1. **Verificar se o frontend está rodando:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5173" -Method GET
```

2. **Verificar firewall:**
```powershell
# Verificar regras de firewall
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*5173*"}
```

3. **Reiniciar o frontend:**
```powershell
# Parar processos Node.js
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Iniciar novamente
cd frontend
npx vite --config vite.config.tunnel.ts
```

---

## 📊 Monitoramento

### Verificar Processos Rodando

```powershell
# Ver processos Node.js
Get-Process -Name "node" -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, StartTime, CPU

# Ver processos Cloudflared
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, StartTime, CPU

# Ver processos Java (backend)
Get-Process -Name "java" -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, StartTime, CPU
```

### Verificar Portas em Uso

```powershell
# Porta 8080 (backend)
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess

# Porta 5173 (frontend)
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess
```

### Verificar Status dos Serviços

```powershell
# Script completo de verificação
function Test-Services {
    Write-Host "`n🔍 Verificando Serviços...`n" -ForegroundColor Cyan
    
    # Backend
    try {
        $backend = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method GET -TimeoutSec 5
        Write-Host "✅ Backend: OK (Status: $($backend.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "❌ Backend: ERRO - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Frontend
    try {
        $frontend = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
        Write-Host "✅ Frontend: OK (Status: $($frontend.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "❌ Frontend: ERRO - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Processos
    $nodeCount = (Get-Process -Name "node" -ErrorAction SilentlyContinue).Count
    $cloudflaredCount = (Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue).Count
    $javaCount = (Get-Process -Name "java" -ErrorAction SilentlyContinue).Count
    
    Write-Host "`n📊 Processos:" -ForegroundColor Cyan
    Write-Host "   Node.js: $nodeCount processo(s)" -ForegroundColor $(if ($nodeCount -gt 0) { "Green" } else { "Red" })
    Write-Host "   Cloudflared: $cloudflaredCount processo(s)" -ForegroundColor $(if ($cloudflaredCount -gt 0) { "Green" } else { "Red" })
    Write-Host "   Java: $javaCount processo(s)" -ForegroundColor $(if ($javaCount -gt 0) { "Green" } else { "Red" })
}

# Executar verificação
Test-Services
```

---

## 🛑 Parar o Tunnel

### Método 1: Fechar Janelas (Recomendado)

1. **Feche a janela "Cloudflare Tunnel"** - Isso encerra o tunnel
2. **Feche a janela "Frontend"** - Isso encerra o servidor frontend
3. **O backend pode continuar rodando** - Não precisa parar

### Método 2: Via PowerShell

```powershell
# Parar processos Node.js (frontend)
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✅ Frontend parado" -ForegroundColor Green

# Parar processos Cloudflared (tunnel)
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✅ Cloudflare Tunnel parado" -ForegroundColor Green
```

### Método 3: Parar Tudo

```powershell
# Parar todos os processos relacionados
Get-Process -Name "node", "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✅ Todos os processos parados" -ForegroundColor Green

# Verificar se parou
$remaining = Get-Process -Name "node", "cloudflared" -ErrorAction SilentlyContinue
if ($remaining) {
    Write-Host "⚠️ Ainda há processos rodando:" -ForegroundColor Yellow
    $remaining | Format-Table Id, ProcessName
} else {
    Write-Host "✅ Todos os processos foram parados" -ForegroundColor Green
}
```

---

## ⚠️ Informações Importantes

### URLs Temporárias

As URLs do Cloudflare Tunnel (`.trycloudflare.com`) são **temporárias** e mudam a cada execução.

- ✅ **Para testes rápidos:** Use o script automático
- ✅ **Para URLs permanentes:** Configure um Named Tunnel do Cloudflare (requer conta Cloudflare)

### Segurança

- ⚠️ **NÃO compartilhe a URL do backend** (se houver)
- ✅ **Compartilhe apenas a URL do frontend**
- ⚠️ **Mude as credenciais padrão** em produção
- ⚠️ **URLs temporárias expiram** quando você fecha o tunnel

### Manter Janelas Abertas

**IMPORTANTE:** Mantenha as janelas "Frontend" e "Cloudflare Tunnel" **abertas** enquanto estiver compartilhando a aplicação. Se fechar qualquer uma delas, o acesso externo será interrompido.

### Performance

- ⚡ **Primeira conexão pode ser lenta** (10-30 segundos)
- ⚡ **Conexões subsequentes são mais rápidas**
- ⚡ **A velocidade depende da sua conexão de internet**

---

## 📞 Resumo Rápido

### Checklist Rápido

1. ✅ Backend rodando (porta 8080)
2. ✅ Cloudflare Tunnel instalado
3. ✅ Execute: `.\compartilhar-aplicacao-final-v2.bat`
4. ✅ Aguarde URL na janela "Cloudflare Tunnel"
5. ✅ Copie e compartilhe a URL
6. ✅ Teste com: `admin.master` / `Admin@123`

### Comandos Essenciais

```powershell
# Verificar backend
Invoke-WebRequest -Uri "http://localhost:8080/health" -Method GET

# Executar script
.\compartilhar-aplicacao-final-v2.bat

# Parar tudo
Get-Process -Name "node", "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## 📚 Recursos Adicionais

- [Documentação Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Guia de Troubleshooting Cloudflare](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/troubleshooting/)

---

**Status:** ✅ Funcionando  
**Última atualização:** 2025  
**Versão:** 3.0  
**Autor:** Sistema de Saúde Digital

---

## 🤝 Contribuindo

Se encontrar problemas ou tiver sugestões, abra uma issue no repositório.

---

**⭐ Se este guia foi útil, considere dar uma estrela no repositório!**
