/*
  Warnings:

  - You are about to drop the column `email` on the `invitation` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `invitation` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `invitation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[requestId]` on the table `invitation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `requestId` to the `invitation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "REQUEST_STATUS" AS ENUM ('pending', 'sent');

-- AlterEnum
ALTER TYPE "USER_ROLE" ADD VALUE 'hr';

-- DropIndex
DROP INDEX "invitation_email_key";

-- AlterTable
ALTER TABLE "invitation" DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "role",
ADD COLUMN     "requestId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "employeeId" TEXT;

-- CreateTable
CREATE TABLE "invitation_request" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "USER_ROLE" NOT NULL DEFAULT 'user',
    "employeeId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "status" "REQUEST_STATUS" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitation_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitation_request_email_key" ON "invitation_request"("email");

-- CreateIndex
CREATE INDEX "invitation_request_status_idx" ON "invitation_request"("status");

-- CreateIndex
CREATE INDEX "invitation_request_requestedById_idx" ON "invitation_request"("requestedById");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_requestId_key" ON "invitation"("requestId");

-- AddForeignKey
ALTER TABLE "invitation_request" ADD CONSTRAINT "invitation_request_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "invitation_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
