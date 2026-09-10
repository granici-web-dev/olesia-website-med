-- CreateEnum
CREATE TYPE "PaymentTargetType" AS ENUM ('appointment', 'quick_question', 'deliverable_order', 'subscription', 'material');

-- CreateEnum
CREATE TYPE "PaymentState" AS ENUM ('created', 'pending', 'paid', 'failed', 'expired', 'abandoned', 'cancelled', 'refunded', 'partially_refunded');

-- CreateEnum
CREATE TYPE "RefundState" AS ENUM ('created', 'accepted', 'failed');

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "checkoutId" TEXT NOT NULL,
    "paymentId" TEXT,
    "orderId" TEXT NOT NULL,
    "state" "PaymentState" NOT NULL DEFAULT 'created',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "method" TEXT,
    "targetType" "PaymentTargetType" NOT NULL,
    "targetId" TEXT,
    "payerName" TEXT,
    "payerEmail" TEXT NOT NULL,
    "payerPhone" TEXT,
    "patientId" TEXT,
    "rrn" TEXT,
    "approvalCode" TEXT,
    "cardMask" TEXT,
    "threeDsResult" TEXT,
    "terminalId" TEXT,
    "refundedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "rawCallback" JSONB,
    "expiresAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentRefund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "refundId" TEXT NOT NULL,
    "state" "RefundState" NOT NULL DEFAULT 'created',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "kind" TEXT,
    "reason" TEXT NOT NULL,
    "authorId" TEXT,
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRefund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_checkoutId_key" ON "Payment"("checkoutId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentId_key" ON "Payment"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_state_idx" ON "Payment"("state");

-- CreateIndex
CREATE INDEX "Payment_patientId_idx" ON "Payment"("patientId");

-- CreateIndex
CREATE INDEX "Payment_payerEmail_idx" ON "Payment"("payerEmail");

-- CreateIndex
CREATE INDEX "Payment_targetType_targetId_idx" ON "Payment"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRefund_refundId_key" ON "PaymentRefund"("refundId");

-- CreateIndex
CREATE INDEX "PaymentRefund_paymentId_idx" ON "PaymentRefund"("paymentId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRefund" ADD CONSTRAINT "PaymentRefund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
