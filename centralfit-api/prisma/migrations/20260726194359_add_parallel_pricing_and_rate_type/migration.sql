-- AlterTable
ALTER TABLE "GymSettings" ADD COLUMN     "rateType" TEXT NOT NULL DEFAULT 'BCV';

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "priceUsdBs" DECIMAL(65,30);
