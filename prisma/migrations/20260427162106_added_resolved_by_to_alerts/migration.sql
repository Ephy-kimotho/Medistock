/*
  Warnings:

  - The values [dismissed] on the enum `ALERT_STATUS` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ALERT_STATUS_new" AS ENUM ('pending', 'read', 'resolved');
ALTER TABLE "public"."alerts" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "alerts" ALTER COLUMN "status" TYPE "ALERT_STATUS_new" USING ("status"::text::"ALERT_STATUS_new");
ALTER TYPE "ALERT_STATUS" RENAME TO "ALERT_STATUS_old";
ALTER TYPE "ALERT_STATUS_new" RENAME TO "ALERT_STATUS";
DROP TYPE "public"."ALERT_STATUS_old";
ALTER TABLE "alerts" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "alerts" ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "resolvedById" TEXT,
ALTER COLUMN "readAt" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
