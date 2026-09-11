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
set -o pipefail

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

# --- is this archive worth restoring at all? --------------------------------
# Both checks run BEFORE the schema is dropped, because the failure they catch
# used to be found afterwards: a truncated dump is valid gzip and applies
# without an error up to the point where it was cut, so the schema went, half
# the tables came back, and the script printed "restore ok" (audit A11, L14).
echo "checking $DB_DUMP"
if ! gzip -t "$DB_DUMP"; then
  echo "the archive is not readable gzip, so there is nothing to restore" >&2
  exit 1
fi
if ! gzip -dc "$DB_DUMP" | tail -c 200 | grep -q 'PostgreSQL database dump complete'; then
  echo "the dump has no completion trailer, so it is truncated: refusing to" >&2
  echo "drop a working schema for it. Use an older backup." >&2
  exit 1
fi

if [ -n "$FILES_ARCHIVE" ]; then
  if [ ! -f "$FILES_ARCHIVE" ]; then
    echo "no such files archive: $FILES_ARCHIVE" >&2
    exit 2
  fi
  if ! gzip -t "$FILES_ARCHIVE"; then
    echo "the files archive is not readable gzip: $FILES_ARCHIVE" >&2
    exit 1
  fi
fi

echo "restoring $DB_DUMP into $PGDATABASE on $PGHOST"

# `pg_dump` here is schema-scoped, so wipe the schema rather than the database:
# it works without superuser and without disconnecting other sessions first.
psql -v ON_ERROR_STOP=1 -c 'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;'
gzip -dc "$DB_DUMP" | psql -v ON_ERROR_STOP=1 --quiet

if [ -n "$FILES_ARCHIVE" ]; then
  # tar strips the leading slash when it writes, so the archive holds
  # `app/uploads/...`; unpacking at / lands them back on /app/uploads because
  # that is where the volumes are mounted. This only works from the `restore`
  # service in docker-compose.prod.yml — the `backup` service mounts both
  # upload volumes read-only, and tar fails there rather than half-restoring.
  echo "restoring files from $FILES_ARCHIVE"
  tar -xzf "$FILES_ARCHIVE" -C /
fi

# --- what came back ---------------------------------------------------------
# A count per table, printed rather than asserted: there is no number this
# script could know is right, and a person doing a drill can tell an empty
# practice from a full one at a glance. Zero users is the one line that is
# wrong after any restore at all.
#
# `to_regclass` rather than six counts in a UNION, because the backup you reach
# for in an emergency may predate a table — `Payment` is three days old — and a
# summary that fails on that would report a good restore as a bad one.
echo
echo "rows restored:"
psql -v ON_ERROR_STOP=1 --quiet <<'SQL'
DO $$
DECLARE
  table_name text;
  row_count bigint;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'User', 'Service', 'Appointment', 'Patient', 'UploadedDocument', 'Payment'
  ] LOOP
    IF to_regclass(format('public.%I', table_name)) IS NULL THEN
      RAISE INFO '  % not in this backup', rpad(table_name, 18);
    ELSE
      EXECUTE format('SELECT count(*) FROM public.%I', table_name) INTO row_count;
      RAISE INFO '  % %', rpad(table_name, 18), row_count;
    END IF;
  END LOOP;
END $$;
SQL

echo
echo "restore ok"
echo "Now check: services list is populated, an appointment opens, and an"
echo "uploaded document still downloads — the last one is what proves the"
echo "files came back too, not just their database rows."
