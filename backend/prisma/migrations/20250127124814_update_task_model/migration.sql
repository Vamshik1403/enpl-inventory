/*
  Warnings:

  - Changed the type of `proposedDate` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "proposedDate",
ADD COLUMN     "proposedDate" TIMESTAMP(3) NOT NULL;
