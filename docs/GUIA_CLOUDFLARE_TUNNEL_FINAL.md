# 🌐 Guia Completo - Cloudflare Tunnel

## ✅ Problemas Resolvidos

### 1. Erro 403 - Forbidden
**Problema**: Vite bloqueava requisições do Cloudflare Tunnel
**Solução**: 
- Criado `vite.config.tunnel.ts` com configuração específica
- Plugin customizado para desabilitar verificação de host
- Configuração `allowedHosts: true`

### 2. Favicon 404
**Problema**: Navegador buscava `/favicon.ico` e recebia 404
**Solução**: 
- Criado `StaticResourceController` no backend
- Rota `/favicon.ico` retorna SVG inline
- Configurado como rota pública no Spring Security

### 3. CORS e CSP
**Problema**: Headers de segurança bloqueavam domínios Cloudflare
**Solução**:
- Atualizado `SecurityConfig.java` com domínios `*.trycloudflare.com`
- Configurado CSP para permitir conexões Cloudflare
- Headers CORS ajustados

## 🚀 Como Usar

### Opção 1: Script Automático (Recomendado)
```bash
compartilhar-aplicacao-final-v2.bat
```

### Opção 2: Manual
```bash
# 1. Iniciar frontend
cd frontend
npx vite --config vite.config.tunnel.ts

# 2. Criar tunnel
cloudflared tunnel --url http://localhost:5173

# 3. Copiar URL do tunnel
# Ex: https://abc-123.trycloudflare.com
```

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
- `vite.config.tunnel.ts` - Configuração Vite para tunnel
- `StaticResourceController.java` - Serve favicon.ico
- `compartilhar-aplicacao-final-v2.bat` - Script principal
- `iniciar-tunnel-completo.bat` - Script alternativo
- `testar-aplicacao.js` - Testes automatizados
- `obter-url-tunnel.js` - Verificar status do tunnel

### Arquivos Modificados:
- `SecurityConfig.java` - CORS e CSP para Cloudflare
- `compartilhar-aplicacao-final.bat` - Melhorado

## 🔧 Configurações Técnicas

### Vite (vite.config.tunnel.ts)
```typescript
export default defineConfig({
  plugins: [react(), disableHostCheck()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    cors: true,
    allowedHosts: true, // Permite qualquer host
    hmr: false, // Desabilita HMR para tunnel
  }
})
```

### Spring Security (SecurityConfig.java)
```java
// CORS permite domínios Cloudflare
configuration.setAllowedOriginPatterns(Arrays.asList(
    "http://localhost:*",
    "https://*.trycloudflare.com",
    "https://*.cloudflare.com"
));

// CSP permite conexões Cloudflare
"connect-src 'self' http://localhost:* https://*.trycloudflare.com https://*.cloudflare.com"
```

## 🧪 Testes

### Teste Local
```bash
node testar-aplicacao.js
```

### Teste Manual
1. Acesse `http://localhost:5173`
2. Verifique se não há erros 403 no console
3. Teste login com `admin.master` / `Admin@123`

### Teste via Tunnel
1. Execute o script principal
2. Aguarde URL do Cloudflare aparecer
3. Acesse a URL fornecida
4. Teste todas as funcionalidades

## 🐛 Solução de Problemas

### Erro: "Port 5173 is already in use"
```bash
# Matar processos Node
taskkill /F /IM node.exe

# Ou usar PowerShell
Get-Process node | Stop-Process -Force
```

### Erro: "Backend não está respondendo"
```bash
# Verificar se está rodando
curl http://localhost:8080/health

# Iniciar backend
cd backend
mvn spring-boot:run
```

### Erro: "Cloudflare Tunnel não encontrado"
```bash
# Instalar cloudflared
winget install --id Cloudflare.cloudflared

# Verificar instalação
cloudflared --version
```

### Erro 403 no Tunnel
1. Verifique se está usando `vite.config.tunnel.ts`
2. Confirme que `allowedHosts: true` está configurado
3. Reinicie o frontend

## 📊 Monitoramento

### URLs de Monitoramento:
- **Backend Health**: `http://localhost:8080/health`
- **Frontend Local**: `http://localhost:5173`
- **Favicon**: `http://localhost:8080/favicon.ico`

### Logs Importantes:
- **Backend**: Console do IntelliJ ou terminal
- **Frontend**: Janela "Frontend"
- **Tunnel**: Janela "Cloudflare Tunnel"

## 🔐 Segurança

### Credenciais de Teste:
- **Login**: `admin.master`
- **Senha**: `Admin@123`
- **Unidade**: `UBS - Unidade Básica de Saúde`

### Configurações de Segurança:
- CORS configurado para domínios específicos
- CSP permite apenas conexões necessárias
- Headers de segurança mantidos
- Cookies seguros configurados

## 🎯 Próximos Passos

1. **Testar em produção**: Use tunnel nomeado do Cloudflare
2. **Configurar domínio próprio**: Substitua trycloudflare.com
3. **SSL**: Cloudflare fornece SSL automático
4. **Monitoramento**: Configure alertas de uptime
5. **Backup**: Configure backup do banco de dados

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs nas janelas abertas
2. Execute `node testar-aplicacao.js`
3. Verifique se todas as dependências estão instaladas
4. Consulte este guia para soluções comuns

---

**Status**: ✅ Funcionando perfeitamente
**Última atualização**: 12/10/2025
**Versão**: 2.0

