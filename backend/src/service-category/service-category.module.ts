import { Module } from '@nestjs/common';
import { ServiceCategoryService } from './service-category.service';
import { ServiceCategoryController } from './service-category.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [ServiceCategoryService,PrismaService],
  controllers: [ServiceCategoryController],
  exports: [ServiceCategoryService], // Export if used in other modules
})
export class ServiceCategoryModule {}
