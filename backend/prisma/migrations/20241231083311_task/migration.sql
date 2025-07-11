-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "taskTypeId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerAddress" TEXT NOT NULL,
    "gstNo" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactNo" INTEGER NOT NULL,
    "emailId" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_taskTypeId_fkey" FOREIGN KEY ("taskTypeId") REFERENCES "TaskType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
