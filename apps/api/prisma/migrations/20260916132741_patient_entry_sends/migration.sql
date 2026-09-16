-- CreateTable
CREATE TABLE "PatientEntrySend" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "sentById" TEXT,
    "toEmail" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "fileName" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientEntrySend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatientEntrySend_entryId_sentAt_idx" ON "PatientEntrySend"("entryId", "sentAt");

-- AddForeignKey
ALTER TABLE "PatientEntrySend" ADD CONSTRAINT "PatientEntrySend_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "PatientEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientEntrySend" ADD CONSTRAINT "PatientEntrySend_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
