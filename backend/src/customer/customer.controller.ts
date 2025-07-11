import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Put,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // Create a new customer
  @Post()
  @UseInterceptors(
    FileInterceptor('gstCertificate', {
      storage: diskStorage({
        destination: './uploads/gst-certificates',
        filename: (_req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new Error('Only PDF files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    try {
      const { contacts, bankDetails, ...customerData } = body;

      const parsedContacts = JSON.parse(contacts || '[]');
      const parsedBankDetails = JSON.parse(bankDetails || '[]');

      if (file) {
        customerData.gstpdf = file.filename;
      }

      return this.customerService.create({
        ...customerData,
        contacts: parsedContacts,
        bankDetails: parsedBankDetails,
      });
    } catch (error) {
      console.error('Error parsing customer form data:', error);
      throw new BadRequestException('Invalid customer data');
    }
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('gstCertificate', {
      storage: diskStorage({
        destination: './uploads/gst-certificates',
        filename: (_req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new Error('Only PDF files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    try {
      const { contacts, bankDetails, products, ...rest } = body;

      const parsedContacts = JSON.parse(contacts || '[]');
      const parsedBankDetails = JSON.parse(bankDetails || '[]');
      const parsedProducts = JSON.parse(products || '[]');

      if (file) {
        rest.gstpdf = file.filename;
      }

      return this.customerService.update(Number(id), {
        ...rest,
        contacts: parsedContacts,
        bankDetails: parsedBankDetails,
        products: parsedProducts,
      });
    } catch (error) {
      console.error('Error parsing update customer data:', error);
      throw new BadRequestException('Invalid customer data');
    }
  }

   @Get('/count')
  getTotalCustomers() {
    return this.customerService.countCustomers();
  }

  // Get all customers
  @Get()
  async findAll() {
    return this.customerService.findAll();
  }

  // Get a single customer by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.customerService.findOne(Number(id));
  }

  // Delete customer
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.customerService.remove(Number(id));
  }
}
