/*
  Warnings:

  - You are about to drop the column `priceBs` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "priceBs";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "exchangeRateUsed" DECIMAL(65,30),
ALTER COLUMN "amountUsd" DROP NOT NULL,
ALTER COLUMN "amountBs" DROP NOT NULL;
