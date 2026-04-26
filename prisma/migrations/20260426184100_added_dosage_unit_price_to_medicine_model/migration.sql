-- AlterTable
ALTER TABLE "medicines" ADD COLUMN     "dosage" TEXT NOT NULL DEFAULT '2 times daily',
ADD COLUMN     "unitPrice" INTEGER NOT NULL DEFAULT 100;
