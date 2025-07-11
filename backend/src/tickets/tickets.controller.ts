import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  BadRequestException,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketService: TicketsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true,
    forbidNonWhitelisted: true 
  }))
  async create(@Body() dto: CreateTicketDto) {
    try {
      return await this.ticketService.create(dto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create ticket: ${error.message}`);
    }
  }

  @Get()
  findAll() {
    return this.ticketService.findAllUnfiltered();
  }

  @Get('user/:userId')
  async getTicketsByUserId(@Param('userId', ParseIntPipe) id: number) {
    // Get user details to check their role
    const user = await this.ticketService.getUserById(id);
    
    if (!user) {
      throw new BadRequestException('User not found');
    }
    
    if (user.userType === 'SUPERADMIN') {
      // SUPERADMIN sees all tickets
      return this.ticketService.findAllUnfiltered();
    } else {
      // Regular users see tickets they created OR tickets assigned to them
      return this.ticketService.findTicketsForUser(id);
    }
  }

  @Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.findOne(+id);
  }

    @Get('count/all')
  async countAllTickets(): Promise<number> {
    return this.ticketService.countTickets();
  }

  @Get('count/open')
async countOpenTickets(): Promise<number> {
  return this.ticketService.countTicketsByStatus('OPEN');
}

  @Get('count/closed')
async countClosedTickets(): Promise<number> {
  return this.ticketService.countTicketsByStatus('CLOSED');
}

  @Get('count/inprogress')
async countInprogressTickets(): Promise<number> {
  return this.ticketService.countTicketsByStatus('IN_PROGRESS');
}

  @Get('count/resolved')
async countResolvedTickets(): Promise<number> {
  return this.ticketService.countTicketsByStatus('RESOLVED');
}

  @Get('count/reopened')
async countReopenedTickets(): Promise<number> {
  return this.ticketService.countTicketsByStatus('REOPENED');
}




  @Patch(':id')
  updateTicket(@Param('id') id: string, @Body() data: UpdateTicketDto) {
    const ticketId = Number(id);
    if (isNaN(ticketId)) {
      throw new BadRequestException('Invalid ticket ID');
    }
    return this.ticketService.update(ticketId, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketService.remove(+id);
  }
}
