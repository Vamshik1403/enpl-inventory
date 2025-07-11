import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTicketDto) {
    try {
      const {
        title,
        description,
        categoryName,
        subCategoryName,
        serviceCategoryName,
        customerId,
        siteId,
        manCustm,
        manSite,
        contactPerson,
        mobileNo,
        proposedDate,
        priority,
        status,
        createdBy,
        assignedTo,
      } = data;

      // Validate required fields
      if (!title || !description || !priority) {
        throw new BadRequestException('Missing required fields: title, description, and priority are required');
      }

      // Validate createdBy exists
      if (!createdBy || isNaN(Number(createdBy))) {
        throw new BadRequestException('Valid createdBy user ID is required');
      }

      // Generate ticketId: EN-SR-YYMMDDHHMMSS
      const now = new Date();
      const formatNumber = (n: number) => n.toString().padStart(2, '0');
      const YY = now.getFullYear().toString().slice(-2);
      const MM = formatNumber(now.getMonth() + 1);
      const DD = formatNumber(now.getDate());
      const HH = formatNumber(now.getHours());
      const mm = formatNumber(now.getMinutes());
      const SS = formatNumber(now.getSeconds());

      const ticketId = `EN-SR-${YY}${MM}${DD}${HH}${mm}${SS}`;

      return this.prisma.ticket.create({
        data: {
          ticketId,
          title: title.trim(),
          description: description.trim(),
          manCustm: manCustm?.trim() || null,
          manSite: manSite?.trim() || null,
          categoryName: categoryName?.trim() || null,
          subCategoryName: subCategoryName?.trim() || null,
          serviceCategoryName: serviceCategoryName?.trim() || null,
          contactPerson: contactPerson?.trim() || null,
          mobileNo: mobileNo?.trim() || null,
          proposedDate: proposedDate ? new Date(proposedDate) : null,
          priority: priority.trim(),
          status: status || 'OPEN',
          createdById: Number(createdBy), // Use direct field instead of relation
          assignedToId: (assignedTo && assignedTo > 0) ? assignedTo : null, // Use direct field instead of relation
          customerId: (customerId && customerId > 0) ? customerId : null, // Use direct field instead of relation
          siteId: (siteId && siteId > 0) ? siteId : null, // Use direct field instead of relation
        },
        include: {
          createdBy: true,
          assignedTo: true,
          customer: true,
          site: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new BadRequestException('Referenced user, customer, or site not found');
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Ticket with this ID already exists');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Foreign key constraint failed - referenced record not found');
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create ticket: ${error.message}`);
    }
  }

  findAll() {
    return this.prisma.ticket.findMany({ include: { messages: true } });
  }

 // ticket.service.ts
async countTickets(): Promise<number> {
  return this.prisma.ticket.count();
}

  async countTicketsByStatus(status: string): Promise<number> {
    return this.prisma.ticket.count({
      where: { status: status as any },     });
  }

  // Show all tickets (for SUPERADMIN)
  findAllUnfiltered() {
    return this.prisma.ticket.findMany({
      include: { 
        messages: true,
        createdBy: true,
        assignedTo: true,
        customer: true,
        site: true
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get user by ID to check their role
  async getUserById(userId: number) {
    return this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, username: true, userType: true }
    });
  }

  // Show tickets for regular users (created by them OR assigned to them)
  findTicketsForUser(userId: number) {
    return this.prisma.ticket.findMany({
      where: {
        OR: [
          { createdById: userId },        // Tickets they created
          { assignedToId: userId }        // Tickets assigned to them
        ]
      },
      include: { 
        messages: true,
        createdBy: true,
        assignedTo: true,
        customer: true,
        site: true
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Show all tickets created by user (legacy method)
  findByCreatedByAndAssignedTo(userId: number) {
    return this.prisma.ticket.findMany({
      where: {
        createdById: userId,
      },
      include: { messages: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.ticket.findUnique({
      where: { id },
      include: { 
        messages: true,
        createdBy: true,
        assignedTo: true,
        customer: true,
        site: true
      },
    });
  }

  update(id: number, data: UpdateTicketDto) {
    return this.prisma.ticket.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.ticket.delete({ where: { id } });
  }
}
