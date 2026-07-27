/*
  Warnings:

  - A unique constraint covering the columns `[gymId,cedula]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Member_gymId_cedula_key" ON "Member"("gymId", "cedula");
