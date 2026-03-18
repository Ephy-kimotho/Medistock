/*
  Warnings:

  - A unique constraint covering the columns `[batchNumber]` on the table `stock_entries` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "stock_entries_batchNumber_key" ON "stock_entries"("batchNumber");
