/*
  Warnings:

  - You are about to drop the `reports` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_generatedById_fkey";

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "processedById" TEXT;

-- DropTable
DROP TABLE "reports";

-- DropEnum
DROP TYPE "REPORT_PERIOD";

-- DropEnum
DROP TYPE "REPORT_TYPE";

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
