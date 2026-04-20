/*
  Warnings:

  - Made the column `processedById` on table `payments` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_processedById_fkey";

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "processedById" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
