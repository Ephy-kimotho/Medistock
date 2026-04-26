/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `invitation_request` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,phone]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "invitation_request_requestedById_idx";

-- DropIndex
DROP INDEX "invitation_request_status_idx";

-- DropIndex
DROP INDEX "user_email_key";

-- AlterTable
ALTER TABLE "invitation_request" ALTER COLUMN "phone" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "phone" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "invitation_request_phone_key" ON "invitation_request"("phone");

-- CreateIndex
CREATE INDEX "invitation_request_requestedById_status_idx" ON "invitation_request"("requestedById", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_phone_key" ON "user"("email", "phone");
