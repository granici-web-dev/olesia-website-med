-- Hand-written: Prisma cannot express a CHECK constraint, and the refundId
-- change is a nullability relaxation that generation would otherwise pair with
-- a needless column rewrite.

-- A refund row is now written before the bank is called, so it exists for a
-- moment without the bank's id. The unique index still holds: Postgres allows
-- many NULLs in a unique column.
ALTER TABLE "PaymentRefund" ALTER COLUMN "refundId" DROP NOT NULL;

-- Last line of defence against refunding more than was taken. The application
-- reserves the amount inside a locked transaction; this is what catches a bug
-- in that logic before it becomes money.
ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_refundedAmount_within_amount"
  CHECK ("refundedAmount" >= 0 AND "refundedAmount" <= "amount");
