/*
  Warnings:

  - You are about to drop the column `serviceTypeId` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the `ServiceType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `departmentId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_serviceTypeId_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "serviceTypeId",
ADD COLUMN     "departmentId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ServiceType";

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
