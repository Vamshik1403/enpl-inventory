/*
  Warnings:

  - You are about to drop the column `departmentId` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `userTypeId` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `departmentName` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_userTypeId_fkey";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "departmentId",
DROP COLUMN "userTypeId",
ADD COLUMN     "departmentName" TEXT NOT NULL,
ADD COLUMN     "userType" TEXT NOT NULL;

-- DropTable
DROP TABLE "Department";

-- DropTable
DROP TABLE "UserType";
