/*
  Warnings:

  - The `ageGroup` column on the `medicines` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MEDICINE_AGE_GROUP" AS ENUM ('infant', 'pediatric', 'adult', 'geriatric', 'all_ages');

-- AlterTable
ALTER TABLE "medicines" DROP COLUMN "ageGroup",
ADD COLUMN     "ageGroup" "MEDICINE_AGE_GROUP" NOT NULL DEFAULT 'all_ages';

-- DropEnum
DROP TYPE "CATEGORY_AGE_GROUP";
