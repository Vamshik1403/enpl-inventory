import { Body, Controller, Post, Get, Param, ParseIntPipe, Delete, Put } from '@nestjs/common';
import { ServicecontractService } from './servicecontract.service';
import { CreateServiceContractDto } from './dto/create-contract-inventory.dto';

@Controller('servicecontracts')
export class ServicecontractController {
    constructor(private readonly servicecontractService: ServicecontractService) {}
    
    @Post()
    create(@Body() createDto: CreateServiceContractDto) {
      return this.servicecontractService.create(createDto);
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
