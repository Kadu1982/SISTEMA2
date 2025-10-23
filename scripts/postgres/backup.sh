#!/usr/bin/env bash
set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-saude_db}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-123456}"
OUTPUT_DIR="${OUTPUT_DIR:-backups}"
USE_DOCKER="${USE_DOCKER:-1}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="${FILENAME:-${TIMESTAMP}_${DB_NAME}.dump}"
TARGET_PATH="$OUTPUT_DIR/$FILENAME"

mkdir -p "$OUTPUT_DIR"

echo "Gerando backup em $TARGET_PATH"

if [[ "$USE_DOCKER" == "1" ]]; then
  docker compose exec -T postgres env PGPASSWORD="$DB_PASS" pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc > "$TARGET_PATH"
else
  PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -Fc -f "$TARGET_PATH"
fi

echo "Backup finalizado."
