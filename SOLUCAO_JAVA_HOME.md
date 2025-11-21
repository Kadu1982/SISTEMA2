# Solução para Erro JAVA_HOME

## 🔍 Problema

O erro `JAVA_HOME not found` ocorre porque a sessão atual do terminal não carregou as variáveis de ambiente atualizadas.

## ✅ Soluções

### Opção 1: Reiniciar o Terminal/Cursor (Recomendado)

**A forma mais simples é fechar e reabrir o terminal:**

1. Feche completamente o Cursor.ai
2. Abra novamente o Cursor.ai
3. Abra um novo terminal
4. Execute: `cd backend && ./mvnw spring-boot:run`

### Opção 2: Usar os Scripts Criados

Foram criados scripts que configuram automaticamente o JAVA_HOME:

**PowerShell:**
```powershell
cd backend
.\start-backend.ps1
```

**CMD/Batch:**
```cmd
cd backend
start-backend.bat
```

### Opção 3: Configurar Manualmente na Sessão Atual

Execute estes comandos no terminal antes de rodar o backend:

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.8.9-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
cd backend
.\mvnw.cmd spring-boot:run
```

## 🔧 Verificação

Para verificar se está tudo configurado:

```powershell
# Verificar JAVA_HOME
echo $env:JAVA_HOME

# Verificar Java
java -version

# Verificar Maven
cd backend
.\mvnw.cmd --version
```

## 📝 Nota Importante

- O JAVA_HOME **já está configurado permanentemente** no sistema
- O problema é apenas que a sessão atual do terminal precisa ser reiniciada para carregar as novas variáveis
- Após reiniciar o terminal/Cursor, tudo funcionará automaticamente

## 🚀 Solução Rápida

**Apenas reinicie o Cursor.ai e execute:**
```powershell
cd backend
./mvnw spring-boot:run
```





