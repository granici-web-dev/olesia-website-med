-- CreateEnum
CREATE TYPE "MaterialAccess" AS ENUM ('free', 'paid');

-- CreateEnum
CREATE TYPE "MaterialFlag" AS ENUM ('recommended', 'popular', 'new');

-- CreateTable
CREATE TABLE "MaterialCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameRo" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameRu" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MaterialCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "ageKeys" TEXT[],
    "titleRo" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleRu" TEXT,
    "descriptionRo" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionRu" TEXT,
    "pageCount" INTEGER,
    "fileLang" TEXT,
    "access" "MaterialAccess" NOT NULL DEFAULT 'free',
    "price" INTEGER,
    "flags" "MaterialFlag"[],
    "fileUrl" TEXT,
    "fileName" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MaterialCategory_slug_key" ON "MaterialCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Material_slug_key" ON "Material"("slug");

-- CreateIndex
CREATE INDEX "Material_active_sortOrder_idx" ON "Material"("active", "sortOrder");

-- CreateIndex
CREATE INDEX "Material_categoryId_idx" ON "Material"("categoryId");

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MaterialCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
