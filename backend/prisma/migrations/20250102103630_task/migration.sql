/*
  Warnings:

  - You are about to drop the column `taskTypeId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `TaskType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `serviceId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_taskTypeId_fkey";

-- DropForeignKey
ALTER TABLE "TaskType" DROP CONSTRAINT "TaskType_departmentId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "taskTypeId",
ADD COLUMN     "serviceId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "TaskType";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
