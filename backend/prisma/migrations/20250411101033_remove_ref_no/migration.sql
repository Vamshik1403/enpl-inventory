/*
  Warnings:

  - You are about to drop the column `referenceNumber` on the `BankDetail` table. All the data in the column will be lost.
  - You are about to drop the column `referenceNumber` on the `Vendor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BankDetail" DROP COLUMN "referenceNumber";

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "referenceNumber";
