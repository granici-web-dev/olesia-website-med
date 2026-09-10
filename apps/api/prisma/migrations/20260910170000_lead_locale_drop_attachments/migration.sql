-- Hand-written for the DROP, generated for the rest.
--
-- `QuickQuestion.attachments` was a public, unbounded string array that the
-- site never sent and the back office only ever rendered a filename from
-- (audit A3, F15). Dropping a column is not reversible, so the check that it
-- is empty belongs in the migration rather than in someone's memory of having
-- run it: if a row ever did carry an attachment, this stops instead of
-- throwing the reference away.

DO $$
DECLARE
  carrying int;
BEGIN
  SELECT count(*) INTO carrying
  FROM "QuickQuestion"
  WHERE array_length("attachments", 1) > 0;

  IF carrying > 0 THEN
    RAISE EXCEPTION
      '% EXPRESS ticket(s) still reference attachments. Save those references before dropping the column — nothing else in the system knows about them.',
      carrying;
  END IF;
END $$;

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('ro', 'en', 'ru');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "locale" "Locale" NOT NULL DEFAULT 'ro';
ALTER TABLE "Subscription" ADD COLUMN "locale" "Locale" NOT NULL DEFAULT 'ro';
ALTER TABLE "ContactMessage" ADD COLUMN "locale" "Locale" NOT NULL DEFAULT 'ro';
ALTER TABLE "DeliverableOrder" ADD COLUMN "locale" "Locale" NOT NULL DEFAULT 'ro';
ALTER TABLE "QuickQuestion" ADD COLUMN "locale" "Locale" NOT NULL DEFAULT 'ro';

-- AlterTable
ALTER TABLE "QuickQuestion" DROP COLUMN "attachments";
