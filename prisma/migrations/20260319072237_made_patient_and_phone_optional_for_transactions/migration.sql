/*
  Warnings:

  - You are about to drop the column `person` on the `transactions` table. All the data in the column will be lost.
  - Made the column `reason` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "person",
ADD COLUMN     "patient" TEXT,
ALTER COLUMN "reason" SET NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;
