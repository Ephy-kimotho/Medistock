/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "invitation_request_requestedById_status_idx";

-- DropIndex
DROP INDEX "user_email_phone_key";

-- CreateIndex
CREATE INDEX "invitation_request_status_idx" ON "invitation_request"("status");

-- CreateIndex
CREATE INDEX "invitation_request_requestedById_idx" ON "invitation_request"("requestedById");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
