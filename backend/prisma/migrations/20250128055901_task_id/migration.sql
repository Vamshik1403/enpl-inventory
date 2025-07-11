-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "proposedDate" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "taskId" INTEGER;
