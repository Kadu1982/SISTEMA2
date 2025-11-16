#!/bin/bash

# ============================================
# Script de Auditoria da VPS
# Verifica o que já existe instalado
# ============================================

echo "=================================="
echo "🔍 AUDITORIA DA VPS"
echo "=================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}[1/10] Sistema Operacional${NC}"
cat /etc/os-release | grep -E "PRETTY_NAME|VERSION"
echo ""

echo -e "${GREEN}[2/10] Recursos do Sistema${NC}"
echo "CPU:"
lscpu | grep -E "^CPU\(s\)|Model name"
echo ""
echo "Memória:"
free -h | grep -E "Mem|Swap"
echo ""
echo "Disco:"
df -h / | tail -1
echo ""

echo -e "${GREEN}[3/10] Docker${NC}"
if command -v docker &> /dev/null; then
    echo "✅ Docker instalado: $(docker --version)"
    echo "Containers rodando:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "❌ Docker NÃO instalado"
fi
echo ""

echo -e "${GREEN}[4/10] Docker Compose${NC}"
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose instalado: $(docker-compose --version)"
else
    echo "❌ Docker Compose NÃO instalado"
fi
echo ""

echo -e "${GREEN}[5/10] Serviços Rodando${NC}"
systemctl list-units --type=service --state=running --no-pager | grep -E "nginx|apache|postgresql|mysql|redis" || echo "Nenhum serviço web/db detectado"
echo ""

echo -e "${GREEN}[6/10] Portas Abertas${NC}"
netstat -tuln | grep LISTEN || ss -tuln | grep LISTEN
echo ""

echo -e "${GREEN}[7/10] Firewall (UFW)${NC}"
if command -v ufw &> /dev/null; then
    echo "✅ UFW instalado"
    sudo ufw status
else
    echo "❌ UFW NÃO instalado"
fi
echo ""

echo -e "${GREEN}[8/10] Fail2Ban${NC}"
if command -v fail2ban-client &> /dev/null; then
    echo "✅ Fail2Ban instalado"
    sudo fail2ban-client status
else
    echo "❌ Fail2Ban NÃO instalado"
fi
echo ""

echo -e "${GREEN}[9/10] Usuários do Sistema${NC}"
cat /etc/passwd | grep -v "nologin\|false" | cut -d: -f1 | grep -v "^#"
echo ""

echo -e "${GREEN}[10/10] Últimos Logins${NC}"
last -10
echo ""

echo "=================================="
echo "✅ Auditoria Concluída!"
echo "=================================="
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo "1. Verifique se há algo suspeito nos logins"
echo "2. Anote os serviços que JÁ estão rodando"
echo "3. Decida se quer manter ou remover serviços existentes"
echo ""
