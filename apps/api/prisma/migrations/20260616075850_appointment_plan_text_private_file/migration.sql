/*
  Warnings:

  - You are about to drop the column `planUrl` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "planUrl",
ADD COLUMN     "planFileKey" TEXT,
ADD COLUMN     "planFileName" TEXT,
ADD COLUMN     "planText" TEXT;
