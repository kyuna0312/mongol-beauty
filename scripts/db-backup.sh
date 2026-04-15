#!/bin/sh
# =============================================================================
# Mongol Beauty — Weekly PostgreSQL backup
# Runs inside the db-backup container every Saturday at 23:59.
# Dumps land at /backups/ which is bind-mounted to
# /var/backups/mongol-beauty/ on the host.
#
# Restore a dump:
#   gunzip -c /var/backups/mongol-beauty/mongol_beauty_YYYY-MM-DD_2359.sql.gz \
#     | psql -h localhost -U $DB_USER -d $DB_NAME
# =============================================================================
set -e

BACKUP_DIR="/backups"
DB_HOST="${DB_HOST:-postgres}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-mongol_beauty}"
TIMESTAMP=$(date +%Y-%m-%d_%H%M)
BACKUP_FILE="${BACKUP_DIR}/mongol_beauty_${TIMESTAMP}.sql.gz"
LOG_FILE="${BACKUP_DIR}/backup.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup of ${DB_NAME}..." >> "$LOG_FILE"

pg_dump \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  | gzip > "$BACKUP_FILE"

SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup complete: $(basename "$BACKUP_FILE") (${SIZE})" >> "$LOG_FILE"

# Rotate: delete dumps older than 56 days (~8 weekly backups retained)
DELETED=$(find "$BACKUP_DIR" -name "mongol_beauty_*.sql.gz" -mtime +56 -print)
find "$BACKUP_DIR" -name "mongol_beauty_*.sql.gz" -mtime +56 -delete

if [ -n "$DELETED" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deleted old backups: $DELETED" >> "$LOG_FILE"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Done." >> "$LOG_FILE"
