-- CreateTable
CREATE TABLE "DeliverableCatalog" (
    "code" "DeliverableProduct" NOT NULL,
    "priceEur" INTEGER NOT NULL,
    "titleRo" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliverableCatalog_pkey" PRIMARY KEY ("code")
);
