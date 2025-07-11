import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  // Create a new Service
  @Post()
  async createService(@Body() createServiceDto: CreateServiceDto) {
    return this.serviceService.createService(createServiceDto);
  }

  // Get all Services
  @Get()
  async getAllServices() {
    return this.serviceService.getAllServices();
  }

  // Get a specific Service by ID
  @Get(':id')
  async getServiceById(@Param('id') id: string) {
    return this.serviceService.getServiceById(Number(id)); // Convert the string to a number
  }

  // Update a Service by ID
  @Put(':id')
  async updateService(
    @Param('id') id: string, // Keep as string to receive from route parameter
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.serviceService.updateService(Number(id), updateServiceDto); // Convert to number
  }

  // Delete a Service by ID
  @Delete(':id')
  async deleteService(@Param('id') id: string) {
    return this.serviceService.deleteService(Number(id)); // Convert to number
  }
}
