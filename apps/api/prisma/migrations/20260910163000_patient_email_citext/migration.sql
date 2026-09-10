-- Hand-written. The generated migration for `@db.Citext` is one line:
--
--   ALTER TABLE "Patient" ALTER COLUMN "email" SET DATA TYPE CITEXT;
--
-- and running only that line would be wrong twice over.
--
-- First, the extension has to exist before the type does. Second, and the
-- reason this is not left to generation: the column already holds addresses
-- in whatever case they were typed in, because nothing normalized them
-- (audit A3, F12). `Ana@Gmail.com` and `ana@gmail.com` are two dossiers for
-- one child today, and after the ALTER they collide on the unique index. The
-- ALTER would fail with Postgres's own message naming an index, which tells
-- an operator nothing about what to do.
--
-- So: normalize first, and if that leaves a genuine collision, stop with a
-- message that names the rows. Merging two medical records is a decision for
-- the doctor, never for a migration.

CREATE EXTENSION IF NOT EXISTS citext;

UPDATE "Patient" SET "email" = lower(btrim("email"));

DO $$
DECLARE
  collision text;
BEGIN
  SELECT string_agg(dup.detail, '; ') INTO collision
  FROM (
    SELECT "email" || ' -> ' || string_agg("id", ', ') AS detail
    FROM "Patient"
    GROUP BY "email"
    HAVING count(*) > 1
  ) AS dup;

  IF collision IS NOT NULL THEN
    RAISE EXCEPTION
      'Two patient records share an address once case is normalized: %. Merge them in the back office before applying this migration — a migration must not decide which medical history survives.',
      collision;
  END IF;
END $$;

-- AlterTable
ALTER TABLE "Patient" ALTER COLUMN "email" SET DATA TYPE CITEXT;
