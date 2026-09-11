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
# `pg_dump | gzip` is the whole backup, and without this the exit status is
# gzip's: a dump that died halfway through compresses perfectly, and the script
# went on to rename it over the last good one (audit A11, H1). The trailer
# check below is the second half of the same fix, for the shells where this
# option does not exist.
set -o pipefail

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

# --- what the run reports about itself --------------------------------------
# One file, rewritten every run, so that the outcome of last night's backup is
# a thing a machine can read. Until this existed, a failure was a line in a
# rotated container log that nobody was watching, and `/health` had no way to
# say the database had not been backed up in a week (audit A11, H4).
STATUS_FILE="$BACKUP_DIR/last-run.json"
FAILURE=''
DB_BYTES=0
FILES_BYTES=0

write_status() {
  ok=true
  [ -n "$FAILURE" ] && ok=false
  # The message is ours, not a command's output, but it reaches a JSON file:
  # strip the two characters that would break the document rather than ship a
  # status file that no reader can parse.
  escaped_failure="$(printf '%s' "$FAILURE" | tr -d '"\\' | tr '\n' ' ')"
  cat > "$STATUS_FILE.part" <<JSON
{
  "at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "ok": $ok,
  "dbBytes": $DB_BYTES,
  "filesBytes": $FILES_BYTES,
  "error": $([ -n "$FAILURE" ] && printf '"%s"' "$escaped_failure" || printf 'null')
}
JSON
  mv "$STATUS_FILE.part" "$STATUS_FILE"
}

on_exit() {
  code=$?
  if [ "$code" -ne 0 ] && [ -z "$FAILURE" ]; then
    FAILURE="backup.sh exited $code"
  fi
  write_status
}
trap on_exit EXIT

fail() {
  FAILURE="$1"
  echo "backup failed: $1" >&2
  exit 1
}

# --- database ---------------------------------------------------------------
# Write to a temporary name first and rename on success. A backup file that
# exists but is a truncated dump is worse than no file: it looks like safety.
pg_dump --no-owner --no-privileges | gzip -9 > "$DB_FILE.part" || {
  rm -f "$DB_FILE.part"
  fail 'pg_dump failed'
}

# `pg_dump` ends a complete plain-text dump with this line. It is the only
# evidence inside the archive that the stream was not cut short — a truncated
# dump is still valid gzip, still restores without an error, and stops at
# whichever table the connection died on.
if ! gzip -dc "$DB_FILE.part" | tail -c 200 | grep -q 'PostgreSQL database dump complete'; then
  rm -f "$DB_FILE.part"
  fail 'the dump has no completion trailer, so it is truncated'
fi

mv "$DB_FILE.part" "$DB_FILE"
DB_BYTES="$(wc -c < "$DB_FILE" | tr -d ' ')"

# --- uploaded files ---------------------------------------------------------
# Both directories, private first. Missing dirs are not an error: a fresh
# install has no uploads yet.
UPLOADS="${UPLOADS_DIR:-/app/uploads}"
PRIVATE="${PRIVATE_UPLOADS_DIR:-/app/private-uploads}"
TAR_TARGETS=""
[ -d "$PRIVATE" ] && TAR_TARGETS="$TAR_TARGETS $PRIVATE"
[ -d "$UPLOADS" ] && TAR_TARGETS="$TAR_TARGETS $UPLOADS"

if [ -n "$TAR_TARGETS" ]; then
  # stderr used to go to /dev/null, which hid "file changed as we read it" and
  # every real reason tar can fail with it (audit A11, L13).
  tar_status=0
  # shellcheck disable=SC2086 — word splitting is what builds the target list.
  tar -czf "$FILES_FILE.part" $TAR_TARGETS || tar_status=$?

  if [ "$tar_status" -ne 0 ]; then
    # A patient uploading during the run makes tar exit 1 with the file it was
    # reading a moment out of date; everything else it exits non-zero for is a
    # broken archive. busybox and GNU tar disagree about the codes, so the
    # archive decides: if it unpacks, keep it and say what happened.
    if gzip -t "$FILES_FILE.part" 2>/dev/null; then
      echo "warning: tar exited $tar_status — a file changed while it was being archived" >&2
    else
      rm -f "$FILES_FILE.part"
      fail "tar exited $tar_status and left an unreadable archive"
    fi
  fi

  mv "$FILES_FILE.part" "$FILES_FILE"
  FILES_BYTES="$(wc -c < "$FILES_FILE" | tr -d ' ')"
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
  # The status file is written after this, so the copy that lands off-site is
  # the previous run's. That is the right way round: an off-site status file
  # claiming success for a sync that had not happened yet would be a lie.
  rclone sync "$BACKUP_DIR" "$RCLONE_REMOTE" --config "${RCLONE_CONFIG:-/config/rclone/rclone.conf}" || {
    fail "off-site sync to $RCLONE_REMOTE failed"
  }
  echo "off-site sync ok: $RCLONE_REMOTE"
else
  echo "off-site sync skipped: RCLONE_REMOTE not set"
fi
