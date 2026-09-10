-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "calendlyInviteeUri" TEXT,
ADD COLUMN     "rescheduledFromId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_calendlyInviteeUri_key" ON "Appointment"("calendlyInviteeUri");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_rescheduledFromId_key" ON "Appointment"("rescheduledFromId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_rescheduledFromId_fkey" FOREIGN KEY ("rescheduledFromId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

