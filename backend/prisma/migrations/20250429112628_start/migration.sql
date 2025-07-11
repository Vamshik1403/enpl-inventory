/*
  Warnings:

  - You are about to drop the column `inventoryId` on the `MaterialDelivery` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `MaterialDelivery` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MaterialDelivery" DROP CONSTRAINT "MaterialDelivery_inventoryId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialDelivery" DROP CONSTRAINT "MaterialDelivery_productId_fkey";

-- AlterTable
ALTER TABLE "MaterialDelivery" DROP COLUMN "inventoryId",
DROP COLUMN "productId";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "MaterialDeliveryItem" (
    "id" SERIAL NOT NULL,
    "materialDeliveryId" INTEGER NOT NULL,
    "inventoryId" INTEGER,
    "productId" INTEGER NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialDeliveryItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MaterialDeliveryItem" ADD CONSTRAINT "MaterialDeliveryItem_materialDeliveryId_fkey" FOREIGN KEY ("materialDeliveryId") REFERENCES "MaterialDelivery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialDeliveryItem" ADD CONSTRAINT "MaterialDeliveryItem_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialDeliveryItem" ADD CONSTRAINT "MaterialDeliveryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
