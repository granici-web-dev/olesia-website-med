-- CreateEnum
CREATE TYPE "UploadLinkTarget" AS ENUM ('appointment', 'deliverable_order');

-- CreateTable
CREATE TABLE "UploadLink" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "target" "UploadLinkTarget" NOT NULL,
    "appointmentId" TEXT,
    "orderId" TEXT,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consentAt" TIMESTAMP(3),
    "consentVersion" TEXT,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedDocument" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "note" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UploadLink_token_key" ON "UploadLink"("token");

-- CreateIndex
CREATE INDEX "UploadLink_appointmentId_idx" ON "UploadLink"("appointmentId");

-- CreateIndex
CREATE INDEX "UploadLink_orderId_idx" ON "UploadLink"("orderId");

-- CreateIndex
CREATE INDEX "UploadLink_expiresAt_idx" ON "UploadLink"("expiresAt");

-- CreateIndex
CREATE INDEX "UploadedDocument_linkId_idx" ON "UploadedDocument"("linkId");

-- CreateIndex
CREATE INDEX "UploadedDocument_uploadedAt_idx" ON "UploadedDocument"("uploadedAt");

-- AddForeignKey
ALTER TABLE "UploadLink" ADD CONSTRAINT "UploadLink_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadLink" ADD CONSTRAINT "UploadLink_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "DeliverableOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedDocument" ADD CONSTRAINT "UploadedDocument_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "UploadLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
