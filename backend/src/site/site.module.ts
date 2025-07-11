import { Module } from '@nestjs/common';
import { SiteService } from './site.service';
import { SiteController } from './site.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [SiteService,PrismaService],
  controllers: [SiteController]
})
export class SiteModule {}
