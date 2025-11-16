# ✅ Checklist de Migração para VPS

Use este checklist para garantir que todos os passos foram seguidos corretamente.

## 📋 Fase 1: Preparação da VPS

### Configuração Inicial
- [ ] VPS contratada e acessível via SSH
- [ ] Acesso SSH configurado e testado
- [ ] Sistema operacional atualizado (Ubuntu 20.04+ ou Debian 11+)
- [ ] Usuário com permissões sudo criado

### Instalação de Dependências
- [ ] Docker instalado (`docker --version`)
- [ ] Docker Compose instalado (`docker compose version`)
- [ ] Usuário adicionado ao grupo docker
- [ ] Logout/login realizado para aplicar permissões

### Configuração de Segurança
- [ ] Firewall (UFW) habilitado
- [ ] Porta SSH (22) liberada
- [ ] Porta HTTP (80) liberada
- [ ] Porta HTTPS (443) liberada
- [ ] Portas desnecessárias fechadas

## 📋 Fase 2: Preparação do Projeto

### Upload do Código
- [ ] Projeto clonado ou enviado para VPS
- [ ] Localização: `/opt/apps/SISTEMA2` (ou similar)
- [ ] Permissões de arquivos verificadas

### Configuração de Ambiente
- [ ] Arquivo `.env` criado a partir do `env.example.txt`
- [ ] `POSTGRES_PASSWORD` configurado (senha segura)
- [ ] `JWT_SECRET` configurado (chave segura, mínimo 32 caracteres)
- [ ] `DOMAIN_NAME` configurado (se usar domínio)
- [ ] Todas as variáveis revisadas e ajustadas

### Estrutura de Diretórios
- [ ] Diretório `backups/` criado
- [ ] Diretório `storage/documentos/` criado
- [ ] Diretório `nginx/ssl/` criado
- [ ] Diretório `nginx/conf.d/` criado
- [ ] Permissões adequadas configuradas (755)

### Verificação de Arquivos
- [ ] `docker-compose.prod.yml` existe
- [ ] `backend/Dockerfile` existe
- [ ] `frontend/Dockerfile` existe
- [ ] `nginx/nginx.conf` existe
- [ ] `nginx/conf.d/default.conf` existe
- [ ] Scripts em `scripts/` existem e são executáveis

## 📋 Fase 3: Deploy

### Build e Inicialização
- [ ] Scripts tornados executáveis (`chmod +x scripts/*.sh`)
- [ ] Build das imagens Docker concluído sem erros
- [ ] Todos os containers iniciados (`docker compose ps`)
- [ ] Nenhum container com status "unhealthy" ou "restarting"

### Verificação de Serviços
- [ ] PostgreSQL está rodando e saudável
- [ ] Backend responde em `/actuator/health`
- [ ] Frontend carrega corretamente
- [ ] Nginx está funcionando como reverse proxy
- [ ] Logs não mostram erros críticos

### Testes Funcionais
- [ ] Aplicação acessível via IP da VPS
- [ ] Login funciona corretamente
- [ ] API responde às requisições
- [ ] Frontend carrega recursos estáticos
- [ ] Conexão com banco de dados funcionando

## 📋 Fase 4: Configuração de Domínio e SSL (Opcional)

### DNS
- [ ] Domínio configurado
- [ ] Registro A apontando para IP da VPS
- [ ] Registro A para www apontando para IP da VPS
- [ ] DNS propagado (verificado com `nslookup`)

### SSL/HTTPS
- [ ] Certbot instalado
- [ ] Certificado SSL obtido do Let's Encrypt
- [ ] Certificados copiados para `nginx/ssl/`
- [ ] Configuração HTTPS descomentada no Nginx
- [ ] Redirecionamento HTTP → HTTPS funcionando
- [ ] Renovação automática configurada no cron

## 📋 Fase 5: Backup e Monitoramento

### Backup
- [ ] Script de backup testado manualmente
- [ ] Backup automático configurado no cron
- [ ] Local de armazenamento de backups definido
- [ ] Teste de restauração realizado com sucesso

### Monitoramento
- [ ] Logs sendo monitorados regularmente
- [ ] Healthchecks funcionando
- [ ] Alertas configurados (se aplicável)
- [ ] Uso de recursos monitorado

## 📋 Fase 6: Documentação e Manutenção

### Documentação
- [ ] Credenciais documentadas e armazenadas com segurança
- [ ] Processo de deploy documentado
- [ ] Contatos de suporte identificados
- [ ] Procedimentos de rollback definidos

### Manutenção
- [ ] Processo de atualização documentado
- [ ] Rotina de manutenção estabelecida
- [ ] Plano de contingência definido

## 🎯 Validação Final

### Testes de Carga (Opcional)
- [ ] Teste de carga básico realizado
- [ ] Performance dentro dos limites esperados
- [ ] Recursos da VPS adequados

### Segurança Final
- [ ] Todas as senhas padrão alteradas
- [ ] Portas desnecessárias fechadas
- [ ] SSL/HTTPS configurado (se aplicável)
- [ ] Headers de segurança ativos

### Go-Live
- [ ] Backup completo realizado antes do go-live
- [ ] Equipe notificada sobre o deploy
- [ ] Horário de menor tráfego escolhido (se aplicável)
- [ ] Plano de rollback pronto

## 📝 Notas

**Data de Migração**: _______________

**Responsável**: _______________

**Observações**:
```
_______________________________________
_______________________________________
_______________________________________
```

## 🔄 Pós-Deploy (Primeiras 24h)

- [ ] Monitorar logs constantemente
- [ ] Verificar uso de recursos
- [ ] Testar funcionalidades críticas
- [ ] Coletar feedback dos usuários
- [ ] Documentar problemas encontrados

---

**Status Geral**: ⬜ Não Iniciado | ⬜ Em Progresso | ⬜ Concluído

