-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totpFailedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totpLockedUntil" TIMESTAMP(3);
