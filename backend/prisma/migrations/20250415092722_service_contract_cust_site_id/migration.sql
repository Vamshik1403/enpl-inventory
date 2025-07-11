/*
  Warnings:

  - The primary key for the `_TaskUsers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_UserDepartments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_TaskUsers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_UserDepartments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerId` to the `ServiceContracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `ServiceContracts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServiceContracts" ADD COLUMN     "customerId" INTEGER NOT NULL,
ADD COLUMN     "siteId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "_TaskUsers" DROP CONSTRAINT "_TaskUsers_AB_pkey";

-- AlterTable
ALTER TABLE "_UserDepartments" DROP CONSTRAINT "_UserDepartments_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_TaskUsers_AB_unique" ON "_TaskUsers"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserDepartments_AB_unique" ON "_UserDepartments"("A", "B");

-- AddForeignKey
ALTER TABLE "ServiceContracts" ADD CONSTRAINT "ServiceContracts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceContracts" ADD CONSTRAINT "ServiceContracts_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
