/*
  Warnings:

  - You are about to drop the column `dosage` on the `medicines` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DOSAGE_FREQUENCY" AS ENUM ('once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'every_4_hours', 'every_6_hours', 'every_8_hours', 'as_needed', 'single_dose');

-- AlterTable
ALTER TABLE "medicines" DROP COLUMN "dosage",
ADD COLUMN     "dosageDays" INTEGER,
ADD COLUMN     "dosageFrequency" "DOSAGE_FREQUENCY",
ADD COLUMN     "dosageQuantity" INTEGER,
ALTER COLUMN "unitPrice" DROP DEFAULT;
