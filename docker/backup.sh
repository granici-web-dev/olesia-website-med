#!/bin/sh
# Nightly backup of the Postgres database and the uploaded files.
#
# Two things are backed up, because losing either one loses the same patient's
# record: the database rows AND the files under PRIVATE_UPLOADS_DIR /
# UPLOADS_DIR. A dump without the files restores appointments that reference
# analyses nobody can open any more.
#
# Written for `sh`, not bash: it runs inside alpine images.
#
# Usage (from a cron entry on the host, or the `backup` service in
# docker-compose.prod.yml):
#     BACKUP_DIR=/backups ./backup.sh
#
# Restore with `restore.sh` — and read its header, because a backup nobody has
# ever restored is a backup nobody knows they have.

set -eu

BACKUP_DIR="${BACKUP_DIR:-/backups}"
# How many daily backups to keep. Two weeks is enough to notice corruption that
# was not obvious the next morning, without hoarding medical data forever.
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"

: "${PGHOST:=postgres}"
: "${PGUSER:=olesia}"
: "${PGDATABASE:=olesia}"
export PGHOST PGUSER PGDATABASE PGPASSWORD

STAMP="$(date -u +%Y%m%d-%H%M%S)"
DB_FILE="$BACKUP_DIR/db-$STAMP.sql.gz"
FILES_FILE="$BACKUP_DIR/files-$STAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

# --- database ---------------------------------------------------------------
# Write to a temporary name first and rename on success. A backup file that
# exists but is a truncated dump is worse than no file: it looks like safety.
pg_dump --no-owner --no-privileges | gzip -9 > "$DB_FILE.part"
mv "$DB_FILE.part" "$DB_FILE"

# --- uploaded files ---------------------------------------------------------
# Both directories, private first. Missing dirs are not an error: a fresh
# install has no uploads yet.
UPLOADS="${UPLOADS_DIR:-/app/uploads}"
PRIVATE="${PRIVATE_UPLOADS_DIR:-/app/private-uploads}"
TAR_TARGETS=""
[ -d "$PRIVATE" ] && TAR_TARGETS="$TAR_TARGETS $PRIVATE"
[ -d "$UPLOADS" ] && TAR_TARGETS="$TAR_TARGETS $UPLOADS"

if [ -n "$TAR_TARGETS" ]; then
  # shellcheck disable=SC2086 — word splitting is what builds the target list.
  tar -czf "$FILES_FILE.part" $TAR_TARGETS 2>/dev/null
  mv "$FILES_FILE.part" "$FILES_FILE"
fi

# --- rotation ---------------------------------------------------------------
find "$BACKUP_DIR" -name 'db-*.sql.gz' -mtime "+$KEEP_DAYS" -delete
find "$BACKUP_DIR" -name 'files-*.tar.gz' -mtime "+$KEEP_DAYS" -delete
# Sweep interrupted runs so a crashed backup does not sit there forever.
find "$BACKUP_DIR" -name '*.part' -mtime +1 -delete

echo "backup ok: $(basename "$DB_FILE")$([ -f "$FILES_FILE" ] && echo " + $(basename "$FILES_FILE")")"

# --- off-site copy ---------------------------------------------------------
# A backup on the same disk as the database survives a bad migration, not a
# dead server or a deleted account. RCLONE_REMOTE is the destination in rclone's
# own syntax ("olesia-offsite:backups"), configured through RCLONE_CONFIG_*
# environment variables or a mounted rclone.conf.
#
# ⚠ The destination must be in the EU: these archives hold special-category
# medical data (§11.14).
if [ -n "${RCLONE_REMOTE:-}" ]; then
  rclone sync "$BACKUP_DIR" "$RCLONE_REMOTE" --config "${RCLONE_CONFIG:-/config/rclone/rclone.conf}"
  echo "off-site sync ok: $RCLONE_REMOTE"
else
  echo "off-site sync skipped: RCLONE_REMOTE not set"
fi
