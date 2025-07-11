import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ServiceSubCategoryService } from './service-sub-category.service';
import { ServiceSubcategoryController } from './service-sub-category.controller';

@Module({
  providers: [ServiceSubCategoryService,PrismaService],
  controllers: [ServiceSubcategoryController],
  exports: [ServiceSubCategoryService], // Export if used in other modules
})
export class ServiceSubCategoryModule {}
