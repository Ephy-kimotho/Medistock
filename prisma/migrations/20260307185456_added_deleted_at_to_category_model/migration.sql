/*
  Warnings:

  - Made the column `name` on table `invitation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "invitation" ALTER COLUMN "name" SET NOT NULL;
