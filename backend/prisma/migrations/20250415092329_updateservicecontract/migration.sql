/*
  Warnings:

  - You are about to drop the column `customerId` on the `ServiceContracts` table. All the data in the column will be lost.
  - You are about to drop the column `siteId` on the `ServiceContracts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceContracts" DROP CONSTRAINT "ServiceContracts_customerId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceContracts" DROP CONSTRAINT "ServiceContracts_siteId_fkey";

-- AlterTable
ALTER TABLE "ServiceContracts" DROP COLUMN "customerId",
DROP COLUMN "siteId";
