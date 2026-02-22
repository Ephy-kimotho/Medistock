/*
  Warnings:

  - You are about to drop the column `userId` on the `invitation` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `reports` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_userId_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_userId_fkey";

-- DropIndex
DROP INDEX "transactions_stockEntriesId_idx";

-- AlterTable
ALTER TABLE "invitation" DROP COLUMN "userId",
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "userId";

-- CreateIndex
CREATE INDEX "transactions_stockEntriesId_type_idx" ON "transactions"("stockEntriesId", "type");

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
