import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}
 async create(data: CreateMessageDto) {
    // 1. Get the current ticket with its status and assigned technician
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: data.ticketId },
      select: { status: true, assignedToId: true },
    });

    if (!ticket) throw new Error('Ticket not found');

    // 2. Get the sender's userType
    const sender = await this.prisma.users.findUnique({
      where: { id: data.senderId },
      select: { userType: true },
    });

    if (!sender) throw new Error('Sender not found');

    // 3. Create the message
    const message = await this.prisma.message.create({
      data: {
        content: data.content,
        status: ticket.status,
        ticket: {
          connect: { id: data.ticketId },
        },
        sender: {
          connect: { id: data.senderId },
        },
      },
    });

    // 4. Handle automatic status transitions
    const isAdmin = sender.userType === 'SUPERADMIN';
    const isUser = !isAdmin;
    const isAssignedTechnician = data.senderId === ticket.assignedToId;

    // ✅ Only change to IN_PROGRESS if assigned technician replies
    if (ticket.status === 'OPEN' && isAssignedTechnician) {
      await this.prisma.ticket.update({
        where: { id: data.ticketId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    // ✅ If ticket is CLOSED and a user replies, change to REOPENED
    if (ticket.status === 'CLOSED' && isUser) {
      await this.prisma.ticket.update({
        where: { id: data.ticketId },
        data: { status: 'REOPENED' },
      });
    }

    return message;
  }


  findAll(ticketId: number) {
    return this.prisma.message.findMany({
      where: { ticketId },
      include: { sender: true },
    });
  }


}
