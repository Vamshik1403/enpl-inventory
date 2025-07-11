/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `subCategoryId` on the `Service` table. All the data in the column will be lost.
  - Added the required column `serviceCategoryId` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceSubCategoryId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_subCategoryId_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "categoryId",
DROP COLUMN "subCategoryId",
ADD COLUMN     "serviceCategoryId" INTEGER NOT NULL,
ADD COLUMN     "serviceSubCategoryId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" SERIAL NOT NULL,
    "categoryName" TEXT NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceSubCategory" (
    "id" SERIAL NOT NULL,
    "subCategoryName" TEXT NOT NULL,
    "serviceCategoryId" INTEGER NOT NULL,

    CONSTRAINT "ServiceSubCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceSubCategory" ADD CONSTRAINT "ServiceSubCategory_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_serviceSubCategoryId_fkey" FOREIGN KEY ("serviceSubCategoryId") REFERENCES "ServiceSubCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
