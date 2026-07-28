-- The About page carried testimonials as a JSON block. It still held the three
-- fabricated placeholder reviews ("Maria I.", "Andrei P.", "Elena R.") that were
-- deleted from the frontend on 2026-07-26 but never from the database — and
-- since the API list wins over the frontend fallback, those invented reviews
-- were what the homepage actually rendered. Dropping the column removes them;
-- the seed installs the two reviews the client really sent.

-- AlterTable
ALTER TABLE "AboutPage" DROP COLUMN "testimonials";

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "quoteRo" TEXT NOT NULL,
    "quoteEn" TEXT NOT NULL,
    "quoteRu" TEXT,
    "author" TEXT,
    "roleRo" TEXT,
    "roleEn" TEXT,
    "roleRu" TEXT,
    "source" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Testimonial_active_sortOrder_idx" ON "Testimonial"("active", "sortOrder");
