#!/bin/bash

# ============================================
# Script de Restauração do Banco de Dados
# Sistema de Saúde - Restore Manual
# ============================================

set -e

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar argumentos
if [ -z "$1" ]; then
    print_error "Uso: $0 <arquivo_backup.sql.gz>"
    print_info "Exemplo: $0 backups/backup_20240101_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="saude_postgres"

# Carregar variáveis do .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

DB_NAME="${POSTGRES_DB:-saude_db}"
DB_USER="${POSTGRES_USER:-postgres}"

# Verificar se arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

# Verificar se container está rodando
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    print_error "Container PostgreSQL não está rodando!"
    exit 1
fi

print_warning "ATENÇÃO: Esta operação irá SOBRESCREVER o banco de dados atual!"
read -p "Tem certeza que deseja continuar? (digite 'SIM' para confirmar): " CONFIRM

if [ "$CONFIRM" != "SIM" ]; then
    print_info "Operação cancelada."
    exit 0
fi

print_info "Restaurando banco de dados de: $BACKUP_FILE"

# Descompactar se necessário
if [[ "$BACKUP_FILE" == *.gz ]]; then
    print_info "Descompactando backup..."
    gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
else
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_FILE"
fi

print_info "Restauração concluída com sucesso!"

