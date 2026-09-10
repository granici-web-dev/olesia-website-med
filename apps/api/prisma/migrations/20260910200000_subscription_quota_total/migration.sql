-- Generated, then hand-corrected on the Subscription column.
--
-- `prisma migrate dev` emitted DROP COLUMN "videoQuotaPerMonth" followed by
-- ADD COLUMN "videoQuotaTotal", which would have thrown away every quota the
-- practice had sold and reset each subscription to the new default. This is a
-- rename plus a unit change, not a new column.
--
-- The unit change is the point (audit A5, F10). The column counted video calls
-- per month, nothing ever reset it on a month boundary, and the back office
-- rendered `videoQuotaPerMonth * 3` — so what the doctor read as the quota was
-- always three times what the API stored and enforced. Multiplying by the same
-- 3 makes the stored number mean what the screen has been saying all along;
-- the new default, 6, is the old default of 2 through the same conversion.

ALTER TABLE "Subscription" RENAME COLUMN "videoQuotaPerMonth" TO "videoQuotaTotal";
UPDATE "Subscription" SET "videoQuotaTotal" = "videoQuotaTotal" * 3;
ALTER TABLE "Subscription" ALTER COLUMN "videoQuotaTotal" SET DEFAULT 6;

-- The rest is as generated.

-- AlterTable
ALTER TABLE "DeliverableOrder" ADD COLUMN     "patientId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "checkoutId" DROP NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "authorId" TEXT;

-- CreateIndex
CREATE INDEX "DeliverableOrder_patientId_idx" ON "DeliverableOrder"("patientId");

-- AddForeignKey
ALTER TABLE "DeliverableOrder" ADD CONSTRAINT "DeliverableOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
