#!/bin/bash

# ============================================
# Script de Deploy para VPS
# Sistema de Saúde - Deploy Automatizado
# ============================================

set -e  # Para em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor, execute como root ou com sudo"
    exit 1
fi

print_info "=== Iniciando Deploy do Sistema de Saúde ==="

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    print_info "Docker instalado com sucesso!"
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose não está instalado. Instalando..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_info "Docker Compose instalado com sucesso!"
fi

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    print_warning "Arquivo .env não encontrado. Criando a partir do .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_warning "ATENÇÃO: Configure o arquivo .env com suas credenciais antes de continuar!"
        print_warning "Execute: nano .env"
        exit 1
    else
        print_error "Arquivo .env.example não encontrado!"
        exit 1
    fi
fi

# Criar diretórios necessários
print_info "Criando diretórios necessários..."
mkdir -p backups
mkdir -p storage/documentos
mkdir -p nginx/ssl
mkdir -p nginx/conf.d
chmod -R 755 backups storage nginx

# Parar containers existentes
print_info "Parando containers existentes..."
docker-compose -f docker-compose.prod.yml down || true

# Remover imagens antigas (opcional)
read -p "Deseja remover imagens antigas? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    print_info "Removendo imagens antigas..."
    docker-compose -f docker-compose.prod.yml down --rmi all || true
fi

# Build das imagens
print_info "Construindo imagens Docker..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar serviços
print_info "Iniciando serviços..."
docker-compose -f docker-compose.prod.yml up -d

# Aguardar serviços ficarem saudáveis
print_info "Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos containers
print_info "Verificando status dos containers..."
docker-compose -f docker-compose.prod.yml ps

# Verificar logs
print_info "Últimas linhas dos logs do backend:"
docker-compose -f docker-compose.prod.yml logs --tail=50 backend

print_info "=== Deploy concluído com sucesso! ==="
print_info "Acesse a aplicação em: http://seu-ip-vps"
print_info "Para ver os logs: docker-compose -f docker-compose.prod.yml logs -f"
print_info "Para parar: docker-compose -f docker-compose.prod.yml down"

