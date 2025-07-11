import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceContractDto } from './dto/create-contract-inventory.dto';
import { UpdateServiceContractDto } from './dto/update-service-contract.dto';

@Injectable()
export class ServicecontractService {
      constructor(private readonly prisma: PrismaService) {}
      async create(createDto: CreateServiceContractDto) {
        const { contractInventories = [], startDate, endDate, ...rest } = createDto;
      
        const validStartDate = new Date(startDate);
        const validEndDate = new Date(endDate);
      
        if (isNaN(validStartDate.getTime()) || isNaN(validEndDate.getTime())) {
          throw new Error("Invalid startDate or endDate");
        }
      
        const currentYear = new Date().getFullYear() + 1; 
      
        const existingContracts = await this.prisma.serviceContracts.findMany({
          where: {
            contractNo: {
              startsWith: `EN-CONT-${currentYear}`,
            },
          },
        });
      
        // 🔢 Generate next sequence
        const sequence = String(existingContracts.length + 1).padStart(2, '0');
      
        // 🧾 Final contract number
        const contractNo = `EN-CONT-${currentYear}-${sequence}`;
          // ✅ Create contract
      const contractData: any = {
        ...rest,
        startDate: validStartDate,
        endDate: validEndDate,
        contractNo,
        visitSite: String(rest.visitSite),
        maintenanceVisit: String(rest.maintenanceVisit),
      };

      // Only add contractInventories if they exist and are not empty
      if (contractInventories && Array.isArray(contractInventories) && contractInventories.length > 0) {
        contractData.contractInventories = {
          create: contractInventories.map((inv) => ({
            ...inv,
            dateOfPurchase: new Date(inv.dateOfPurchase),
          })),
        };
      }

      return this.prisma.serviceContracts.create({
        data: contractData,
        include: {
          contractInventories: true,
          Customer: true,
          Site: true,
        },
      });
      }
      
    
      async findAll() {
        return this.prisma.serviceContracts.findMany({
          include: {
             contractInventories: true, 
             Site: true,
             Customer: true,
            },
        });
      }
    
      async findOne(id: number) {
        return this.prisma.serviceContracts.findUnique({
          where: { id },
          include: { contractInventories: true,
            Site: true,
            Customer: true,
           },
        });
      }
    
      async update(id: number, updateDto: UpdateServiceContractDto) {
        const { contractInventories, ...contractData } = updateDto;
      
        // 🧼 Remove non-updatable fields if present
        delete (contractData as any).id;
        delete (contractData as any).createdAt;
        delete (contractData as any).updatedAt;
        delete (contractData as any).Site;
        delete (contractData as any).Customer;
      
        // 🛠️ Update main contract
        const updatedContract = await this.prisma.serviceContracts.update({
          where: { id },
          data: {
            ...contractData,
            visitSite: String(contractData.visitSite),
            maintenanceVisit: String(contractData.maintenanceVisit),
            startDate: new Date(contractData.startDate),
            endDate: new Date(contractData.endDate),
          },
        });
      
        // 🧹 Remove old inventories
        await this.prisma.contractInventory.deleteMany({
          where: { contractId: id },
        });
      
        // 🆕 Insert new inventories
        if (contractInventories && contractInventories.length > 0) {
          await this.prisma.contractInventory.createMany({
            data: contractInventories.map((item) => ({
              ...item,
              contractId: id,
              dateOfPurchase: new Date(item.dateOfPurchase),
            })),
          });
        }
      
        return updatedContract;
      }
      
      
  
      async remove(id: number) {
        // Step 1: Delete all related inventories first
        await this.prisma.contractInventory.deleteMany({
          where: { contractId: id },
        });
      
        // Step 2: Now delete the service contract
        return this.prisma.serviceContracts.delete({
          where: { id },
        });
      }
      
}
