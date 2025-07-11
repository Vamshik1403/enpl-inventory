/*
  Warnings:

  - You are about to drop the column `contactName` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Customer` table. All the data in the column will be lost.
  - The `products` column on the `Customer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `duration` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `macAddress` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `serialNumber` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `MaterialDeliveryItem` table. All the data in the column will be lost.
  - You are about to drop the column `contactName` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `Vendor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serviceSkuId]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serviceCatId]` on the table `ServiceCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serviceSubCatId]` on the table `ServiceSubCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creditTerms` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dueDate` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gstAmount` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceGrossAmount` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceNetAmount` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gstRate` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gstNo` to the `Site` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subCategoryId` to the `SubCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_productId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialDelivery" DROP CONSTRAINT "MaterialDelivery_siteId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_departmentId_fkey";

-- DropIndex
DROP INDEX "Customer_customerId_key";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "categoryId" TEXT;

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "contactName",
DROP COLUMN "contactNumber",
DROP COLUMN "customerId",
ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT,
DROP COLUMN "products",
ADD COLUMN     "products" TEXT[];

-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "duration",
DROP COLUMN "macAddress",
DROP COLUMN "productId",
DROP COLUMN "serialNumber",
ADD COLUMN     "creditTerms" TEXT NOT NULL,
ADD COLUMN     "dueDate" TEXT NOT NULL,
ADD COLUMN     "gstAmount" TEXT NOT NULL,
ADD COLUMN     "invoiceGrossAmount" TEXT NOT NULL,
ADD COLUMN     "invoiceNetAmount" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MaterialDelivery" ADD COLUMN     "purchaseInvoiceNo" TEXT,
ADD COLUMN     "quotationNo" TEXT,
ADD COLUMN     "salesOrderNo" TEXT,
ALTER COLUMN "siteId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MaterialDeliveryItem" DROP COLUMN "productName";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "gstRate" TEXT NOT NULL,
ADD COLUMN     "unit" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "serviceSkuId" TEXT,
ALTER COLUMN "departmentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ServiceCategory" ADD COLUMN     "serviceCatId" TEXT;

-- AlterTable
ALTER TABLE "ServiceSubCategory" ADD COLUMN     "serviceSubCatId" TEXT;

-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "city" TEXT,
ADD COLUMN     "gstNo" TEXT NOT NULL,
ADD COLUMN     "gstpdf" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "SubCategory" ADD COLUMN     "subCategoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "contactName",
DROP COLUMN "contactNumber",
ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT;

-- CreateTable
CREATE TABLE "ProductInventory" (
    "id" SERIAL NOT NULL,
    "inventoryId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,
    "warrantyPeriod" TEXT NOT NULL,
    "purchaseRate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorPayment" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "inventoryId" INTEGER,
    "purchaseInvoiceNo" TEXT NOT NULL,
    "invoiceGrossAmount" TEXT NOT NULL,
    "dueAmount" TEXT NOT NULL,
    "paidAmount" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentType" TEXT NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_serviceSkuId_key" ON "Service"("serviceSkuId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_serviceCatId_key" ON "ServiceCategory"("serviceCatId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceSubCategory_serviceSubCatId_key" ON "ServiceSubCategory"("serviceSubCatId");

-- AddForeignKey
ALTER TABLE "MaterialDelivery" ADD CONSTRAINT "MaterialDelivery_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInventory" ADD CONSTRAINT "ProductInventory_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInventory" ADD CONSTRAINT "ProductInventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPayment" ADD CONSTRAINT "VendorPayment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPayment" ADD CONSTRAINT "VendorPayment_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
