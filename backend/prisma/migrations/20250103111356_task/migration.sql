/*
  Warnings:

  - Added the required column `executiveId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hodId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `managerId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "executiveId" INTEGER NOT NULL,
ADD COLUMN     "hodId" INTEGER NOT NULL,
ADD COLUMN     "managerId" INTEGER NOT NULL;
