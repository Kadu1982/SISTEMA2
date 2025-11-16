#!/bin/bash

# ============================================
# Script de Backup do Banco de Dados
# Sistema de Saúde - Backup Automatizado
# ============================================

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Carregar variáveis do .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configurações
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"
CONTAINER_NAME="saude_postgres"
DB_NAME="${POSTGRES_DB:-saude_db}"
DB_USER="${POSTGRES_USER:-postgres}"

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

print_info "Iniciando backup do banco de dados..."

# Verificar se container está rodando
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    print_warning "Container PostgreSQL não está rodando!"
    exit 1
fi

# Executar backup
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"

# Compactar backup
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

print_info "Backup criado: $BACKUP_FILE"

# Remover backups antigos (manter apenas últimos 7 dias)
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete

print_info "Backup concluído com sucesso!"

