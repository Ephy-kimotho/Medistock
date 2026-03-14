/*
  Warnings:

  - You are about to drop the column `description` on the `medicines` table. All the data in the column will be lost.
  - You are about to drop the column `scientificName` on the `medicines` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "medicines" DROP COLUMN "description",
DROP COLUMN "scientificName";
