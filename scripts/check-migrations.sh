#!/bin/bash

# ============================================
# Script para Verificar Status das Migrations
# Sistema de Saúde - Verificação Flyway
# ============================================

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Carregar variáveis do .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

CONTAINER_NAME="saude_backend"
DB_NAME="${POSTGRES_DB:-saude_db}"
DB_USER="${POSTGRES_USER:-postgres}"

print_info "=== Verificação de Migrations Flyway ==="

# Verificar se container está rodando
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    print_error "Container do backend não está rodando!"
    print_info "Inicie o container primeiro: docker compose -f docker-compose.prod.yml up -d backend"
    exit 1
fi

print_step "Verificando status das migrations..."

# Verificar histórico do Flyway via PostgreSQL container
POSTGRES_CONTAINER="saude_postgres"

if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
    print_error "Container do PostgreSQL não está rodando!"
    exit 1
fi

print_info "Histórico de migrations aplicadas (últimas 10):"
docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT version, description, installed_on, success FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 10;"

print_info ""
print_step "Últimas migrations com erro (se houver):"
docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT version, description, installed_on, success FROM flyway_schema_history WHERE success = false ORDER BY installed_rank DESC;"

print_info ""
print_step "Total de migrations aplicadas:"
docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM flyway_schema_history WHERE success = true;"

print_info ""
print_step "Verificando logs do Flyway no backend..."
docker logs "$CONTAINER_NAME" 2>&1 | grep -i flyway | tail -20

print_info ""
print_info "=== Verificação concluída ==="
print_info "Se houver migrations pendentes ou com erro, verifique os logs acima."

