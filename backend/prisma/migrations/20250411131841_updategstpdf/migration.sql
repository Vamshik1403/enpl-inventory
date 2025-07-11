/*
  Warnings:

  - The `contactNumber` column on the `Site` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `emailId` column on the `Site` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `contactName` column on the `Site` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "gstpdf" TEXT;

-- AlterTable
ALTER TABLE "Site" DROP COLUMN "contactNumber",
ADD COLUMN     "contactNumber" JSONB,
DROP COLUMN "emailId",
ADD COLUMN     "emailId" JSONB,
DROP COLUMN "contactName",
ADD COLUMN     "contactName" JSONB;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "gstpdf" TEXT;
