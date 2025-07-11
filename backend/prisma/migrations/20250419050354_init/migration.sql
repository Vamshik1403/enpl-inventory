/*
  Warnings:

  - You are about to drop the column `EndDate` on the `ServiceContracts` table. All the data in the column will be lost.
  - You are about to drop the column `StartDate` on the `ServiceContracts` table. All the data in the column will be lost.
  - Added the required column `productName` to the `ContractInventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `ServiceContracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `ServiceContracts` table without a default value. This is not possible if the table is not empty.
  - Made the column `contractNo` on table `ServiceContracts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ContractInventory" ADD COLUMN     "productName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ServiceContracts" DROP COLUMN "EndDate",
DROP COLUMN "StartDate",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "contractNo" SET NOT NULL;

-- AlterTable
ALTER TABLE "_TaskUsers" ADD CONSTRAINT "_TaskUsers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_TaskUsers_AB_unique";

-- AlterTable
ALTER TABLE "_UserDepartments" ADD CONSTRAINT "_UserDepartments_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_UserDepartments_AB_unique";
