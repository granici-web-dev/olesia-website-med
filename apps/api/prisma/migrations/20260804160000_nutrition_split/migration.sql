-- Split the single `nutrition` service into `nutrition_copii` and
-- `nutrition_adulti` (brief §1).
--
-- Hand-written rather than taken from `prisma migrate diff`: the generated cast
-- is `USING ("code"::text::"ServiceCode_new")`, which fails outright on the
-- existing row still holding 'nutrition'. The CASE below carries that row over
-- to the children's service instead of dropping it — appointments and
-- subscriptions point at `Service.id`, so they follow it and keep working.
--
-- The adults' row is not created here. It is catalog content — title,
-- description, booking link in three languages — and that belongs in the seed,
-- which creates any service whose code is missing.

-- AlterEnum
BEGIN;
CREATE TYPE "ServiceCode_new" AS ENUM ('pediatric', 'nutrition_copii', 'nutrition_adulti', 'integrative', 'monitoring', 'quick_question', 'free_consult');
ALTER TABLE "Service" ALTER COLUMN "code" TYPE "ServiceCode_new"
  USING (CASE WHEN "code"::text = 'nutrition' THEN 'nutrition_copii' ELSE "code"::text END)::"ServiceCode_new";
ALTER TYPE "ServiceCode" RENAME TO "ServiceCode_old";
ALTER TYPE "ServiceCode_new" RENAME TO "ServiceCode";
DROP TYPE "public"."ServiceCode_old";
COMMIT;

-- The carried-over row was the generic nutrition consultation: its title and
-- its Calendly link still describe both audiences. Point it at the children's
-- event and clear the event-type URI — the audience-specific API URIs were
-- never captured, and a wrong one would file a child's booking under the
-- adults' service without saying so. Only touch the row if it still holds the
-- seeded values; anything the client has already edited is left alone.
UPDATE "Service" SET
  "titleRo" = 'Consultație nutrițională pentru copii',
  "titleEn" = 'Nutrition consultation for children',
  "titleRu" = 'Консультация по питанию для детей',
  "calendlyEventTypeUri" = NULL,
  "calendlySchedulingUrl" = 'https://calendly.com/designer-nefele/consultatie-nutritionala-pentru-copii'
WHERE "code" = 'nutrition_copii'
  AND "titleRo" = 'Consultație nutrițională';

-- Make room at position 3 for the adults' service the seed is about to create.
UPDATE "Service" SET "sortOrder" = "sortOrder" + 1
WHERE "code" IN ('integrative', 'monitoring', 'quick_question')
  AND "sortOrder" >= 3;
