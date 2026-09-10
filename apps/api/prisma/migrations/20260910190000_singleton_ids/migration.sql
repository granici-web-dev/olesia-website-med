-- Hand-written. `prisma migrate dev` would have emitted a bare ALTER COLUMN
-- DROP DEFAULT on both tables, which is only half of the change and destroys
-- nothing but fixes nothing either: the rows already there keep their UUID
-- primary keys, so the very next upsert on the literal id `singleton` inserts
-- a *second* row and the tables end up in the state this migration exists to
-- rule out (audit A5, F4).
--
-- Both tables are singletons by intent and neither has ever been referenced by
-- a foreign key, so collapsing them to one row loses no relation. Where more
-- than one row exists — which is what the create-on-first-read race produced —
-- the most recently updated one is the one the back office last saved, and the
-- others are the losers of that race. Keep the newest, delete the rest,
-- rename what survives.

DELETE FROM "AboutPage"
WHERE "id" <> (SELECT "id" FROM "AboutPage" ORDER BY "updatedAt" DESC, "id" ASC LIMIT 1);

DELETE FROM "WorkingHours"
WHERE "id" <> (SELECT "id" FROM "WorkingHours" ORDER BY "updatedAt" DESC, "id" ASC LIMIT 1);

UPDATE "AboutPage" SET "id" = 'singleton';
UPDATE "WorkingHours" SET "id" = 'singleton';

ALTER TABLE "AboutPage" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "WorkingHours" ALTER COLUMN "id" DROP DEFAULT;
