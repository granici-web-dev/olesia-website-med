-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "intentKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_intentKey_key" ON "Payment"("intentKey");

