-- CreateTable
CREATE TABLE "TaskType" (
    "id" SERIAL NOT NULL,
    "taskType" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,

    CONSTRAINT "TaskType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskType" ADD CONSTRAINT "TaskType_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
