-- DropForeignKey
ALTER TABLE "MaterialDelivery" DROP CONSTRAINT "MaterialDelivery_customerId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialDelivery" DROP CONSTRAINT "MaterialDelivery_inventoryId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialDelivery" DROP CONSTRAINT "MaterialDelivery_vendorId_fkey";

-- AlterTable
ALTER TABLE "MaterialDelivery" ALTER COLUMN "customerId" DROP NOT NULL,
ALTER COLUMN "vendorId" DROP NOT NULL,
ALTER COLUMN "inventoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MaterialDelivery" ADD CONSTRAINT "MaterialDelivery_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialDelivery" ADD CONSTRAINT "MaterialDelivery_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialDelivery" ADD CONSTRAINT "MaterialDelivery_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
