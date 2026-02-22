/*
  Warnings:

  - You are about to drop the column `status` on the `invitation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "invitation_token_status_idx";

-- AlterTable
ALTER TABLE "invitation" DROP COLUMN "status",
ADD COLUMN     "acceptedAt" TIMESTAMP(3);

-- DropEnum
DROP TYPE "INVITATION_STATUS";

-- CreateIndex
CREATE INDEX "invitation_token_idx" ON "invitation"("token");
