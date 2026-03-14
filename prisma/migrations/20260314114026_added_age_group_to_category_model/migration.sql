-- CreateEnum
CREATE TYPE "CATEGORY_AGE_GROUP" AS ENUM ('adult', 'pediatric', 'all_ages');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "ageGroup" "CATEGORY_AGE_GROUP" NOT NULL DEFAULT 'all_ages';
