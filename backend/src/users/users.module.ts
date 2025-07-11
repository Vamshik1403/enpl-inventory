import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TicketsService } from 'src/tickets/tickets.service';

@Module({
  imports:[PrismaModule],
  controllers: [UsersController],
  providers: [UserService, PrismaService,TicketsService],
  exports: [UserService], 
})
export class UsersModule {}
