#!/bin/bash
# Nightly logical backup of the shop database, kept for 14 days.
# Usage: scripts/backup-db.sh [backup-dir]
set -e

BACKUP_DIR="${1:-/var/backups/shopfloor}"
KEEP_DAYS=14
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TARGET="${BACKUP_DIR}/shopfloor-${STAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

if ! mysqladmin ping -h "${MYSQL_HOST}" -P "${MYSQL_PORT}" --silent; then
  echo "database ${MYSQL_HOST}:${MYSQL_PORT} is not reachable" >&2
  exit 1
fi

# The password is passed through the environment, not argv, so it does not
# show up in `ps`.
MYSQL_PWD="${MYSQL_PASSWORD}" mysqldump -h "${MYSQL_HOST}" -P "${MYSQL_PORT}" -u "${MYSQL_USER}" \
  --single-transaction --routines "${MYSQL_DATABASE}" | gzip > "${TARGET}"

find "${BACKUP_DIR}" -name 'shopfloor-*.sql.gz' -mtime +"${KEEP_DAYS}" -delete
echo "backup written to ${TARGET}"
