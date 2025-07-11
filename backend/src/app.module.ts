import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { CategoryModule } from './category/category.module';
import { ProductsModule } from './products/products.module';
import { ServiceController } from './service/service.controller';
import { ServiceService } from './service/service.service';
import { ServiceModule } from './service/service.module';
import { PrismaModule } from './prisma/prisma.module';
import { VendorModule } from './vendor/vendor.module';
import { CustomerController } from './customer/customer.controller';
import { CustomerModule } from './customer/customer.module';
import { SiteModule } from './site/site.module';
import { SubcategoryModule } from './subcategeory/subcategory.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentModule } from './department/department.module';
import { TaskModule } from './task/task.module';
import { ServiceCategoryController } from './service-category/service-category.controller';
import { ServiceCategoryModule } from './service-category/service-category.module';
import { ServiceSubCategoryService } from './service-sub-category/service-sub-category.service';
import { ServiceSubCategoryModule } from './service-sub-category/service-sub-category.module';
import { InventoryService } from './inventory/inventory.service';
import { InventoryController } from './inventory/inventory.controller';
import { InventoryModule } from './inventory/inventory.module';
import { MaterialDeliveryModule } from './material-delivery/material-delivery.module';
import { ServicecontractModule } from './servicecontract/servicecontract.module';
import { VendorPaymentModule } from './vendor-payment/vendor-payment.module';
import { TicketsModule } from './tickets/tickets.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    UsersModule,
    CategoryModule,
    ProductsModule,
    ServiceModule,
    PrismaModule,
    VendorModule,
    CustomerModule,
    SiteModule,
    SubcategoryModule,
    AuthModule,
    DepartmentModule,
    TaskModule,
    ServiceCategoryModule,
    ServiceSubCategoryModule,
    InventoryModule,
    MaterialDeliveryModule,
    ServicecontractModule,
    VendorPaymentModule,
    TicketsModule,
    MessagesModule,
  ],
  controllers: [ServiceController, CustomerController, ServiceCategoryController, InventoryController],
  providers: [ServiceService, ServiceSubCategoryService, InventoryService],
})
export class AppModule {}
