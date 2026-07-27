-- AlterTable
ALTER TABLE "AboutPage" ADD COLUMN     "contentRu" TEXT,
ADD COLUMN     "titleRu" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "nameRu" TEXT;

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "labelRu" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "contentRu" TEXT,
ADD COLUMN     "excerptRu" TEXT,
ADD COLUMN     "titleRu" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "descriptionRu" TEXT,
ADD COLUMN     "priceLabelRu" TEXT,
ADD COLUMN     "titleRu" TEXT;
