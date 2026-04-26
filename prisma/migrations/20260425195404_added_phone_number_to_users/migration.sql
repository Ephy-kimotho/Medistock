-- AlterTable
ALTER TABLE "invitation_request" ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '0700000000';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '0700000000';
