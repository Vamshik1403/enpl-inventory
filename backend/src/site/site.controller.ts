import { Controller, Get, Post, Body, Param, Delete, Put, BadRequestException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { SiteService } from './site.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  // Create a new site
  @Post()
  @UseInterceptors(
    FileInterceptor('gstpdf', {
      storage: diskStorage({
        destination: './uploads/gst-certificates',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
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
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    try {
      if (file) {
        body.gstpdf = file.filename;
      }
  
      const customerId = Number(body.customerId);
      if (isNaN(customerId)) {
        throw new BadRequestException('Invalid or missing customerId');
      }
  
      return this.siteService.create(body, customerId);
    } catch (error) {
      console.error('Error creating site:', error);
      throw new BadRequestException('Invalid site data');
    }
  }
  
// Update site details
@Put(':id')
@UseInterceptors(
  FileInterceptor('gstpdf', {
    storage: diskStorage({
      destination: './uploads/gst-certificates',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
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
async update(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
  @Body() updateSiteDto: any, // Accept raw body to modify
) {
  if (file) {
    updateSiteDto.gstpdf = file.filename;
  }

  return this.siteService.update(Number(id), updateSiteDto);
}


 @Get('/count')
  getTotalSites() {
    return this.siteService.countSites();
  }

   // Get sites by customer ID
   @Get('customer/:customerId')
   async findByCustomerId(@Param('customerId') customerId: string) {
     const parsedCustomerId = parseInt(customerId, 10);
     if (isNaN(parsedCustomerId)) {
       throw new Error('Invalid customer ID');
     }
     return this.siteService.findByCustomerId(parsedCustomerId);
   }

  // Get all sites
  @Get()
  async findAll() {
    return this.siteService.findAll();
  }

  // Get a single site by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.siteService.findOne(Number(id));
  }

  

  // Delete site
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.siteService.remove(Number(id));
  }
}
