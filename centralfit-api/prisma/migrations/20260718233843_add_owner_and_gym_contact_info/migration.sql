-- DropIndex
DROP INDEX "User_gymId_idx";

-- AlterTable
ALTER TABLE "Gym" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cedula" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "phone" TEXT;
