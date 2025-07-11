-- CreateTable
CREATE TABLE "ServiceContracts" (
    "id" SERIAL NOT NULL,
    "contractNo" TEXT,
    "customerId" INTEGER NOT NULL,
    "siteId" INTEGER NOT NULL,
    "relmanager" TEXT NOT NULL,
    "serviceCategory" TEXT NOT NULL,
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "visitSite" TEXT NOT NULL,
    "maintenanceVisit" TEXT NOT NULL,
    "contractDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceContracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractInventory" (
    "id" SERIAL NOT NULL,
    "contractId" INTEGER NOT NULL,
    "inventoryType" TEXT NOT NULL,
    "inventoryName" TEXT NOT NULL,
    "serialno" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,
    "dateOfPurchase" TIMESTAMP(3) NOT NULL,
    "remark" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractInventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceContracts_contractNo_key" ON "ServiceContracts"("contractNo");

-- AddForeignKey
ALTER TABLE "ServiceContracts" ADD CONSTRAINT "ServiceContracts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceContracts" ADD CONSTRAINT "ServiceContracts_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractInventory" ADD CONSTRAINT "ContractInventory_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "ServiceContracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
