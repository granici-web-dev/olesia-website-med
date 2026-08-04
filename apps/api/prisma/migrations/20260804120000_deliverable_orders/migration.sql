-- CreateEnum
CREATE TYPE "DeliverableProduct" AS ENUM ('menu_7', 'menu_14', 'menu_30', 'protocol_pednutri', 'protocol_complementary');

-- CreateEnum
CREATE TYPE "DeliverableOrderStatus" AS ENUM ('new', 'in_progress', 'delivered', 'canceled');

-- CreateTable
CREATE TABLE "DeliverableOrder" (
    "id" TEXT NOT NULL,
    "product" "DeliverableProduct" NOT NULL,
    "titleRo" TEXT NOT NULL,
    "priceEur" INTEGER NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "phone" TEXT,
    "notes" TEXT,
    "status" "DeliverableOrderStatus" NOT NULL DEFAULT 'new',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliverableOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliverableOrder_status_idx" ON "DeliverableOrder"("status");

-- CreateIndex
CREATE INDEX "DeliverableOrder_createdAt_idx" ON "DeliverableOrder"("createdAt");
