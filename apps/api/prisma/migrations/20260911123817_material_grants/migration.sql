-- CreateTable
CREATE TABLE "MaterialGrant" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "payerEmail" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxDownloads" INTEGER NOT NULL DEFAULT 10,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastDownloadAt" TIMESTAMP(3),
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialGrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MaterialGrant_token_key" ON "MaterialGrant"("token");

-- CreateIndex
CREATE INDEX "MaterialGrant_expiresAt_idx" ON "MaterialGrant"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialGrant_materialId_payerEmail_key" ON "MaterialGrant"("materialId", "payerEmail");

-- AddForeignKey
ALTER TABLE "MaterialGrant" ADD CONSTRAINT "MaterialGrant_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;
