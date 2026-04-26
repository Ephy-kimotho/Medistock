/*
  Warnings:

  - You are about to drop the column `patient` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `patientAgeGroup` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "patient",
DROP COLUMN "patientAgeGroup",
DROP COLUMN "phone";
