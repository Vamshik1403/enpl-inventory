import { Body, Controller, Post, Get, Param, ParseIntPipe, Delete, Put, BadRequestException } from '@nestjs/common';
import { ServicecontractService } from './servicecontract.service';
import { CreateServiceContractDto } from './dto/create-contract-inventory.dto';

@Controller('servicecontracts')
export class ServicecontractController {
    constructor(private readonly servicecontractService: ServicecontractService) {}
    
    @Post()
    async create(@Body() createDto: CreateServiceContractDto) {
      try {
        return await this.servicecontractService.create(createDto);
      } catch (error) {
        console.error('Error creating service contract:', error);
        
        // Handle Prisma constraint errors
        if (error.code === 'P2002') {
          const field = error.meta?.target?.[0];
          if (field === 'contractNo') {
            throw new BadRequestException('A contract with this number already exists');
          }
        }
        
        // Handle validation errors
        if (error.message && error.message.includes('Invalid')) {
          throw new BadRequestException(error.message);
        }
        
        throw new BadRequestException('Invalid service contract data');
      }
    }
  
    @Get()
    findAll() {
      return this.servicecontractService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.servicecontractService.findOne(id);
    }
  
    @Put(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDto: CreateServiceContractDto,
    ) {
      return this.servicecontractService.update(id, updateDto);
    }
  
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.servicecontractService.remove(id);
    }

}
