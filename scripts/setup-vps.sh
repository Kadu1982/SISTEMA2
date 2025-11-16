#!/bin/bash

# ============================================
# Script de Configuração Inicial da VPS
# Sistema de Saúde - Setup Inicial
# ============================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor, execute como root ou com sudo"
    exit 1
fi

print_info "=== Configuração Inicial da VPS ==="
print_info "Este script irá instalar Docker e configurar o ambiente básico"

# Atualizar sistema
print_step "1/6 - Atualizando sistema..."
apt update && apt upgrade -y

# Instalar pacotes essenciais
print_step "2/6 - Instalando pacotes essenciais..."
apt install -y curl wget git nano ufw htop

# Instalar Docker
print_step "3/6 - Instalando Docker..."
if command -v docker &> /dev/null; then
    print_warning "Docker já está instalado"
else
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    print_info "Docker instalado com sucesso!"
fi

# Instalar Docker Compose
print_step "4/6 - Instalando Docker Compose..."
if command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose já está instalado"
else
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_info "Docker Compose instalado com sucesso!"
fi

# Configurar Firewall
print_step "5/6 - Configurando firewall..."
ufw --force enable
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
print_info "Firewall configurado!"

# Criar estrutura de diretórios
print_step "6/6 - Criando estrutura de diretórios..."
mkdir -p /opt/apps
mkdir -p /opt/backups
print_info "Diretórios criados!"

# Informações finais
print_info "=== Configuração concluída! ==="
print_info ""
print_info "Próximos passos:"
print_info "1. Faça upload do projeto para /opt/apps/"
print_info "2. Configure o arquivo .env"
print_info "3. Execute: ./scripts/deploy.sh"
print_info ""
print_info "Verificar instalação:"
print_info "  docker --version"
print_info "  docker compose version"
print_info "  ufw status"

