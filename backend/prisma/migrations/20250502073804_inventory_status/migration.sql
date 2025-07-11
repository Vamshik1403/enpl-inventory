/*
  Warnings:

  - Added the required column `duration` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `MaterialDelivery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "duration" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MaterialDelivery" ADD COLUMN     "siteId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "MaterialDelivery" ADD CONSTRAINT "MaterialDelivery_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
