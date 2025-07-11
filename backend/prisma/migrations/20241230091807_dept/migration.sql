/*
  Warnings:

  - You are about to drop the column `departmentName` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "departmentName";

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "departmentName" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_id_fkey" FOREIGN KEY ("id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
