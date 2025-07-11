/*
  Warnings:

  - Added the required column `contactName` to the `Site` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteAddress` to the `Site` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "contactName" TEXT NOT NULL,
ADD COLUMN     "siteAddress" TEXT NOT NULL;
