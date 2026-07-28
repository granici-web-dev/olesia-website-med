-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('tv', 'radio', 'conference', 'press');

-- CreateEnum
CREATE TYPE "MediaEmbedProvider" AS ENUM ('youtube', 'facebook');

-- CreateTable
CREATE TABLE "MediaAppearance" (
    "id" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "outlet" TEXT NOT NULL,
    "show" TEXT,
    "date" TIMESTAMP(3),
    "duration" TEXT,
    "titleRo" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleRu" TEXT,
    "summaryRo" TEXT NOT NULL,
    "summaryEn" TEXT NOT NULL,
    "summaryRu" TEXT,
    "url" TEXT NOT NULL,
    "embedProvider" "MediaEmbedProvider" NOT NULL,
    "embedRef" TEXT NOT NULL,
    "thumbUrl" TEXT NOT NULL,
    "thumbWidth" INTEGER NOT NULL,
    "thumbHeight" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAppearance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaAppearance_active_sortOrder_idx" ON "MediaAppearance"("active", "sortOrder");
