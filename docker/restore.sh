#!/bin/sh
# Restore a backup produced by `backup.sh`.
#
# This script exists to be RUN, not to be read. A backup nobody has ever
# restored is a hope, not a backup — do a restore drill on a scratch database
# after the first deploy and after any Postgres major-version change, and write
# the date it last succeeded into docs/deployment.md.
#
# Usage:
#     ./restore.sh /backups/db-20260804-030000.sql.gz [/backups/files-….tar.gz]
#
# ⚠ It DROPS and recreates the target schema. Point PGDATABASE at a scratch
# database for a drill; only aim it at production during an actual recovery.

set -eu

DB_DUMP="${1:-}"
FILES_ARCHIVE="${2:-}"

if [ -z "$DB_DUMP" ]; then
  echo "usage: restore.sh <db-dump.sql.gz> [files-archive.tar.gz]" >&2
  exit 2
fi
if [ ! -f "$DB_DUMP" ]; then
  echo "no such dump: $DB_DUMP" >&2
  exit 2
fi

: "${PGHOST:=postgres}"
: "${PGUSER:=olesia}"
: "${PGDATABASE:=olesia}"
export PGHOST PGUSER PGDATABASE PGPASSWORD

echo "restoring $DB_DUMP into $PGDATABASE on $PGHOST"

# `pg_dump` here is schema-scoped, so wipe the schema rather than the database:
# it works without superuser and without disconnecting other sessions first.
psql -v ON_ERROR_STOP=1 -c 'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;'
gzip -dc "$DB_DUMP" | psql -v ON_ERROR_STOP=1 --quiet

if [ -n "$FILES_ARCHIVE" ]; then
  if [ ! -f "$FILES_ARCHIVE" ]; then
    echo "no such files archive: $FILES_ARCHIVE" >&2
    exit 2
  fi
  # tar strips the leading slash when it writes, so the archive holds
  # `app/uploads/...`; unpacking at / lands them back on /app/uploads because
  # that is where the volumes are mounted. This only works from the `restore`
  # service in docker-compose.prod.yml — the `backup` service mounts both
  # upload volumes read-only, and tar fails there rather than half-restoring.
  echo "restoring files from $FILES_ARCHIVE"
  tar -xzf "$FILES_ARCHIVE" -C /
fi

echo "restore ok"
echo "Now check: services list is populated, an appointment opens, and an"
echo "uploaded document still downloads — the last one is what proves the"
echo "files came back too, not just their database rows."
