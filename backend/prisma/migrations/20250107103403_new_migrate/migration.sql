/*
  Warnings:

  - Added the required column `executiveId` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hodId` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `managerId` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executiveId` to the `Site` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hodId` to the `Site` table without a default value. This is not possible if the table is not empty.
  - Added the required column `managerId` to the `Site` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executiveId` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hodId` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `managerId` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executiveId` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hodId` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `managerId` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "executiveId" INTEGER NOT NULL,
ADD COLUMN     "hodId" INTEGER NOT NULL,
ADD COLUMN     "managerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "executiveId" INTEGER NOT NULL,
ADD COLUMN     "hodId" INTEGER NOT NULL,
ADD COLUMN     "managerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "executiveId" INTEGER NOT NULL,
ADD COLUMN     "hodId" INTEGER NOT NULL,
ADD COLUMN     "managerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "executiveId" INTEGER NOT NULL,
ADD COLUMN     "hodId" INTEGER NOT NULL,
ADD COLUMN     "managerId" INTEGER NOT NULL;
