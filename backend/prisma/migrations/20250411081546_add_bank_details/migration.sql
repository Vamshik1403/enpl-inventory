/*
  Warnings:

  - Added the required column `creditLimit` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creditTerms` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceNumber` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remark` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "creditLimit" TEXT NOT NULL,
ADD COLUMN     "creditTerms" TEXT NOT NULL,
ADD COLUMN     "products" JSONB,
ADD COLUMN     "referenceNumber" TEXT NOT NULL,
ADD COLUMN     "remark" TEXT NOT NULL,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "BankDetail" (
    "id" SERIAL NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "vendorId" INTEGER NOT NULL,

    CONSTRAINT "BankDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorContact" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "contactPhoneNumber" TEXT NOT NULL,
    "contactEmailId" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "landlineNumber" TEXT,
    "vendorId" INTEGER NOT NULL,

    CONSTRAINT "VendorContact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BankDetail" ADD CONSTRAINT "BankDetail_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorContact" ADD CONSTRAINT "VendorContact_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
