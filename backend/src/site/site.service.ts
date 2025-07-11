import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

@Injectable()
export class SiteService {
  constructor(private prisma: PrismaService) {}

  async create(createSiteDto: CreateSiteDto, customerId: number) {
    // 1. Get the customer to retrieve customerCode
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { customerCode: true },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const customerCode = customer.customerCode; // e.g., ENPL-CUS-0525-00001

    // 2. Find the highest siteCode for this customer
    const lastSite = await this.prisma.site.findFirst({
      where: {
        customerId: customerId,
        siteCode: {
          startsWith: `${customerCode}-S`, // Ensure it's specific to this customer
        },
      },
      orderBy: {
        siteCode: 'desc',
      },
      select: {
        siteCode: true,
      },
    });

    // 3. Determine next site serial
    let nextSiteNumber = 1;
    if (lastSite?.siteCode) {
      const lastSerial = lastSite.siteCode.split('-S')[1]; // e.g., '00005'
      if (lastSerial) {
        nextSiteNumber = parseInt(lastSerial, 10) + 1;
      }
    }

    // 4. Construct new siteCode
    const nextSiteCode = `${customerCode}-S${String(nextSiteNumber).padStart(5, '0')}`;

    // 5. Create the new site with generated siteCode
    return this.prisma.site.create({
      data: {
        siteCode: nextSiteCode,
        siteName: createSiteDto.siteName,
        siteAddress: createSiteDto.siteAddress,
        contactName: createSiteDto.contactName,
        contactNumber: createSiteDto.contactNumber,
        emailId: createSiteDto.emailId,
        state: createSiteDto.state,
        city: createSiteDto.city,
        gstNo: createSiteDto.gstNo,
        gstpdf: createSiteDto.gstpdf,
        Customer: {
          connect: { id: customerId },
        },
      },
    });
  }

  // Count total number of sites
  async countSites(): Promise<number> {
    return this.prisma.site.count();
  }

  // Get all Sites
  async findAll() {
    return this.prisma.site.findMany({
      include: {
        Customer: true, // This will also return the related Customer data
        Task: true, // Include related tasks if needed
      },
    });
  }

  // Get Sites by Customer ID
  async findByCustomerId(customerId: number) {
    return this.prisma.site.findMany({
      where: { customerId: customerId },
    });
  }

  // Get a specific Site by ID
  async findOne(id: number) {
    return this.prisma.site.findUnique({
      where: { id },
      include: {
        Customer: true, // Include customer data for editing
        Task: true, // Include related tasks if needed
      },
    });
  }

  // Update Site details
  async update(id: number, updateSiteDto: UpdateSiteDto) {
    return this.prisma.site.update({
      where: { id },
      data: {
        ...updateSiteDto,
        customerId: Number(updateSiteDto.customerId), // Ensure correct handling of customerId
      },
    });
  }

  // Delete a Site
  async remove(id: number) {
    return this.prisma.site.delete({
      where: { id },
    });
  }
}
