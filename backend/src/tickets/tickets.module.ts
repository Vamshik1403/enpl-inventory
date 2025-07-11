import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService,PrismaService,UserService]
})
export class TicketsModule {}
