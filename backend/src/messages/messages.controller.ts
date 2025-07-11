import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('message')
export class MessagesController {
  constructor(private readonly messageService: MessagesService) {}

  @Post()
async create(@Body() data: CreateMessageDto) {
  return this.messageService.create(data);
}


  @Get(':ticketId')
  findAll(@Param('ticketId') ticketId: string) {
    return this.messageService.findAll(+ticketId);
  }
}