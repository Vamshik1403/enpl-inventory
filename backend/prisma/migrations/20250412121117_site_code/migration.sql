/*
  Warnings:

  - You are about to drop the column `siteId` on the `Site` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[siteCode]` on the table `Site` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Site_siteId_key";

-- AlterTable
ALTER TABLE "Site" DROP COLUMN "siteId",
ADD COLUMN     "siteCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Site_siteCode_key" ON "Site"("siteCode");
