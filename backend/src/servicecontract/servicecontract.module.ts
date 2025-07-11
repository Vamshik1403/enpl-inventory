import { Module } from '@nestjs/common';
import { ServicecontractController } from './servicecontract.controller';
import { ServicecontractService } from './servicecontract.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ServicecontractController],
  providers: [ServicecontractService,PrismaService]
})
export class ServicecontractModule {}
