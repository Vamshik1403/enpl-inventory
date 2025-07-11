import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ Create a new Service
  async createService(createServiceDto: CreateServiceDto) {
    const {
      serviceSkuId,
      serviceName,
      serviceDescription,
      SAC,
      departmentId,
      serviceCategoryId,
      serviceSubCategoryId,
    } = createServiceDto;
  
    return this.prisma.service.create({
      data: {
        serviceSkuId,
        serviceName,
        serviceDescription,
        SAC,
        departmentId,
        serviceCategoryId,
        serviceSubCategoryId,
      },
    });
  }
  
  
  
  // ✅ Get all Services
  async getAllServices() {
    return this.prisma.service.findMany({
      include: {
        Department: true,
        serviceCategory: true,
        serviceSubCategory: true,
      },
    });
  }

  // ✅ Get a specific Service by ID
  async getServiceById(id: number) {
    return this.prisma.service.findUnique({
      where: { id },
      include: {
        Department: true,
        serviceCategory: true,
        serviceSubCategory: true,
      },
    });
  }

  // ✅ Update a Service by ID
  async updateService(id: number, updateServiceDto: UpdateServiceDto) {
    const { serviceSkuId, serviceName, serviceDescription, SAC, departmentId, serviceCategoryId, serviceSubCategoryId } = updateServiceDto;

    return this.prisma.service.update({
      where: { id },
      data: {
        serviceSkuId,
        serviceName,
        serviceDescription,
        SAC,
        departmentId,
        serviceCategoryId,
        serviceSubCategoryId,
      },
    });
  }

  // ✅ Delete a Service by ID
  async deleteService(id: number) {
    return this.prisma.service.delete({
      where: { id },
    });
  }
}