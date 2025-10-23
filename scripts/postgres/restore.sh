#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Uso: $0 <arquivo.dump>"
  exit 1
fi

DUMP_FILE="$1"
if [[ ! -f "$DUMP_FILE" ]]; then
  echo "Arquivo nao encontrado: $DUMP_FILE"
  exit 1
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-saude_db}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-123456}"
USE_DOCKER="${USE_DOCKER:-1}"

echo "Restaurando backup $DUMP_FILE"

if [[ "$USE_DOCKER" == "1" ]]; then
  cat "$DUMP_FILE" | docker compose exec -T postgres env PGPASSWORD="$DB_PASS" pg_restore --clean --if-exists -U "$DB_USER" -d "$DB_NAME"
else
  PGPASSWORD="$DB_PASS" pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --clean --if-exists "$DUMP_FILE"
fi

echo "Restauracao finalizada."
