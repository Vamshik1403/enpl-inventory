import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  // Create a Customer with contacts and bankDetails
  async create(createCustomerDto: CreateCustomerDto) {
    const { contacts, bankDetails, products, ...customerData } =
      createCustomerDto as any;

    let parsedProducts = [];

    try {
      parsedProducts =
        typeof products === 'string' ? JSON.parse(products) : products;
    } catch (err) {
      console.error('Failed to parse products:', products);
    }

    try {
      // Step 1: Create the customer first (without customerCode)
      const createdCustomer = await this.prisma.customer.create({
        data: {
          ...customerData,
          products: parsedProducts,
          contacts: {
            create: contacts || [],
          },
          bankDetails: {
            create: bankDetails || [],
          },
        },
        include: {
          contacts: true,
          bankDetails: true,
        },
      });

      // Step 2: Generate MMYY part based on current date
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, '0'); // Month is zero-based
      const yy = String(now.getFullYear()).slice(-2);
      const mmYY = `${mm}${yy}`;

      // Step 3: Count how many customers have already been created this month
      const countForThisMonth = await this.prisma.customer.count({
        where: {
          customerCode: {
            startsWith: `${mmYY}-`,
          },
        },
      });

      // Step 4: Create the next sequence number
      const sequenceNumber = String(countForThisMonth + 1).padStart(5, '0');

      // Step 5: Final customerCode format
      const customerCode = `ENPL-CUS-${mmYY}-${sequenceNumber}`;

      // Step 6: Update the customer with the generated customerCode
      const updatedCustomer = await this.prisma.customer.update({
        where: { id: createdCustomer.id },
        data: { customerCode },
        include: {
          contacts: true,
          bankDetails: true,
        },
      });

      return updatedCustomer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

    // Count total number of customers
async countCustomers(): Promise<number> {
  return this.prisma.customer.count();
}

  // Get all Customers
  async findAll() {
    return this.prisma.customer.findMany({
      include: {
        contacts: true,
        bankDetails: true,
        Sites: true,
      },
    });
  }

  // Get a specific Customer by ID
  async findOne(id: number) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        contacts: true,
        bankDetails: true,
        Sites: true,
      },
    });
  }

  // Update Customer details
  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const { contacts, bankDetails, products, ...rest } =
      updateCustomerDto as any;

    // Begin transaction for safe updates
    return this.prisma.$transaction(async (prisma) => {
      // 1. Update main customer fields
      const updatedCustomer = await prisma.customer.update({
        where: { id },
        data: {
          ...rest,
          products: Array.isArray(products) ? products : undefined,
        },
      });

      // 2. Handle contacts update if provided
      if (contacts) {
        // Delete existing and recreate (can be optimized with upsert)
        await prisma.customerContact.deleteMany({ where: { customerId: id } });
        await prisma.customerContact.createMany({
          data: contacts.map((contact: any) => ({
            ...contact,
            customerId: id,
          })),
        });
      }

      // 3. Handle bankDetails update if provided
      if (bankDetails) {
        await prisma.customerBankDetail.deleteMany({
          where: { customerId: id } as any,
        });
        await prisma.customerBankDetail.createMany({
          data: bankDetails.map((bank: any) => ({
            ...bank,
            customerId: id,
          })),
        });
      }

      return prisma.customer.findUnique({
        where: { id },
        include: {
          contacts: true,
          bankDetails: true,
        },
      });
    });
  }

  // Delete a Customer
  async remove(id: number) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }
  
}
