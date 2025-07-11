-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_id_fkey";

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
