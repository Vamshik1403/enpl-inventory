/*
  Warnings:

  - You are about to drop the column `contactName` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `contactNo` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `customerAddress` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `emailId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `gstNo` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `requirement` on the `Task` table. All the data in the column will be lost.
  - Added the required column `customerId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proposedDate` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remark` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workScope` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "contactName",
DROP COLUMN "contactNo",
DROP COLUMN "customerAddress",
DROP COLUMN "customerName",
DROP COLUMN "emailId",
DROP COLUMN "gstNo",
DROP COLUMN "requirement",
ADD COLUMN     "customerId" INTEGER NOT NULL,
ADD COLUMN     "priority" TEXT NOT NULL,
ADD COLUMN     "proposedDate" TEXT NOT NULL,
ADD COLUMN     "remark" TEXT NOT NULL,
ADD COLUMN     "siteId" INTEGER NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "workScope" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
